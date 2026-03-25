
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import Hotel from "@/models/Hotel";

export async function POST(req: NextRequest, props: { params: Promise<{ id: string }> }) {
    try {
        const params = await props.params;
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await dbConnect();

        const property = await Hotel.findOne({
            _id: params.id,
            owner: (session.user as any).id
        });

        if (!property) {
            return NextResponse.json({ error: "Property not found" }, { status: 404 });
        }

        // Only allow revoking if pending or submitted
        if (!['pending', 'submitted'].includes(property.status)) {
            return NextResponse.json({
                error: "Cannot revoke. Property is either already approved, rejected or in draft."
            }, { status: 400 });
        }

        property.status = 'draft';
        await property.save();

        return NextResponse.json({ success: true, message: "Property revoked to draft" });

    } catch (error: any) {
        console.error("Revoke Property Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
