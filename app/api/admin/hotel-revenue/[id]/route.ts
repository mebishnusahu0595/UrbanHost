import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import Hotel from '@/models/Hotel';
import Booking from '@/models/Booking';

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Check if user is admin
        const sessionRole = (session.user as any).role;
        if (sessionRole !== 'admin') {
            return NextResponse.json(
                { error: 'Forbidden - Admin access required' },
                { status: 403 }
            );
        }

        await dbConnect();

        const { id } = await params;

        // Get hotel details
        const hotel = await Hotel.findById(id)
            .populate('owner', 'name email phone')
            .lean();

        if (!hotel) {
            return NextResponse.json(
                { error: 'Hotel not found' },
                { status: 404 }
            );
        }

        // Get revenue data for this hotel
        const revenueData = await Booking.aggregate([
            { $match: { hotel: hotel._id, paymentStatus: 'paid' } },
            {
                $group: {
                    _id: null,
                    totalRevenue: { $sum: '$totalPrice' },
                    totalBookings: { $sum: 1 },
                    confirmedBookings: {
                        $sum: { $cond: [{ $eq: ['$status', 'confirmed'] }, 1, 0] }
                    },
                    completedBookings: {
                        $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
                    },
                    cancelledBookings: {
                        $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] }
                    },
                    pendingBookings: {
                        $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
                    }
                }
            }
        ]);

        // Get monthly revenue for the last 6 months
        const monthlyRevenue = await Booking.aggregate([
            {
                $match: {
                    hotel: hotel._id,
                    paymentStatus: 'paid',
                    createdAt: { $gte: new Date(new Date().setMonth(new Date().getMonth() - 6)) }
                }
            },
            {
                $group: {
                    _id: {
                        year: { $year: '$createdAt' },
                        month: { $month: '$createdAt' }
                    },
                    revenue: { $sum: '$totalPrice' },
                    bookings: { $sum: 1 }
                }
            },
            { $sort: { '_id.year': 1, '_id.month': 1 } }
        ]);

        // Get recent bookings
        const recentBookings = await Booking.find({ hotel: hotel._id })
            .populate('user', 'name email')
            .sort({ createdAt: -1 })
            .limit(10)
            .lean();

        // Calculate growth
        let growth = 0;
        if (monthlyRevenue.length >= 2) {
            const lastMonth = monthlyRevenue[monthlyRevenue.length - 1]?.revenue || 0;
            const prevMonth = monthlyRevenue[monthlyRevenue.length - 2]?.revenue || 0;
            if (prevMonth > 0) {
                growth = ((lastMonth - prevMonth) / prevMonth) * 100;
            }
        }

        const revenue = revenueData.length > 0 ? revenueData[0] : {
            totalRevenue: 0,
            totalBookings: 0,
            confirmedBookings: 0,
            completedBookings: 0,
            cancelledBookings: 0,
            pendingBookings: 0
        };

        const hotelWithRevenue = {
            ...hotel,
            totalRevenue: revenue.totalRevenue,
            totalBookings: revenue.totalBookings,
            confirmedBookings: revenue.confirmedBookings,
            completedBookings: revenue.completedBookings,
            cancelledBookings: revenue.cancelledBookings,
            pendingBookings: revenue.pendingBookings,
            monthlyRevenue: monthlyRevenue.map((m: any) => ({
                year: m._id.year,
                month: m._id.month,
                revenue: m.revenue,
                bookings: m.bookings
            })),
            recentBookings,
            growth: Math.round(growth * 10) / 10
        };

        return NextResponse.json({
            hotel: hotelWithRevenue
        }, { status: 200 });

    } catch (error: any) {
        console.error('Hotel revenue detail API error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to fetch hotel details' },
            { status: 500 }
        );
    }
}
