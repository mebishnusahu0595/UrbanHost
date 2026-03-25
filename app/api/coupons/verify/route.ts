
import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Coupon from '@/models/Coupon';

export async function POST(req: Request) {
    try {
        await connectToDatabase();
        const { code, orderValue, hotelId } = await req.json();

        if (!code) {
            return NextResponse.json({ error: "Coupon code is required" }, { status: 400 });
        }

        const coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true });

        if (!coupon) {
            return NextResponse.json({ error: "Invalid coupon code" }, { status: 404 });
        }

        const now = new Date();
        if (now < new Date(coupon.startDate) || now > new Date(coupon.endDate)) {
            return NextResponse.json({ error: "Coupon is expired or not yet active" }, { status: 400 });
        }

        if (coupon.usageLimit > 0 && coupon.usedCount >= coupon.usageLimit) {
            return NextResponse.json({ error: "Coupon usage limit exceeded" }, { status: 400 });
        }

        if (orderValue < coupon.minOrderValue) {
            return NextResponse.json({ error: `Minimum order value of ₹${coupon.minOrderValue} required` }, { status: 400 });
        }

        // Check if hotel is applicable
        if (coupon.applicableHotels !== 'all' && Array.isArray(coupon.applicableHotels)) {
            // This assumes hotelId passes as string; converting ObjectId comparison might be needed if strictly typed
            const isApplicable = coupon.applicableHotels.some((id: any) => id.toString() === hotelId);
            if (!isApplicable) {
                return NextResponse.json({ error: "Coupon is not applicable for this hotel" }, { status: 400 });
            }
        }

        // Calculate Discount
        let discount = 0;
        if (coupon.discountType === 'flat') {
            discount = coupon.discountAmount;
        } else {
            discount = (orderValue * coupon.discountAmount) / 100;
            if (coupon.maxDiscount > 0) {
                discount = Math.min(discount, coupon.maxDiscount);
            }
        }

        // Ensure discount doesn't exceed order value
        discount = Math.min(discount, orderValue);

        return NextResponse.json({
            success: true,
            discount,
            finalPrice: orderValue - discount,
            couponCode: coupon.code,
            adminShare: coupon.adminRevenueShare
        });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
