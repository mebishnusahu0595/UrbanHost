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

    // Check if user is propertyOwner or hotelOwner
    const user = await User.findOne({ email: session.user.email });
    if (!user || !['propertyOwner', 'hotelOwner'].includes(user.role)) {
      return NextResponse.json(
        { error: 'Forbidden - Property Owner access required' },
        { status: 403 }
      );
    }

    let hotelIds: any[] = [];
    let totalProperties = 0;
    let approvedProperties = 0;
    let pendingProperties = 0;

    // For hotelOwner role, use assigned hotels
    if (user.role === 'hotelOwner') {
      if (user.assignedHotels && user.assignedHotels.length > 0) {
        const ownerHotels = await Hotel.find({ _id: { $in: user.assignedHotels } });
        hotelIds = ownerHotels.map(h => h._id);
        totalProperties = ownerHotels.length;
        approvedProperties = ownerHotels.filter(h => h.status === 'approved').length;
        pendingProperties = ownerHotels.filter(h => h.status === 'pending').length;
      }
    } else {
      // For propertyOwner role, use owned properties
      totalProperties = await Hotel.countDocuments({ owner: user._id });
      approvedProperties = await Hotel.countDocuments({ owner: user._id, status: 'approved' });
      pendingProperties = await Hotel.countDocuments({ owner: user._id, status: 'pending' });

      const ownerHotels = await Hotel.find({ owner: user._id }).select('_id');
      hotelIds = ownerHotels.map(h => h._id);
    }

    const totalBookings = await Booking.countDocuments({ hotel: { $in: hotelIds } });
    const confirmedBookings = await Booking.countDocuments({ hotel: { $in: hotelIds }, status: 'confirmed' });
    const pendingBookings = await Booking.countDocuments({ hotel: { $in: hotelIds }, status: 'pending' });

    // Calculate earnings from confirmed bookings (exclude cancelled)
    const earningsData = await Booking.aggregate([
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

    const totalEarnings = earningsData.length > 0 ? earningsData[0].totalEarnings : 0;

    // Calculate this month's earnings
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

    // Monthly earnings for chart (Last 12 months)
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setDate(1);
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 11);

    const monthlyData = await Booking.aggregate([
      {
        $match: {
          hotel: { $in: hotelIds },
          paymentStatus: 'paid',
          status: { $ne: 'cancelled' },
          createdAt: { $gte: twelveMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" }
          },
          revenue: { $sum: '$totalPrice' },
          bookings: { $sum: 1 }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);

    // Daily earnings for chart (Last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 29);
    thirtyDaysAgo.setHours(0, 0, 0, 0);

    const dailyData = await Booking.aggregate([
      {
        $match: {
          hotel: { $in: hotelIds },
          paymentStatus: 'paid',
          status: { $ne: 'cancelled' },
          createdAt: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
            day: { $dayOfMonth: "$createdAt" }
          },
          revenue: { $sum: '$totalPrice' },
          bookings: { $sum: 1 }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } }
    ]);

    // Weekly earnings for chart (Last 12 weeks)
    const twelveWeeksAgo = new Date();
    twelveWeeksAgo.setDate(twelveWeeksAgo.getDate() - 83); // ~12 weeks
    twelveWeeksAgo.setHours(0, 0, 0, 0);

    const weeklyData = await Booking.aggregate([
      {
        $match: {
          hotel: { $in: hotelIds },
          paymentStatus: 'paid',
          status: { $ne: 'cancelled' },
          createdAt: { $gte: twelveWeeksAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            week: { $week: "$createdAt" }
          },
          revenue: { $sum: '$totalPrice' },
          bookings: { $sum: 1 }
        }
      },
      { $sort: { "_id.year": 1, "_id.week": 1 } }
    ]);

    // Get recent bookings for this owner's properties
    const recentBookings = await Booking.find({ hotel: { $in: hotelIds } })
      .populate('hotel', 'name')
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .limit(10);

    return NextResponse.json({
      stats: {
        totalProperties,
        approvedProperties,
        pendingProperties,
        totalBookings,
        confirmedBookings,
        pendingBookings,
        totalEarnings,
        thisMonthEarnings,
      },
      monthlyData,
      dailyData,
      weeklyData,
      recentBookings,
      role: user.role,
      canEditHotels: user.role === 'propertyOwner' ? true : (user.canEditHotels || false),
    }, { status: 200 });
  } catch (error: any) {
    console.error('Property owner stats error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch property owner stats' },
      { status: 500 }
    );
  }
}
