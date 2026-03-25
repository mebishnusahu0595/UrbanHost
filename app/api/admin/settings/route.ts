import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import Settings from '@/models/Settings';

export async function GET(req: NextRequest) {
    try {
        await dbConnect();
        
        const key = req.nextUrl.searchParams.get('key');
        
        if (key) {
            const setting = await Settings.findOne({ key });
            return NextResponse.json({ value: setting?.value || null });
        }
        
        const settings = await Settings.find({});
        return NextResponse.json(settings);
    } catch (error: any) {
        console.error('Settings fetch error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        
        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        
        const userRole = (session.user as any).role;
        if (userRole !== 'admin') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }
        
        await dbConnect();
        
        const { key, value } = await req.json();
        
        if (!key) {
            return NextResponse.json({ error: 'Key is required' }, { status: 400 });
        }
        
        const userId = (session.user as any).id;
        
        const setting = await Settings.findOneAndUpdate(
            { key },
            { value, updatedBy: userId },
            { upsert: true, new: true }
        );
        
        return NextResponse.json(setting);
    } catch (error: any) {
        console.error('Settings update error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
