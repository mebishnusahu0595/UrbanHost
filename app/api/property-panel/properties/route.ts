
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import Hotel from "@/models/Hotel";

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await dbConnect();

        const properties = await Hotel.find({ owner: (session.user as any).id })
            .sort({ updatedAt: -1 });

        return NextResponse.json({ properties });
    } catch (error: any) {
        console.error("List Properties Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await dbConnect();
        const data = await req.json();

        // Enforce owner field
        data.owner = (session.user as any).id;

        // Ensure status is valid (allow draft or submitted, but NO approved/published by user)
        if (data.status === 'approved' || data.status === 'published') {
            data.status = 'submitted';
        }

        const hotel = await Hotel.create(data);

        return NextResponse.json({ success: true, hotel });
    } catch (error: any) {
        console.error("Create Property Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
