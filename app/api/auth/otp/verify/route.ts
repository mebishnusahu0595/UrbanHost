import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Otp from '@/models/Otp';
import User from '@/models/User';

export async function POST(req: NextRequest) {
    try {
        const { phone, otp } = await req.json();

        if (!phone || !otp) {
            return NextResponse.json({ error: 'Phone and OTP are required' }, { status: 400 });
        }

        const cleanPhone = phone.replace(/\D/g, '');
        await dbConnect();

        const otpRecord = await Otp.findOne({ phone: cleanPhone });

        if (!otpRecord) {
            return NextResponse.json({ error: 'OTP expired or not found' }, { status: 400 });
        }

        if (otpRecord.otp !== otp) {
            otpRecord.attempts += 1;
            await otpRecord.save();

            if (otpRecord.attempts >= parseInt(process.env.OTP_MAX_ATTEMPTS || '3')) {
                await otpRecord.deleteOne(); // Invalidate if max attempts reached
                return NextResponse.json({ error: 'Max attempts reached. Request a new OTP.' }, { status: 400 });
            }
            return NextResponse.json({ error: 'Invalid OTP' }, { status: 400 });
        }

        // OTP Valid. Check if user exists.
        const user = await User.findOne({ phone: cleanPhone });

        // DO NOT delete OTP yet. Extend expiry to allow registration completion (15 mins)
        otpRecord.expiresAt = new Date(Date.now() + 15 * 60 * 1000);
        otpRecord.attempts = 0; // Reset attempts for final verification
        await otpRecord.save();

        if (user) {
            return NextResponse.json({
                success: true,
                isNewUser: false
                // We don't return a token here yet, the client proceeds to calling NextAuth signIn
            });
        } else {
            return NextResponse.json({
                success: true,
                isNewUser: true
            });
        }

    } catch (error: any) {
        console.error('Error in verify-otp:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
