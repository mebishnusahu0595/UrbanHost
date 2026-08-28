import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Hotel from '@/models/Hotel';

export async function GET(req: NextRequest) {
    try {
        await dbConnect();

        const { searchParams } = new URL(req.url);
        const query = searchParams.get('query')?.trim() || '';

        if (!query) {
            // Default top popular locations when input is empty
            const locations = await Hotel.aggregate([
                { $match: { status: 'approved' } },
                {
                    $group: {
                        _id: { city: "$address.city", state: "$address.state" },
                        count: { $sum: 1 }
                    }
                },
                { $sort: { count: -1 } },
                { $limit: 5 },
                {
                    $project: {
                        _id: 0,
                        city: "$_id.city",
                        state: "$_id.state",
                        count: "$count"
                    }
                }
            ]);
            return NextResponse.json({ locations, properties: [] }, { status: 200 });
        }

        const safeRegex = new RegExp(query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');

        // 1. Fetch matching locations (cities / states / country)
        const locations = await Hotel.aggregate([
            {
                $match: {
                    status: 'approved',
                    $or: [
                        { "address.city": safeRegex },
                        { "address.state": safeRegex },
                        { "address.country": safeRegex }
                    ]
                }
            },
            {
                $group: {
                    _id: { city: "$address.city", state: "$address.state" },
                    count: { $sum: 1 }
                }
            },
            { $sort: { count: -1 } },
            { $limit: 4 },
            {
                $project: {
                    _id: 0,
                    city: "$_id.city",
                    state: "$_id.state",
                    count: "$count"
                }
            }
        ]);

        // 2. Fetch matching hotels / B&Bs by hotel name, title, address, or room type
        const matchedHotels = await Hotel.find({
            status: 'approved',
            $or: [
                { name: safeRegex },
                { title: safeRegex },
                { description: safeRegex },
                { "rooms.type": safeRegex },
                { "address.street": safeRegex }
            ]
        })
            .select('_id name title address images rooms rating price')
            .limit(6)
            .lean();

        const properties = matchedHotels.map((h: any) => {
            const minPrice = h.price || (h.rooms && h.rooms.length > 0
                ? Math.min(...h.rooms.map((r: any) => r.price || 9999))
                : 150);
            return {
                id: h._id.toString(),
                name: h.name || h.title || 'Bed & Breakfast',
                city: h.address?.city || '',
                state: h.address?.state || '',
                image: h.images?.[0] || '/bnb-images/1822-bougainvillea-house.jpg',
                minPrice: minPrice === 9999 ? 150 : minPrice,
                rating: h.rating || 4.8
            };
        });

        return NextResponse.json({ locations, properties }, { status: 200 });
    } catch (error: any) {
        console.error('Locations and properties search error:', error);
        return NextResponse.json({ error: 'Failed to fetch search suggestions' }, { status: 500 });
    }
}
