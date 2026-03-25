import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Booking from '@/models/Booking';
import { sendBookingCancellation } from '@/lib/mail';


export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;

    const booking = await Booking.findById(id)
      .populate('hotel', 'name address images contactInfo amenities rating reviewCount location')
      .populate('user', 'name email phone');

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ booking }, { status: 200 });
  } catch (error: any) {
    console.error('Get booking error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch booking' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;

    const body = await req.json();

    const booking = await Booking.findByIdAndUpdate(
      id,
      { $set: body },
      { new: true, runValidators: true }
    )
      .populate('hotel', 'name address')
      .populate('user', 'name email');

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    // Send cancellation email if status changed to cancelled
    if (body.status === 'cancelled') {
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
        console.error('Failed to send cancellation email:', mailError);
      }
    }

    return NextResponse.json(
      { message: 'Booking updated successfully', booking },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Update booking error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update booking' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;

    const booking = await Booking.findByIdAndDelete(id);

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: 'Booking cancelled successfully' },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Delete booking error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to cancel booking' },
      { status: 500 }
    );
  }
}
