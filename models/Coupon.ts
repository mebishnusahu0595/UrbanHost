import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ICoupon extends Document {
    code: string;
    discountType: 'flat' | 'percentage';
    discountAmount: number;
    minOrderValue: number;
    maxDiscount: number; // For percentage based discounts
    startDate: Date;
    endDate: Date;
    applicableHotels: mongoose.Types.ObjectId[] | 'all';
    adminRevenueShare: number; // Percentage of revenue admin takes from the discounted booking
    isActive: boolean;
    usageLimit: number;
    usedCount: number;
    createdAt: Date;
    updatedAt: Date;
}

const couponSchema = new Schema<ICoupon>(
    {
        code: {
            type: String,
            required: true,
            unique: true,
            uppercase: true,
            trim: true,
        },
        discountType: {
            type: String,
            enum: ['flat', 'percentage'],
            required: true,
        },
        discountAmount: {
            type: Number,
            required: true,
            min: 0,
        },
        minOrderValue: {
            type: Number,
            default: 0,
        },
        maxDiscount: {
            type: Number,
            default: 0, // 0 means no limit
        },
        startDate: {
            type: Date,
            required: true,
        },
        endDate: {
            type: Date,
            required: true,
        },
        applicableHotels: {
            type: Schema.Types.Mixed, // Array of ObjectId or String "all"
            default: 'all',
        },
        adminRevenueShare: {
            type: Number,
            default: 10, // Default 10%
            min: 0,
            max: 100,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        usageLimit: {
            type: Number,
            default: 0, // 0 means unlimited
        },
        usedCount: {
            type: Number,
            default: 0,
        },
    },
    {
        timestamps: true,
    }
);

const Coupon: Model<ICoupon> = mongoose.models.Coupon || mongoose.model<ICoupon>('Coupon', couponSchema);

export default Coupon;
