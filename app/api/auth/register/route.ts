import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';

export async function POST(req: NextRequest) {
    try {
        const { phone, name, dob, otp } = await req.json();

        if (!phone || !name || !otp) {
            return NextResponse.json({ error: 'Phone, OTP and Name are required' }, { status: 400 });
        }

        const cleanPhone = phone.replace(/\D/g, '');
        await dbConnect();

        // 1. Verify OTP again (Secure Registration)
        // We must import the Otp model to check - using dynamic import to avoid potential circular dep issues if any
        const Otp = (await import('@/models/Otp')).default;
        const otpRecord = await Otp.findOne({ phone: cleanPhone });

        if (!otpRecord || otpRecord.otp !== otp) {
            return NextResponse.json({ error: 'Invalid or Expired verification. Please restart.' }, { status: 400 });
        }

        // Ensure user doesn't already exist (though verified in prev step, double check)
        // Check by phone, OR check if email exists if you ever start collecting email for regular users.
        // For now, phone-only users might not have email, or we generate a dummy one.
        const existingUser = await User.findOne({ phone: cleanPhone });
        if (existingUser) {
            return NextResponse.json({ error: 'User already exists' }, { status: 400 });
        }

        // Create User
        // Note: The User model requires an email. 
        // We will generate a placeholder email for phone-based users if they don't provide one.
        // Format: phone@urbanhost.local or similar.
        const placeholderEmail = `${cleanPhone}@urbanhost.user`;

        const newUser = await User.create({
            name,
            phone: cleanPhone,
            email: placeholderEmail, // Placeholder as per model constraint
            role: 'user',
            isEmailVerified: false, // Since it's a dummy email
            dob: dob ? new Date(dob) : undefined,
            // Password not set for OTP users
        });

        // If you want to store DOB, you need to add it to the User model.
        // For now, I will assume we might need to update the User model to support DOB efficiently 
        // or just ignore if it's not strictly required in schema yet.
        // CHECK: Standard User model doesn't have DOB. I will add it if requested? 
        // User prompt clearly said "fill birthdate". I should update Model.

        return NextResponse.json({ success: true, user: newUser });

    } catch (error: any) {
        console.error('Error in register:', error);
        return NextResponse.json({ error: 'Registration failed: ' + error.message }, { status: 500 });
    }
}
