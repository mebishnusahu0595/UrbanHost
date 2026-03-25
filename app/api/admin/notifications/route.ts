import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import Notification from '@/models/Notification';

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user || (session.user as any).role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();

        const { searchParams } = new URL(req.url);
        const unreadOnly = searchParams.get('unreadOnly') === 'true';

        if (unreadOnly) {
            // Just return unread count
            const unreadCount = await Notification.countDocuments({ isRead: false });
            return NextResponse.json({ unreadCount });
        }

        // Get all notifications, sorted by latest
        const notifications = await Notification.find({})
            .sort({ createdAt: -1 })
            .limit(200);

        return NextResponse.json({ notifications });
    } catch (error: any) {
        console.error('Fetch notifications error:', error);
        return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 });
    }
}

export async function PATCH(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user || (session.user as any).role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id, markAllAsRead } = await req.json();

        await dbConnect();

        if (markAllAsRead) {
            await Notification.updateMany({ isRead: false }, { isRead: true });
        } else if (id) {
            await Notification.findByIdAndUpdate(id, { isRead: true });
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Update notification error:', error);
        return NextResponse.json({ error: 'Failed to update notification' }, { status: 500 });
    }
}
