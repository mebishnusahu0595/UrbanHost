import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Hotel from '@/models/Hotel';

export async function GET(req: NextRequest) {
    try {
        await dbConnect();

        const { searchParams } = new URL(req.url);
        const query = searchParams.get('query') || '';

        // Get unique cities from the database that match the query
        // We look at address.city
        const filter = query
            ? {
                $or: [
                    { "address.city": { $regex: query, $options: 'i' } },
                    { "address.state": { $regex: query, $options: 'i' } }
                ],
                status: 'approved'
            }
            : { status: 'approved' };

        // Fetch distinct combinations of city and state
        const locations = await Hotel.aggregate([
            { $match: filter },
            {
                $group: {
                    _id: {
                        city: "$address.city",
                        state: "$address.state"
                    },
                    count: { $sum: 1 }
                }
            },
            {
                $project: {
                    _id: 0,
                    city: "$_id.city",
                    state: "$_id.state",
                    count: "$count"
                }
            },
            { $limit: 10 }
        ]);

        return NextResponse.json({ locations }, { status: 200 });
    } catch (error: any) {
        console.error('Locations search error:', error);
        return NextResponse.json({ error: 'Failed to fetch locations' }, { status: 500 });
    }
}
