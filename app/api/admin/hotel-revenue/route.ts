import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import Hotel from '@/models/Hotel';
import Booking from '@/models/Booking';

export async function GET(req: NextRequest) {
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

        const { searchParams } = new URL(req.url);
        const search = searchParams.get('search') || '';
        const city = searchParams.get('city') || '';
        const category = searchParams.get('category') || '';
        const startDate = searchParams.get('startDate');
        const endDate = searchParams.get('endDate');
        const sortBy = searchParams.get('sortBy') || 'revenue';
        const sortOrder = searchParams.get('sortOrder') || 'desc';

        // Build hotel filter
        const hotelFilter: any = { status: 'approved' };

        if (search) {
            hotelFilter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { 'address.city': { $regex: search, $options: 'i' } },
            ];
        }

        if (city) {
            hotelFilter['address.city'] = { $regex: city, $options: 'i' };
        }

        if (category) {
            hotelFilter.category = category;
        }

        // Get all approved hotels
        const hotels = await Hotel.find(hotelFilter)
            .populate('owner', 'name email')
            .lean();

        // Build booking filter for revenue calculation
        const bookingFilter: any = { 
          paymentStatus: 'paid',
          status: { $ne: 'cancelled' }
        };

        if (startDate) {
            bookingFilter.createdAt = { $gte: new Date(startDate) };
        }

        if (endDate) {
            bookingFilter.createdAt = {
                ...bookingFilter.createdAt,
                $lte: new Date(endDate)
            };
        }

        // Get hotel-wise revenue data (paid bookings only)
        const revenueData = await Booking.aggregate([
            { $match: bookingFilter },
            {
                $group: {
                    _id: '$hotel',
                    totalRevenue: { $sum: '$totalPrice' },
                    paidBookings: { $sum: 1 },
                    confirmedBookings: {
                        $sum: { $cond: [{ $eq: ['$status', 'confirmed'] }, 1, 0] }
                    },
                    completedBookings: {
                        $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
                    },
                    cancelledBookings: {
                        $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] }
                    }
                }
            }
        ]);

        // Get ALL bookings count (regardless of payment status)
        const allBookingsFilter: any = {};
        if (startDate) {
            allBookingsFilter.createdAt = { $gte: new Date(startDate) };
        }
        if (endDate) {
            allBookingsFilter.createdAt = {
                ...allBookingsFilter.createdAt,
                $lte: new Date(endDate)
            };
        }

        const allBookingsData = await Booking.aggregate([
            { $match: allBookingsFilter },
            {
                $group: {
                    _id: '$hotel',
                    totalBookings: { $sum: 1 }
                }
            }
        ]);

        // Create revenue map
        const revenueMap = new Map(
            revenueData.map((item: any) => [item._id.toString(), item])
        );

        // Create all bookings map
        const allBookingsMap = new Map(
            allBookingsData.map((item: any) => [item._id.toString(), item.totalBookings])
        );

        // Get monthly revenue trend for each hotel (last 6 months)
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        const monthlyRevenue = await Booking.aggregate([
            {
                $match: {
                    paymentStatus: 'paid',
                    status: { $ne: 'cancelled' },
                    createdAt: { $gte: sixMonthsAgo }
                }
            },
            {
                $group: {
                    _id: {
                        hotel: '$hotel',
                        year: { $year: '$createdAt' },
                        month: { $month: '$createdAt' }
                    },
                    revenue: { $sum: '$totalPrice' },
                    bookings: { $sum: 1 }
                }
            },
            { $sort: { '_id.year': 1, '_id.month': 1 } }
        ]);

        // Group monthly data by hotel
        const monthlyRevenueMap = new Map();
        monthlyRevenue.forEach((item: any) => {
            const hotelId = item._id.hotel.toString();
            if (!monthlyRevenueMap.has(hotelId)) {
                monthlyRevenueMap.set(hotelId, []);
            }
            monthlyRevenueMap.get(hotelId).push({
                year: item._id.year,
                month: item._id.month,
                revenue: item.revenue,
                bookings: item.bookings
            });
        });

        // Combine hotel data with revenue
        const hotelsWithRevenue = hotels.map((hotel: any) => {
            const hotelId = hotel._id.toString();
            const revenue = revenueMap.get(hotelId) || {
                totalRevenue: 0,
                paidBookings: 0,
                confirmedBookings: 0,
                completedBookings: 0,
                cancelledBookings: 0
            };

            const totalBookings = allBookingsMap.get(hotelId) || 0;
            const monthlyData = monthlyRevenueMap.get(hotelId) || [];

            // Calculate growth (compare last month to previous month)
            let growth = 0;
            if (monthlyData.length >= 2) {
                const lastMonth = monthlyData[monthlyData.length - 1]?.revenue || 0;
                const prevMonth = monthlyData[monthlyData.length - 2]?.revenue || 0;
                if (prevMonth > 0) {
                    growth = ((lastMonth - prevMonth) / prevMonth) * 100;
                }
            } else if (monthlyData.length === 1 && monthlyData[0].revenue > 0) {
                // If only one month of data, show positive growth
                growth = 100;
            }

            return {
                _id: hotel._id,
                name: hotel.name,
                category: hotel.category,
                address: hotel.address,
                images: hotel.images,
                rating: hotel.rating,
                totalReviews: hotel.totalReviews,
                owner: hotel.owner,
                totalRevenue: revenue.totalRevenue,
                totalBookings: totalBookings, // Use ALL bookings count
                confirmedBookings: revenue.confirmedBookings,
                completedBookings: revenue.completedBookings,
                cancelledBookings: revenue.cancelledBookings,
                monthlyRevenue: monthlyData,
                growth: Math.round(growth * 10) / 10
            };
        });

        // Sort hotels
        hotelsWithRevenue.sort((a: any, b: any) => {
            let compareValue = 0;
            switch (sortBy) {
                case 'revenue':
                    compareValue = (a.totalRevenue || 0) - (b.totalRevenue || 0);
                    break;
                case 'bookings':
                    compareValue = (a.totalBookings || 0) - (b.totalBookings || 0);
                    break;
                case 'name':
                    compareValue = a.name.localeCompare(b.name);
                    break;
                case 'growth':
                    compareValue = (a.growth || 0) - (b.growth || 0);
                    break;
                default:
                    compareValue = (a.totalRevenue || 0) - (b.totalRevenue || 0);
            }
            return sortOrder === 'desc' ? -compareValue : compareValue;
        });

        // Calculate overall stats
        const totalRevenue = hotelsWithRevenue.reduce((sum: number, h: any) => sum + h.totalRevenue, 0);
        const totalBookings = hotelsWithRevenue.reduce((sum: number, h: any) => sum + h.totalBookings, 0);
        const averageRevenue = hotelsWithRevenue.length > 0 ? totalRevenue / hotelsWithRevenue.length : 0;
        const topPerformer = hotelsWithRevenue[0]?.name || 'N/A';

        // Get unique cities for filter dropdown
        const cities = [...new Set(hotels.map((h: any) => h.address?.city).filter(Boolean))];

        // Get unique categories for filter dropdown
        const categories = [...new Set(hotels.map((h: any) => h.category).filter(Boolean))];

        return NextResponse.json({
            hotels: hotelsWithRevenue,
            stats: {
                totalRevenue,
                totalBookings,
                averageRevenue,
                topPerformer,
                totalHotels: hotelsWithRevenue.length
            },
            filters: {
                cities,
                categories
            }
        }, { status: 200 });

    } catch (error: any) {
        console.error('Hotel revenue API error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to fetch hotel revenue data' },
            { status: 500 }
        );
    }
}
