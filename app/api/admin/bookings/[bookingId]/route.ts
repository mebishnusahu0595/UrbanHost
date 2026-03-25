import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import Booking from '@/models/Booking';
import { sendBookingCancellation } from '@/lib/mail';


export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ bookingId: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        const { bookingId } = await params;

        if (!session || !session.user || (session.user as any).role !== 'admin') {
            return NextResponse.json(
                { error: 'Unauthorized - Admin access required' },
                { status: 401 }
            );
        }

        await dbConnect();

        const body = await req.json();
        const { status } = body;

        if (!status) {
            return NextResponse.json(
                { error: 'Status is required' },
                { status: 400 }
            );
        }

        const booking = await Booking.findByIdAndUpdate(
            bookingId,
            { status },
            { new: true }
        )
            .populate('user', 'name email')
            .populate('hotel', 'name');

        if (!booking) {
            return NextResponse.json(
                { error: 'Booking not found' },
                { status: 404 }
            );
        }

        // Send cancellation email if status changed to cancelled
        if (status === 'cancelled') {
            try {
                await sendBookingCancellation(
                    booking.guestInfo?.email || (booking.user as any)?.email,
                    booking.guestInfo?.name || (booking.user as any)?.name,
                    booking._id.toString(),
                    (booking.hotel as any)?.name || 'Hotel',
                    booking.checkInDate,
                    booking.checkOutDate,
                    booking.totalPrice,
                    booking.roomType
                );
            } catch (mailError) {
                console.error('Failed to send cancellation email (admin):', mailError);
            }
        }


        return NextResponse.json({
            message: 'Booking status updated successfully',
            booking
        }, { status: 200 });
    } catch (error: any) {
        console.error('Admin update booking error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to update booking' },
            { status: 500 }
        );
    }
}
