import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Otp from '@/models/Otp';
import { sendOtpViaSMS } from '@/lib/sms';

export async function POST(req: NextRequest) {
    try {
        const { phone } = await req.json();

        if (!phone) {
            return NextResponse.json({ error: 'Phone number is required' }, { status: 400 });
        }

        // Basic format validation (Indian format assumed +91 or 10 digits)
        // Clean the phone number to just digits
        const cleanPhone = phone.replace(/\D/g, '');
        if (cleanPhone.length < 10) {
            return NextResponse.json({ error: 'Invalid phone number format' }, { status: 400 });
        }

        await dbConnect();

        // Generate 6 digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const ttl = parseInt(process.env.OTP_TTL_SECONDS || '300');
        const expiresAt = new Date(Date.now() + ttl * 1000);

        // Check recent OTP request rate limiting
        const existingOtp = await Otp.findOne({ phone: cleanPhone });
        if (existingOtp) {
            // Rate limit check: if created within last 30 seconds
            const timeDiff = (Date.now() - existingOtp.createdAt.getTime()) / 1000;
            if (timeDiff < parseInt(process.env.OTP_RESEND_SECONDS || '30')) {
                return NextResponse.json({ error: 'Please wait before requesting another OTP' }, { status: 429 });
            }
            // Update existing OTP record
            existingOtp.otp = otp;
            existingOtp.expiresAt = expiresAt;
            existingOtp.attempts = 0;
            await existingOtp.save();
        } else {
            // Create new OTP record
            await Otp.create({
                phone: cleanPhone,
                otp,
                expiresAt,
            });
        }

        // Send Via SMS
        const isSent = await sendOtpViaSMS(cleanPhone, otp);

        if (!isSent) {
            return NextResponse.json({ error: 'Failed to send SMS' }, { status: 500 });
        }

        return NextResponse.json({ success: true, message: 'OTP sent successfully' });

    } catch (error: any) {
        console.error('Error in send-otp:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
