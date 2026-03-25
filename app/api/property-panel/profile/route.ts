import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";

export async function PUT(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await dbConnect();
        const data = await req.json();

        // Update user profile
        const user = await User.findById((session.user as any).id);
        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Update allowed fields
        if (data.name) user.name = data.name;
        if (data.phone) user.phone = data.phone;
        // Email cannot be changed once set

        await user.save();

        return NextResponse.json({ 
            success: true, 
            message: "Profile updated successfully",
            user: {
                name: user.name,
                email: user.email,
                phone: user.phone,
            }
        });
    } catch (error: any) {
        console.error("Profile Update Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await dbConnect();
        const user = await User.findById((session.user as any).id);
        
        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        return NextResponse.json({
            name: user.name,
            email: user.email,
            phone: user.phone,
        });
    } catch (error: any) {
        console.error("Get Profile Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
