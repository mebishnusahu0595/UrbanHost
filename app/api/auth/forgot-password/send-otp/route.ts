import { NextResponse } from "next/server";
import User from "@/models/User";
import dbConnect from "@/lib/mongodb";
import { sendPasswordResetOTP } from "@/lib/mail";

export async function POST(req: Request) {
    try {
        const { email } = await req.json();

        if (!email) {
            return NextResponse.json({ error: "Email is required" }, { status: 400 });
        }

        await dbConnect();

        const user = await User.findOne({ email: email.toLowerCase() });

        if (!user) {
            // Return success even if user not found to prevent email enumeration
            // But in this specific case, for better UX in forgot password, we might want to tell them.
            // Let's be explicit for now as requested.
            return NextResponse.json({ error: "No account found with this email" }, { status: 404 });
        }

        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        user.otp = otp;
        user.otpExpiry = otpExpiry;
        await user.save();

        await sendPasswordResetOTP(user.email, otp);

        return NextResponse.json({ message: "OTP sent to your email" });
    } catch (error: any) {
        console.error("Forgot password OTP error:", error);
        return NextResponse.json({ error: error.message || "Failed to send OTP" }, { status: 500 });
    }
}
