import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import Hotel from "@/models/Hotel";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await dbConnect();

        // Check if user has any approved or published properties
        const approvedProperty = await Hotel.findOne({
            owner: (session.user as any).id,
            status: { $in: ['approved', 'published'] }
        });

        return NextResponse.json({ 
            hasApproved: !!approvedProperty 
        });
    } catch (error) {
        console.error("Error checking approved properties:", error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
