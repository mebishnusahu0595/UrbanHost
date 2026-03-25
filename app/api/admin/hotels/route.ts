import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import Hotel from '@/models/Hotel';

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

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');

    let query: any = {};

    if (status && status !== 'all') {
      query.status = status;
    }

    const hotels = await Hotel.find(query)
      .populate('owner', 'name email phone')
      .sort({ createdAt: -1 });

    return NextResponse.json({ hotels }, { status: 200 });
  } catch (error: any) {
    console.error('Admin get hotels error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch hotels' },
      { status: 500 }
    );
  }
}
