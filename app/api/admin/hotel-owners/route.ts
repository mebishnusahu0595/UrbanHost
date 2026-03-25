import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import Hotel from '@/models/Hotel';
import bcrypt from 'bcryptjs';
import { sendHotelOwnerCredentials } from '@/lib/mail';

// GET - List all hotel owners
export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const sessionRole = (session.user as any).role;
        if (sessionRole !== 'admin') {
            return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
        }

        await dbConnect();

        // Fetch both hotelOwner and propertyOwner roles
        const users = await User.find({ 
            role: { $in: ['hotelOwner', 'propertyOwner'] } 
        })
            .select('-password')
            .populate('assignedHotels', 'name address images')
            .sort({ createdAt: -1 })
            .lean();

        // For propertyOwners, fetch their owned properties
        const hotelOwners = await Promise.all(users.map(async (user: any) => {
            if (user.role === 'propertyOwner') {
                // Fetch properties where this user is the owner
                const ownedProperties = await Hotel.find({ owner: user._id })
                    .select('name address images')
                    .lean();
                
                // Merge owned properties with assignedHotels
                return {
                    ...user,
                    assignedHotels: [...(user.assignedHotels || []), ...ownedProperties],
                    isPropertyOwner: true,
                };
            }
            return {
                ...user,
                isPropertyOwner: false,
            };
        }));

        return NextResponse.json({ hotelOwners }, { status: 200 });
    } catch (error: any) {
        console.error('Get hotel owners error:', error);
        return NextResponse.json({ error: error.message || 'Failed to fetch hotel owners' }, { status: 500 });
    }
}

// POST - Create a new hotel owner
export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const sessionRole = (session.user as any).role;
        if (sessionRole !== 'admin') {
            return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
        }

        await dbConnect();

        const body = await req.json();
        const { name, email, password, phone, assignedHotels, canEditHotels } = body;

        if (!name || !email || !password) {
            return NextResponse.json({ error: 'Name, email and password are required' }, { status: 400 });
        }

        // Check if email already exists
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return NextResponse.json({ error: 'Email already registered' }, { status: 400 });
        }

        // Hash password manually
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Use insertMany to bypass pre-save hook (which would double-hash)
        const [hotelOwner] = await User.insertMany([{
            name,
            email: email.toLowerCase(),
            password: hashedPassword,
            phone,
            role: 'hotelOwner',
            assignedHotels: assignedHotels || [],
            canEditHotels: canEditHotels || false,
            isEmailVerified: true, // Admin-created accounts are verified
        }], { lean: false });

        // Return without password
        const ownerResponse = await User.findById(hotelOwner._id)
            .select('-password')
            .populate('assignedHotels', 'name address images');

        // Send credentials email
        try {
            await sendHotelOwnerCredentials(
                email,
                name,
                password,
                canEditHotels ? 'edit' : 'view'
            );
        } catch (emailError) {
            console.error('Failed to send email:', emailError);
            // Don't fail the request if email fails
        }

        return NextResponse.json({
            message: 'Hotel owner created successfully',
            hotelOwner: ownerResponse
        }, { status: 201 });
    } catch (error: any) {
        console.error('Create hotel owner error:', error);
        return NextResponse.json({ error: error.message || 'Failed to create hotel owner' }, { status: 500 });
    }
}

// PUT - Update hotel owner (assign hotels, change password)
export async function PUT(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const sessionRole = (session.user as any).role;
        if (sessionRole !== 'admin') {
            return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
        }

        await dbConnect();

        const body = await req.json();
        const { userId, name, phone, assignedHotels, newPassword, canEditHotels } = body;

        if (!userId) {
            return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
        }

        const hotelOwner = await User.findById(userId);
        if (!hotelOwner || (hotelOwner.role !== 'hotelOwner' && hotelOwner.role !== 'propertyOwner')) {
            return NextResponse.json({ error: 'Hotel owner not found' }, { status: 404 });
        }

        // Update fields
        if (name) hotelOwner.name = name;
        if (phone) hotelOwner.phone = phone;
        if (assignedHotels) hotelOwner.assignedHotels = assignedHotels;
        if (canEditHotels !== undefined) hotelOwner.canEditHotels = canEditHotels;

        // Update password if provided - hash manually and skip pre-save hook
        if (newPassword) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(newPassword, salt);
            // Update directly to bypass pre-save hook
            await User.updateOne(
                { _id: userId },
                { $set: { password: hashedPassword } }
            );
        }

        // Save other changes
        if (name || phone || assignedHotels || canEditHotels !== undefined) {
            await hotelOwner.save();
        }

        const updatedOwner = await User.findById(hotelOwner._id)
            .select('-password')
            .populate('assignedHotels', 'name address images');

        return NextResponse.json({
            message: 'Hotel owner updated successfully',
            hotelOwner: updatedOwner
        }, { status: 200 });
    } catch (error: any) {
        console.error('Update hotel owner error:', error);
        return NextResponse.json({ error: error.message || 'Failed to update hotel owner' }, { status: 500 });
    }
}

// DELETE - Delete a hotel owner
export async function DELETE(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const sessionRole = (session.user as any).role;
        if (sessionRole !== 'admin') {
            return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
        }

        await dbConnect();

        const { searchParams } = new URL(req.url);
        const userId = searchParams.get('userId');

        if (!userId) {
            return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
        }

        const hotelOwner = await User.findById(userId);
        if (!hotelOwner || (hotelOwner.role !== 'hotelOwner' && hotelOwner.role !== 'propertyOwner')) {
            return NextResponse.json({ error: 'Hotel owner not found' }, { status: 404 });
        }

        await User.findByIdAndDelete(userId);

        return NextResponse.json({ message: 'Hotel owner deleted successfully' }, { status: 200 });
    } catch (error: any) {
        console.error('Delete hotel owner error:', error);
        return NextResponse.json({ error: error.message || 'Failed to delete hotel owner' }, { status: 500 });
    }
}
