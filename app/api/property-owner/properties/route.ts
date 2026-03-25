import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import Hotel from '@/models/Hotel';
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

    let properties: any[];

    // For hotelOwner role, get assigned hotels
    if (user.role === 'hotelOwner') {
      if (user.assignedHotels && user.assignedHotels.length > 0) {
        properties = await Hotel.find({ _id: { $in: user.assignedHotels } }).sort({ createdAt: -1 });
      } else {
        properties = [];
      }
    } else {
      // For propertyOwner role, get properties they own
      properties = await Hotel.find({ owner: user._id }).sort({ createdAt: -1 });
    }

    return NextResponse.json({
      properties,
    }, { status: 200 });
  } catch (error: any) {
    console.error('Get properties error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch properties' },
      { status: 500 }
    );
  }
}
