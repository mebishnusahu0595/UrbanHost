import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import Booking from '@/models/Booking';

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: bookingId } = await params;
        const session = await getServerSession(authOptions);

        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userRole = (session.user as any).role;
        const userId = (session.user as any).id;

        // Only admin, receptionist, and propertyOwner can mark check-in
        if (!['admin', 'receptionist', 'propertyOwner'].includes(userRole)) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        await dbConnect();

        const booking = await Booking.findById(bookingId).populate('hotel');

        if (!booking) {
            return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
        }

        // If receptionist, verify they're assigned to this hotel
        if (userRole === 'receptionist') {
            const user = await (await import('@/models/User')).default.findById(userId);
            if (!user?.assignedHotel || user.assignedHotel.toString() !== booking.hotel._id.toString()) {
                return NextResponse.json({ error: 'Not authorized for this hotel' }, { status: 403 });
            }
        }

        // Mark as checked in
        booking.checkedIn = true;
        booking.checkedInAt = new Date();
        booking.checkedInBy = userId;
        await booking.save();

        return NextResponse.json({
            success: true,
            message: 'Guest checked in successfully',
            booking
        });

    } catch (error: any) {
        console.error('Check-in error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// Undo check-in
export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: bookingId } = await params;
        const session = await getServerSession(authOptions);

        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userRole = (session.user as any).role;

        // Only admin can undo check-in
        if (userRole !== 'admin') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        await dbConnect();

        const booking = await Booking.findById(bookingId);

        if (!booking) {
            return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
        }

        // Undo check-in
        booking.checkedIn = false;
        booking.checkedInAt = undefined;
        booking.checkedInBy = undefined;
        await booking.save();

        return NextResponse.json({
            success: true,
            message: 'Check-in undone successfully',
            booking
        });

    } catch (error: any) {
        console.error('Undo check-in error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
