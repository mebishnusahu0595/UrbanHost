import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const sessionRole = (session.user as any).role;
    if (sessionRole !== "admin") {
      return NextResponse.json(
        { error: "Forbidden - Admin access required" },
        { status: 403 }
      );
    }

    await dbConnect();

    // Exclude superadmin accounts from the list as requested
    const filter = {
      email: { $nin: ["superadmin@stayntour.com", "superadmin@urbanhost.com"] },
      role: { $ne: "superadmin" },
    };

    // Get all non-superadmin users and admins
    const users = await User.find(filter)
      .select("-password -otp -otpExpiry")
      .sort({ createdAt: -1 });

    // Aggregate unique states and cities for filter dropdowns
    const states = Array.from(
      new Set(users.map((u) => u.lastState).filter(Boolean))
    ).sort();

    const cities = Array.from(
      new Set(users.map((u) => u.lastCity).filter(Boolean))
    ).sort();

    return NextResponse.json(
      {
        users,
        filters: {
          states,
          cities,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Get users error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch users" },
      { status: 500 }
    );
  }
}
