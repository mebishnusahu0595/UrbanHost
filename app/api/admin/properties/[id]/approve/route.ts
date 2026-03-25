import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import Hotel from '@/models/Hotel';
import User from '@/models/User';
import { sendApprovalWithCredentials, sendReApprovalEmail, sendPropertyLiveEmail } from '@/lib/mail';
import { generateUrbanHostEmail, generateHotelPassword } from '@/lib/utils';


export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: propertyId } = await params;
        const session = await getServerSession(authOptions);

        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const sessionRole = (session.user as any).role;
        if (sessionRole !== 'admin') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        await dbConnect();

        // Find the property
        const property = await Hotel.findById(propertyId).populate('owner');
        if (!property) {
            return NextResponse.json({ error: 'Property not found' }, { status: 404 });
        }

        if (property.status === 'approved') {
            return NextResponse.json({ error: 'Property already approved' }, { status: 400 });
        }

        // Get owner details from property
        const populatedOwner = property.owner as any;
        let ownerEmail = property.contactInfo?.email;
        let ownerName = populatedOwner?.name || property.name || 'Property Owner';

        // Generate custom UrbanHost email and password
        const urbanHostEmail = generateUrbanHostEmail(ownerName);
        const hotelPassword = generateHotelPassword(property.name);

        // CRITICAL: Check if user exists by EMAIL, not by property.owner reference
        // Because property.owner might be set during submission but actual User account may not exist yet
        let user = null;
        if (ownerEmail) {
            user = await User.findOne({ email: ownerEmail });
        }
        
        // If no user found by email, try by ID (fallback for old data)
        if (!user && property.owner) {
            user = await User.findById(property.owner);
        }

        let generatedPassword = '';
        let isNewUser = false;
        let isFirstTimePropertyOwner = false;
        
        if (!user) {
            isNewUser = true;
            isFirstTimePropertyOwner = true;
            // Create a new user account for the property owner
            generatedPassword = hotelPassword;
            // Use contact email if available, otherwise fallback to generated
            const emailToUse = ownerEmail || urbanHostEmail;

            user = new User({
                name: ownerName,
                email: emailToUse,
                password: generatedPassword,
                role: 'propertyOwner',
                isEmailVerified: true,
            });
            await user.save();

            // Update property with new owner reference
            property.owner = user._id;
            ownerEmail = emailToUse;
        } else {
            // If user exists but is not a property owner, update role and send credentials
            if (user.role !== 'propertyOwner' && user.role !== 'admin') {
                user.role = 'propertyOwner';
                await user.save();
                
                // This is first time becoming a property owner, generate and update password
                isFirstTimePropertyOwner = true;
                generatedPassword = hotelPassword;
                user.password = generatedPassword;
                await user.save();
            } else if (user.role === 'propertyOwner') {
                // Check if this user has ever had an APPROVED property before
                const hasApprovedProperty = await Hotel.findOne({
                    owner: user._id,
                    status: 'approved',
                    _id: { $ne: propertyId } // exclude current property
                });
                
                // If no other approved properties exist, this is their first approval
                if (!hasApprovedProperty) {
                    isFirstTimePropertyOwner = true;
                    generatedPassword = hotelPassword;
                    user.password = generatedPassword;
                    await user.save();
                }
            }

            // Use their existing email and name
            ownerEmail = user.email || urbanHostEmail;
            ownerName = user.name;
        }

        const previousStatus = property.status;

        // Update property status to approved
        property.status = 'approved';
        await property.save();

        // Validate email before sending
        console.log('=== APPROVAL EMAIL DEBUG ===');
        console.log('Attempting to send email to:', ownerEmail);
        console.log('Owner name:', ownerName);
        console.log('Property name:', property.name);
        console.log('isNewUser:', isNewUser);
        console.log('isFirstTimePropertyOwner:', isFirstTimePropertyOwner);
        console.log('previousStatus:', previousStatus);
        console.log('generatedPassword:', generatedPassword || '(none)');
        console.log('===========================');

        if (!ownerEmail || ownerEmail.trim() === '') {
            if (property.contactInfo?.email) {
                ownerEmail = property.contactInfo.email;
            } else if (user?.email) {
                ownerEmail = user.email;
            }

            if (!ownerEmail || ownerEmail.trim() === '') {
                console.error('ERROR: No valid email address found for property owner');
                return NextResponse.json({
                    success: false,
                    error: 'Property approved but email not sent - no valid email address found',
                    message: 'Please manually provide credentials to the property owner'
                }, { status: 200 });
            }
        }

        // Send appropriate email based on state
        try {
            if (isNewUser || isFirstTimePropertyOwner) {
                // Send credentials for new users OR existing users who are becoming property owners for first time
                await sendApprovalWithCredentials(ownerEmail, ownerName, generatedPassword, property.name);
                console.log('✅ Credentials email sent successfully to:', ownerEmail);
            } else if (previousStatus === 'rejected') {
                await sendReApprovalEmail(ownerEmail, ownerName, property.name);
                console.log('✅ Re-approval email sent successfully to:', ownerEmail);
            } else {
                // For existing users whose properties were pending/draft
                await sendPropertyLiveEmail(ownerEmail, ownerName, property.name);
                console.log('✅ Approval notification sent to existing owner:', ownerEmail);
            }
        } catch (emailError) {
            console.error('Failed to send approval email:', emailError);
        }

        return NextResponse.json({
            success: true,
            message: 'Property approved successfully',
            email: ownerEmail,
            password: generatedPassword, // Return password so admin can see/share it if needed
            propertyName: property.name,
        });

    } catch (error: any) {
        console.error('Error approving property:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
