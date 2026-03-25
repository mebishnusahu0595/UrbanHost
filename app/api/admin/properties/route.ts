import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import Hotel from '@/models/Hotel';

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const sessionRole = (session.user as any).role;
        if (sessionRole !== 'admin') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        await dbConnect();

        // Fetch only submitted properties (exclude drafts) with owner details
        const properties = await Hotel.find({
            status: { $in: ['submitted', 'pending', 'approved', 'rejected'] }
        })
            .populate('owner', 'name email phone')
            .sort({ createdAt: -1 });

        return NextResponse.json(properties);
    } catch (error: any) {
        console.error('Error fetching properties:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
