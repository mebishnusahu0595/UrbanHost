import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { sendReceptionistCredentials } from '@/lib/mail';
import { generateHotelPassword } from '@/lib/utils';

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const session = await getServerSession(authOptions);

        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userRole = (session.user as any).role;

        if (userRole !== 'admin') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        await dbConnect();

        const receptionist = await User.findById(id).populate('assignedHotel', 'name');

        if (!receptionist) {
            return NextResponse.json({ error: 'Receptionist not found' }, { status: 404 });
        }

        if (receptionist.role !== 'receptionist') {
            return NextResponse.json({ error: 'User is not a receptionist' }, { status: 400 });
        }

        // Generate new password based on hotel name
        const hotelName = (receptionist.assignedHotel as any)?.name || 'hotel';
        const newPassword = generateHotelPassword(hotelName);

        // Update password
        receptionist.password = newPassword;
        await receptionist.save();

        // Send credentials email
        try {
            await sendReceptionistCredentials(
                receptionist.email,
                receptionist.name,
                newPassword,
                receptionist.assignedHotel?._id?.toString() || ''
            );
        } catch (emailError) {
            console.error('Failed to send email:', emailError);
            return NextResponse.json({
                success: false,
                error: 'Password updated but failed to send email'
            }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            message: 'Credentials sent successfully'
        });

    } catch (error: any) {
        console.error('Resend credentials error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
