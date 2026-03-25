import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import Hotel from '@/models/Hotel';
import Booking from '@/models/Booking';
import User from '@/models/User';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user is admin from session (JWT contains role)
    const sessionRole = (session.user as any).role;
    if (sessionRole !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }

    await dbConnect();

    // Parse time range from query params
    const { searchParams } = new URL(req.url);
    const range = searchParams.get('range') || '30d'; // default to 30 days

    let startDate = new Date();
    let prevStartDate = new Date();
    let prevEndDate = new Date();

    // Calculate date ranges
    const now = new Date();

    switch (range) {
      case '1y':
        startDate.setFullYear(now.getFullYear() - 1);
        prevStartDate.setFullYear(now.getFullYear() - 2);
        prevEndDate.setFullYear(now.getFullYear() - 1);
        break;
      case '1m': // 30 days
        startDate.setDate(now.getDate() - 30);
        prevStartDate.setDate(now.getDate() - 60);
        prevEndDate.setDate(now.getDate() - 30);
        break;
      case '1w': // 7 days
        startDate.setDate(now.getDate() - 7);
        prevStartDate.setDate(now.getDate() - 14);
        prevEndDate.setDate(now.getDate() - 7);
        break;
      case '1d': // 24 hours
        startDate.setHours(now.getHours() - 24);
        prevStartDate.setHours(now.getHours() - 48);
        prevEndDate.setHours(now.getHours() - 24);
        break;
      case 'all':
        startDate = new Date(0); // Beginning of time
        prevStartDate = new Date(0);
        prevEndDate = new Date(0);
        break;
      default: // Default to 30 days
        startDate.setDate(now.getDate() - 30);
        prevStartDate.setDate(now.getDate() - 60);
        prevEndDate.setDate(now.getDate() - 30);
    }

    // Common filter for date range
    const dateFilter = range === 'all' ? {} : { createdAt: { $gte: startDate } };
    const prevDateFilter = range === 'all' ? { createdAt: { $lt: new Date(0) } } : { createdAt: { $gte: prevStartDate, $lt: prevEndDate } };

    await dbConnect();

    // Get statistics with date filter
    const totalHotels = await Hotel.countDocuments(dateFilter); // Total hotels registered in period? Or just total? Usually "Total Hotels" implies inventory size. Let's keep inventory as snapshot, but maybe filter "New Hotels"? 
    // User asked "uske according niche ka sab dikhe" - usually means activity metrics. Startups often treat "Total X" as "Accumulated", but in a dashboard with time filter, it implies "New X in this period". 
    // However, "Available Rooms" is definitely a current snapshot. 
    // Let's filter "Total Hotels" as "New Hotels" in this period to be consistent with "1 week" view.
    // If range is 'all', it's total.

    // Re-evaluating: "Total Hotels" might be confusing if it shows 0 for "1 day". 
    // But "Total Revenue" and "Total Bookings" definitely need to be filtered. 
    // Let's filter bookings, users, and revenue. Hotels/Properties might be static "Inventory" or "New Onboarded". 
    // I will filter "New Hotels" (createdAt) for consistency, but keep "Available Rooms" as snapshot because that's "Current Status".

    const countHotelsFilter = range === 'all' ? {} : dateFilter;
    const statsHotels = await Hotel.countDocuments(countHotelsFilter); // New hotels in period
    const approvedHotels = await Hotel.countDocuments({ ...countHotelsFilter, status: 'approved' });
    const pendingHotels = await Hotel.countDocuments({ ...countHotelsFilter, status: 'pending' }); // This might be "Pending hotels created in this period"

    // For "Active Guests", it's a current snapshot. Time range doesn't apply well. 
    // User said "uske according niche ka sab dikhe". 
    // If I select "Last 1 Year", Active Guests is still "Currently Active". 
    // I will keep Active Guests as snapshot (right now).
    const currentActiveGuests = await Booking.countDocuments({
      status: 'confirmed',
      checkInDate: { $lte: new Date() },
      checkOutDate: { $gte: new Date() }
    });

    const totalBookings = await Booking.countDocuments(dateFilter);
    const confirmedBookings = await Booking.countDocuments({ ...dateFilter, status: 'confirmed' });
    const pendingBookings = await Booking.countDocuments({ ...dateFilter, status: 'pending' });

    const totalUsers = await User.countDocuments(dateFilter); // New users
    const propertyOwners = await User.countDocuments({ ...dateFilter, role: 'propertyOwner' });

    // Calculate revenue (exclude cancelled)
    const revenueData = await Booking.aggregate([
      {
        $match: {
          paymentStatus: 'paid',
          status: { $ne: 'cancelled' },
          ...dateFilter
        }
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$totalPrice' }
        }
      }
    ]);

    // Calculate previous period for growth
    const prevRevenueData = await Booking.aggregate([
      {
        $match: {
          paymentStatus: 'paid',
          status: { $ne: 'cancelled' },
          ...prevDateFilter
        }
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$totalPrice' }
        }
      }
    ]);

    const totalRevenue = revenueData.length > 0 ? revenueData[0].totalRevenue : 0;
    const prevRevenue = prevRevenueData.length > 0 ? prevRevenueData[0].totalRevenue : 0;
    const revenueGrowth = prevRevenue > 0 ? ((totalRevenue - prevRevenue) / prevRevenue) * 100 : 0;

    // Calculate bookings growth
    const prevBookings = await Booking.countDocuments(prevDateFilter);
    const bookingsGrowth = prevBookings > 0 ? ((totalBookings - prevBookings) / prevBookings) * 100 : 0;

    // Calculate users growth
    const prevUsers = await User.countDocuments(prevDateFilter);
    const usersGrowth = prevUsers > 0 ? ((totalUsers - prevUsers) / prevUsers) * 100 : 0;

    // Available rooms (Snapshot, not filtered by creation date)
    // We need total approved hotels (all time) for this calculation
    const allApprovedHotels = await Hotel.countDocuments({ status: 'approved' });
    const availableRooms = allApprovedHotels > 0 ? Math.max(0, allApprovedHotels * 10 - currentActiveGuests) : 0;

    // Get recent bookings (filtered by date)
    const recentBookings = await Booking.find(dateFilter)
      .populate('hotel', 'name')
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .limit(5);

    // Get monthly revenue (last 12 months, exclude cancelled) - Keep these charts data as is or filter?
    // Charts usually show fixed history (Last 12M, Last 30D etc). The cards aggregate this.
    // The instructions say "Revenue Analysis" default to "Daily". 
    // The chart data is fetched separately here. I will leave the chart data helpers (monthlyRevenue, weeklyRevenue, dailyRevenue) 
    // generally fixed (or covering a wide enough range) so the frontend can choose what to show, 
    // OR I could filter them too? The frontend Chart component (`RevenueChart`) currently receives all three datasets.
    // I'll keep them as "History" datasets. The "Filter" applies to the Cards/Summary stats.

    const monthlyRevenue = await Booking.aggregate([
      {
        $match: {
          paymentStatus: 'paid',
          status: { $ne: 'cancelled' },
          createdAt: {
            $gte: new Date(new Date().setMonth(new Date().getMonth() - 12))
          }
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

    const weeklyRevenue = await Booking.aggregate([
      {
        $match: {
          paymentStatus: 'paid',
          status: { $ne: 'cancelled' },
          createdAt: {
            $gte: new Date(new Date().setDate(new Date().getDate() - 56))
          }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            week: { $week: '$createdAt' }
          },
          revenue: { $sum: '$totalPrice' },
          bookings: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.week': 1 } }
    ]);

    const dailyRevenue = await Booking.aggregate([
      {
        $match: {
          paymentStatus: 'paid',
          status: { $ne: 'cancelled' },
          createdAt: {
            $gte: new Date(new Date().setDate(new Date().getDate() - 30))
          }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' }
          },
          revenue: { $sum: '$totalPrice' },
          bookings: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
    ]);

    return NextResponse.json({
      stats: {
        totalHotels: statsHotels,
        approvedHotels,
        pendingHotels,
        totalBookings,
        confirmedBookings,
        pendingBookings,
        activeGuests: currentActiveGuests,
        availableRooms,
        totalUsers,
        propertyOwners,
        totalRevenue,
        revenueGrowth: Math.round(revenueGrowth * 10) / 10,
        bookingsGrowth: Math.round(bookingsGrowth * 10) / 10,
        usersGrowth: Math.round(usersGrowth * 10) / 10,
      },
      recentBookings,
      monthlyRevenue,
      weeklyRevenue,
      dailyRevenue,
    }, { status: 200 });
  } catch (error: any) {
    console.error('Dashboard stats error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch dashboard stats' },
      { status: 500 }
    );
  }
}
