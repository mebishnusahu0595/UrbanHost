import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import Booking from '@/models/Booking';
import Hotel from '@/models/Hotel';

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user || (session.user as any).role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();

        // Helper to generate last 12 months labels
        const getLast12Months = () => {
            const months = [];
            for (let i = 11; i >= 0; i--) {
                const d = new Date();
                d.setMonth(d.getMonth() - i);
                months.push({
                    month: d.toLocaleString('default', { month: 'short' }),
                    year: d.getFullYear(),
                    key: `${d.getFullYear()}-${d.getMonth() + 1}` // For matching
                });
            }
            return months;
        };

        const yearMonths = getLast12Months();

        // --- Revenue & Bookings Trend (Last 12 Months) ---
        const twelveMonthsAgo = new Date();
        twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 11);
        twelveMonthsAgo.setDate(1); // Start of that month

        const revenueAggregation = await Booking.aggregate([
            {
                $match: {
                    createdAt: { $gte: twelveMonthsAgo },
                    paymentStatus: 'paid' // Consider paid bookings for revenue
                }
            },
            {
                $group: {
                    _id: {
                        year: { $year: "$createdAt" },
                        month: { $month: "$createdAt" }
                    },
                    totalRevenue: { $sum: "$totalPrice" },
                    bookingCount: { $sum: 1 }
                }
            }
        ]);

        const bookingAggregation = await Booking.aggregate([
            {
                $match: {
                    createdAt: { $gte: twelveMonthsAgo },
                    status: { $in: ['confirmed', 'completed', 'pending'] } // legitimate bookings
                }
            },
            {
                $group: {
                    _id: {
                        year: { $year: "$createdAt" },
                        month: { $month: "$createdAt" }
                    },
                    count: { $sum: 1 }
                }
            }
        ]);

        // Map aggregation results to the generated months array
        const revenueData = yearMonths.map(m => {
            const match = revenueAggregation.find(r => r._id.year === m.year && r._id.month === parseInt(m.key.split('-')[1]));
            return match ? match.totalRevenue : 0;
        });

        const bookingsData = yearMonths.map(m => {
            const match = bookingAggregation.find(r => r._id.year === m.year && r._id.month === parseInt(m.key.split('-')[1]));
            return match ? match.count : 0;
        });

        const labels = yearMonths.map(m => `${m.month} ${m.year}`);

        // --- Property Stats ---
        const propertyStats = await Hotel.aggregate([
            {
                $group: {
                    _id: "$status",
                    count: { $sum: 1 }
                }
            }
        ]);

        // Default values
        const propertyData = {
            approved: 0,
            pending: 0,
            rejected: 0
        };

        propertyStats.forEach(p => {
            if (p._id === 'approved') propertyData.approved = p.count;
            if (p._id === 'pending') propertyData.pending = p.count;
            if (p._id === 'rejected') propertyData.rejected = p.count;
        });


        return NextResponse.json({
            revenueChart: {
                labels,
                data: revenueData
            },
            bookingsChart: {
                labels,
                data: bookingsData
            },
            propertyChart: {
                labels: ['Active', 'Pending', 'Rejected'],
                data: [propertyData.approved, propertyData.pending, propertyData.rejected]
            }
        });

    } catch (error: any) {
        console.error("Error fetching chart data:", error);
        return NextResponse.json(
            { error: error.message || 'Failed to fetch chart data' },
            { status: 500 }
        );
    }
}
