import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Otp from "@/models/Otp";
import User from "@/models/User";

export async function POST(req: NextRequest) {
  try {
    const { phone, otp } = await req.json();

    if (!phone || !otp || typeof phone !== "string" || typeof otp !== "string") {
      return NextResponse.json(
        { error: "Phone and OTP are required" },
        { status: 400 }
      );
    }

    const cleanPhone = phone.replace(/\D/g, "");
    await dbConnect();

    const otpRecord = await Otp.findOne({ phone: cleanPhone });

    if (!otpRecord) {
      return NextResponse.json(
        { error: "OTP expired or not found. Please request a new OTP." },
        { status: 400 }
      );
    }

    // Check expiry
    if (otpRecord.expiresAt && new Date() > new Date(otpRecord.expiresAt)) {
      await otpRecord.deleteOne();
      return NextResponse.json(
        { error: "OTP has expired. Please request a new OTP." },
        { status: 400 }
      );
    }

    const maxAttempts = parseInt(process.env.OTP_MAX_ATTEMPTS || "3", 10);

    if (otpRecord.otp !== otp) {
      otpRecord.attempts = (otpRecord.attempts || 0) + 1;
      await otpRecord.save();

      if (otpRecord.attempts >= maxAttempts) {
        await otpRecord.deleteOne();
        return NextResponse.json(
          { error: "Max attempts reached. Please request a new OTP." },
          { status: 400 }
        );
      }
      const attemptsLeft = maxAttempts - otpRecord.attempts;
      return NextResponse.json(
        { error: `Invalid OTP. ${attemptsLeft} attempt(s) remaining.` },
        { status: 400 }
      );
    }

    // OTP Valid. Check if user exists.
    const user = await User.findOne({ phone: cleanPhone });

    // Allow window for signup completion if needed (10 mins)
    otpRecord.expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    otpRecord.attempts = 0;
    await otpRecord.save();

    return NextResponse.json({
      success: true,
      isNewUser: !user,
    });
  } catch (error: unknown) {
    console.error("Error in verify-otp:", error);
    const message = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
