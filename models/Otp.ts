import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IOtp extends Document {
    phone: string;
    otp: string;
    attempts: number;
    expiresAt: Date;
    createdAt: Date;
    updatedAt: Date;
}

const otpSchema = new Schema<IOtp>(
    {
        phone: {
            type: String,
            required: true,
            index: true,
        },
        otp: {
            type: String,
            required: true,
        },
        attempts: {
            type: Number,
            default: 0,
        },
        expiresAt: {
            type: Date,
            required: true,
            index: { expires: 0 }, // Auto-delete document when expiresAt matches current time
        },
    },
    {
        timestamps: true,
    }
);

const Otp: Model<IOtp> = mongoose.models.Otp || mongoose.model<IOtp>('Otp', otpSchema);

export default Otp;
