import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import Booking from '@/models/Booking';

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const sessionRole = (session.user as any).role;
        if (sessionRole !== 'admin') {
            return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
        }

        await dbConnect();

        const { searchParams } = new URL(req.url);
        const range = searchParams.get('range') || 'all'; // 1day, 1week, 1year, all, custom
        const start = searchParams.get('start');
        const end = searchParams.get('end');

        let query: any = {
            paymentStatus: 'paid', // We only care about payments that are done
        };

        if (range !== 'all') {
            const now = new Date();
            let fromDate = new Date();

            if (range === '1day') {
                fromDate.setHours(0, 0, 0, 0);
            } else if (range === '1week') {
                fromDate.setDate(now.getDate() - 7);
            } else if (range === '1year') {
                fromDate.setFullYear(now.getFullYear() - 1);
            } else if (range === 'custom' && start && end) {
                fromDate = new Date(start);
                const toDate = new Date(end);
                toDate.setHours(23, 59, 59, 999);
                query.createdAt = { $gte: fromDate, $lte: toDate };
            }

            if (range !== 'custom') {
                query.createdAt = { $gte: fromDate };
            }
        }

        const payments = await Booking.find(query)
            .populate('hotel', 'name')
            .populate('user', 'name email phone')
            .sort({ createdAt: -1 });

        return NextResponse.json({ payments }, { status: 200 });
    } catch (error: any) {
        console.error('Admin get payments error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to fetch payments' },
            { status: 500 }
        );
    }
}
