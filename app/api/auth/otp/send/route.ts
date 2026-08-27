import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Otp from "@/models/Otp";
import { sendOtpViaSMS } from "@/lib/sms";

export async function POST(req: NextRequest) {
  try {
    const { phone } = await req.json();

    if (!phone || typeof phone !== "string") {
      return NextResponse.json(
        { error: "Valid phone number is required" },
        { status: 400 }
      );
    }

    // Basic format validation (10 digits)
    const cleanPhone = phone.replace(/\D/g, "");
    if (cleanPhone.length < 10 || cleanPhone.length > 13) {
      return NextResponse.json(
        { error: "Invalid phone number format" },
        { status: 400 }
      );
    }

    await dbConnect();

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const ttl = parseInt(process.env.OTP_TTL_SECONDS || "300", 10);
    const expiresAt = new Date(Date.now() + ttl * 1000);
    const resendCooldown = parseInt(process.env.OTP_RESEND_SECONDS || "30", 10);

    const existingOtp = await Otp.findOne({ phone: cleanPhone });
    if (existingOtp) {
      // Compare against updatedAt to correctly rate limit consecutive resends
      const lastSentTime = existingOtp.updatedAt
        ? new Date(existingOtp.updatedAt).getTime()
        : new Date(existingOtp.createdAt).getTime();

      const timeDiff = (Date.now() - lastSentTime) / 1000;
      if (timeDiff < resendCooldown) {
        const waitSeconds = Math.ceil(resendCooldown - timeDiff);
        return NextResponse.json(
          { error: `Please wait ${waitSeconds}s before requesting another OTP` },
          { status: 429 }
        );
      }

      existingOtp.otp = otp;
      existingOtp.expiresAt = expiresAt;
      existingOtp.attempts = 0;
      await existingOtp.save();
    } else {
      await Otp.create({
        phone: cleanPhone,
        otp,
        expiresAt,
      });
    }

    // Send Via SMS
    const isSent = await sendOtpViaSMS(cleanPhone, otp);

    if (!isSent && process.env.NODE_ENV === "production") {
      return NextResponse.json(
        { error: "Failed to send SMS OTP. Please try again later." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "OTP sent successfully",
    });
  } catch (error: unknown) {
    console.error("Error in send-otp:", error);
    const message = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
