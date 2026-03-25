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

    await dbConnect();

    // Check if user is propertyOwner
    const user = await User.findOne({ email: session.user.email });
    if (!user || !['propertyOwner', 'hotelOwner'].includes(user.role)) {
      return NextResponse.json(
        { error: 'Forbidden - Property Owner access required' },
        { status: 403 }
      );
    }

    // Get all property IDs for this owner
    let hotelIds: any[] = [];

    if (user.role === 'hotelOwner' && user.assignedHotels && user.assignedHotels.length > 0) {
      // For hotel owners, use assigned hotels
      hotelIds = user.assignedHotels;
      console.log('Hotel Owner - Assigned hotels:', hotelIds);
    } else {
      // For property owners, use hotels where they are the owner
      const ownerHotels = await Hotel.find({ owner: user._id }).select('_id');
      hotelIds = ownerHotels.map(h => h._id);
      console.log('Property Owner - Owned hotels:', hotelIds);
    }

    console.log('Total hotel IDs for earnings calculation:', hotelIds.length);

    // Calculate total earnings (exclude cancelled bookings)
    const totalEarningsData = await Booking.aggregate([
      {
        $match: {
          hotel: { $in: hotelIds },
          paymentStatus: 'paid',
          status: { $ne: 'cancelled' }
        }
      },
      {
        $group: {
          _id: null,
          totalEarnings: { $sum: '$totalPrice' }
        }
      }
    ]);

    const totalEarnings = totalEarningsData.length > 0 ? totalEarningsData[0].totalEarnings : 0;

    // This month's earnings
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const thisMonthData = await Booking.aggregate([
      {
        $match: {
          hotel: { $in: hotelIds },
          paymentStatus: 'paid',
          status: { $ne: 'cancelled' },
          createdAt: { $gte: firstDayOfMonth }
        }
      },
      {
        $group: {
          _id: null,
          thisMonthEarnings: { $sum: '$totalPrice' }
        }
      }
    ]);

    const thisMonthEarnings = thisMonthData.length > 0 ? thisMonthData[0].thisMonthEarnings : 0;

    // Last month's earnings
    const firstDayOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastDayOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    const lastMonthData = await Booking.aggregate([
      {
        $match: {
          hotel: { $in: hotelIds },
          paymentStatus: 'paid',
          status: { $ne: 'cancelled' },
          createdAt: { $gte: firstDayOfLastMonth, $lte: lastDayOfLastMonth }
        }
      },
      {
        $group: {
          _id: null,
          lastMonthEarnings: { $sum: '$totalPrice' }
        }
      }
    ]);

    const lastMonthEarnings = lastMonthData.length > 0 ? lastMonthData[0].lastMonthEarnings : 0;

    // Pending payouts (confirmed bookings not yet paid)
    const pendingPayoutsData = await Booking.aggregate([
      {
        $match: {
          hotel: { $in: hotelIds },
          status: 'confirmed',
          paymentStatus: { $ne: 'paid' }
        }
      },
      {
        $group: {
          _id: null,
          pendingPayouts: { $sum: '$totalPrice' }
        }
      }
    ]);

    const pendingPayouts = pendingPayoutsData.length > 0 ? pendingPayoutsData[0].pendingPayouts : 0;

    // Chart Data (Breakdown) based on filter
    const url = new URL(req.url);
    const filter = url.searchParams.get('filter') || 'year'; // Default to year (6 months view)

    let chartStartDate = new Date();
    let groupBy: any = {};
    let sortBy: any = {};
    let labelFormat: 'hour' | 'day' | 'month' = 'month';

    if (filter === 'day') {
      // Today (Hourly)
      chartStartDate = new Date();
      chartStartDate.setHours(0, 0, 0, 0);
      groupBy = { hour: { $hour: '$createdAt' } };
      sortBy = { '_id.hour': 1 };
      labelFormat = 'hour';
    } else if (filter === 'week') {
      // Last 7 Days
      chartStartDate.setDate(chartStartDate.getDate() - 7);
      chartStartDate.setHours(0, 0, 0, 0);
      groupBy = {
        year: { $year: '$createdAt' },
        month: { $month: '$createdAt' },
        day: { $dayOfMonth: '$createdAt' }
      };
      sortBy = { '_id.year': 1, '_id.month': 1, '_id.day': 1 };
      labelFormat = 'day';
    } else if (filter === 'month') {
      // Last 30 Days
      chartStartDate.setDate(chartStartDate.getDate() - 30);
      chartStartDate.setHours(0, 0, 0, 0);
      groupBy = {
        year: { $year: '$createdAt' },
        month: { $month: '$createdAt' },
        day: { $dayOfMonth: '$createdAt' }
      };
      sortBy = { '_id.year': 1, '_id.month': 1, '_id.day': 1 };
      labelFormat = 'day';
    } else {
      // Default: Last 6 Months
      chartStartDate.setMonth(chartStartDate.getMonth() - 5);
      chartStartDate.setDate(1);
      chartStartDate.setHours(0, 0, 0, 0);
      groupBy = {
        year: { $year: '$createdAt' },
        month: { $month: '$createdAt' }
      };
      sortBy = { '_id.year': 1, '_id.month': 1 };
      labelFormat = 'month';
    }

    const breakdownData = await Booking.aggregate([
      {
        $match: {
          hotel: { $in: hotelIds },
          paymentStatus: 'paid',
          status: { $ne: 'cancelled' },
          createdAt: { $gte: chartStartDate }
        }
      },
      {
        $group: {
          _id: groupBy,
          earnings: { $sum: '$totalPrice' },
          bookings: { $sum: 1 }
        }
      },
      { $sort: sortBy }
    ]);

    const formattedBreakdown = breakdownData.map(item => {
      let label = '';
      if (labelFormat === 'hour') {
        const hour = item._id.hour;
        label = `${hour.toString().padStart(2, '0')}:00`;
      } else if (labelFormat === 'day') {
        const date = new Date(item._id.year, item._id.month - 1, item._id.day);
        label = date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
      } else {
        const date = new Date(item._id.year, item._id.month - 1);
        label = date.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
      }

      return {
        month: label, // Keeping property name 'month' for frontend compatibility, though it represents label
        earnings: item.earnings,
        bookings: item.bookings,
        fullDate: labelFormat === 'month'
          ? new Date(item._id.year, item._id.month - 1).toISOString()
          : labelFormat === 'day'
            ? new Date(item._id.year, item._id.month - 1, item._id.day).toISOString()
            : new Date().toISOString() // Fallback
      };
    });

    return NextResponse.json({
      totalEarnings,
      thisMonthEarnings,
      lastMonthEarnings,
      pendingPayouts,
      completedPayouts: totalEarnings,
      monthlyBreakdown: formattedBreakdown,
    }, { status: 200 });
  } catch (error: any) {
    console.error('Get earnings error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch earnings' },
      { status: 500 }
    );
  }
}
