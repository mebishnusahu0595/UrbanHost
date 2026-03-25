
import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Coupon from '@/models/Coupon';
import { getServerSession } from 'next-auth';
import { authOptions } from "@/lib/auth";

export async function GET(req: Request) {
    try {
        await connectToDatabase();
        const coupons = await Coupon.find({}).sort({ createdAt: -1 });
        return NextResponse.json({ coupons, success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        await connectToDatabase();
        const session = await getServerSession(authOptions);

        // Simple admin check
        // if (!session || (session.user as any).role !== 'admin') {
        //    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        // }

        const body = await req.json();

        // Validate dates
        if (new Date(body.startDate) > new Date(body.endDate)) {
            return NextResponse.json({ error: "Start date must be before end date" }, { status: 400 });
        }

        const newCoupon = await Coupon.create(body);
        return NextResponse.json({ success: true, coupon: newCoupon }, { status: 201 });

    } catch (error: any) {
        if (error.code === 11000) {
            return NextResponse.json({ error: "Coupon code already exists" }, { status: 400 });
        }
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
