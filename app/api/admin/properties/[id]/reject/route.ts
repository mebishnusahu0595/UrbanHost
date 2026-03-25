import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import Hotel from '@/models/Hotel';
import User from '@/models/User';
import { sendRejectionEmail } from '@/lib/mail';

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

        const property = await Hotel.findById(propertyId).populate('owner');
        if (!property) {
            return NextResponse.json({ error: 'Property not found' }, { status: 404 });
        }

        const body = await req.json();
        const { reason } = body;

        property.status = 'rejected';
        (property as any).rejectionReason = reason;
        await property.save();

        // Send email notification
        try {
            const owner = property.owner as any;
            const email = owner?.email || property.contactInfo?.email;
            const name = owner?.name || 'Property Owner';

            if (email) {
                await sendRejectionEmail(email, name, property.name, reason);
            }
        } catch (emailError) {
            console.error('Failed to send rejection email:', emailError);
        }

        return NextResponse.json({
            success: true,
            message: 'Property rejected and email sent',
        });

    } catch (error: any) {
        console.error('Error rejecting property:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
