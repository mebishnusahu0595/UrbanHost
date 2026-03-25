import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import Hotel from '@/models/Hotel';

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        const { id } = await params;

        if (!session || !session.user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Check if user is admin
        const sessionRole = (session.user as any).role;
        if (sessionRole !== 'admin') {
            return NextResponse.json(
                { error: 'Forbidden' },
                { status: 403 }
            );
        }

        await dbConnect();

        // Parse the body to get the label to toggle (default to "Urban Host Property")
        const body = await req.json().catch(() => ({}));
        const labelToToggle = body.label || "Urban Host Property";

        const hotel = await Hotel.findById(id);

        if (!hotel) {
            return NextResponse.json(
                { error: 'Hotel not found' },
                { status: 404 }
            );
        }

        // Toggle the label
        const labels = hotel.labels || [];
        const labelIndex = labels.indexOf(labelToToggle);

        let isAdded = false;
        if (labelIndex === -1) {
            labels.push(labelToToggle);
            isAdded = true;
        } else {
            labels.splice(labelIndex, 1);
            isAdded = false;
        }

        hotel.labels = labels;

        // Also toggle featured status if it's "Urban Host Property" (optional, but sorting often relies on featured)
        // The user requirement is sorting, not necessarily featured flag. But often they go hand in hand.
        // I won't touch featured flag implicitly unless requested, but I'll make sure the label is saved.

        await hotel.save();

        return NextResponse.json({
            success: true,
            labels: hotel.labels,
            message: `Label "${labelToToggle}" ${isAdded ? 'added' : 'removed'} successfully`
        }, { status: 200 });

    } catch (error: any) {
        console.error('Toggle label error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to update hotel label' },
            { status: 500 }
        );
    }
}
