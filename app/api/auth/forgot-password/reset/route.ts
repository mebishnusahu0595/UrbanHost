import { NextResponse } from "next/server";
import User from "@/models/User";
import dbConnect from "@/lib/mongodb";

export async function POST(req: Request) {
    try {
        const { email, otp, newPassword } = await req.json();

        if (!email || !otp || !newPassword) {
            return NextResponse.json({ error: "All fields are required" }, { status: 400 });
        }

        if (newPassword.length < 6) {
            return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
        }

        await dbConnect();

        const user = await User.findOne({
            email: email.toLowerCase()
        }).select("+otp +otpExpiry");

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        if (!user.otp || user.otp !== otp) {
            return NextResponse.json({ error: "Invalid OTP" }, { status: 400 });
        }

        if (!user.otpExpiry || user.otpExpiry < new Date()) {
            return NextResponse.json({ error: "OTP has expired" }, { status: 400 });
        }

        // Update password (pre-save hook in User model will hash it)
        user.password = newPassword;
        user.otp = undefined;
        user.otpExpiry = undefined;
        await user.save();

        return NextResponse.json({ message: "Password reset successful. You can now login with your new password." });
    } catch (error: any) {
        console.error("Forgot password reset error:", error);
        return NextResponse.json({ error: error.message || "Failed to reset password" }, { status: 500 });
    }
}
