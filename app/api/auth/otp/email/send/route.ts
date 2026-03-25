
import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import { sendOTP } from "@/lib/mail";

export async function POST(req: NextRequest) {
    try {
        const { email } = await req.json();

        if (!email) {
            return NextResponse.json({ error: "Email is required" }, { status: 400 });
        }

        await dbConnect();

        // 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        // Find or Create User
        // If creating, we default to 'propertyOwner' role as this flow is for partners
        let user = await User.findOne({ email: email.toLowerCase() });

        if (!user) {
            // New user - start as 'user' role
            // Admin will promote to propertyOwner after first property approval
            user = await User.create({
                email: email.toLowerCase(),
                name: email.split('@')[0], // Default name from email
                role: 'user',
                otp,
                otpExpiry,
                isEmailVerified: false
            });
        } else {
            // Update existing user with new OTP
            // Note: We do NOT change the role of existing users to avoid security issues
            // If a 'user' tries to login here, they will just get an OTP.
            // Access control to the property panel should check for role separately.
            user.otp = otp;
            user.otpExpiry = otpExpiry;
            await user.save();
        }

        // Send Email
        await sendOTP(email, otp);

        return NextResponse.json({ success: true, message: "OTP sent successfully" });

    } catch (error: any) {
        console.error("OTP Send Error:", error);
        return NextResponse.json({ error: error.message || "Failed to send OTP" }, { status: 500 });
    }
}
