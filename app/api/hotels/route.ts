import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import Hotel from "@/models/Hotel";

export async function GET(req: NextRequest) {
    try {
        await connectToDatabase();
        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");
        const city = searchParams.get("city");
        const query_text = searchParams.get("query");

        if (id) {
            const hotel = await Hotel.findById(id);
            return NextResponse.json(hotel);
        }

        let query: any = { status: 'approved' };
        let andFilters: any[] = [];

        if (city) {
            const cityParts = city.split(',').map(p => p.trim()).filter(p => p.length > 0);
            if (cityParts.length > 0) {
                const cityOr: any[] = [
                    { "address.city": { $regex: cityParts[0], $options: 'i' } },
                    { "address.state": { $regex: cityParts[0], $options: 'i' } }
                ];
                if (cityParts.length > 1) {
                    cityOr.push({ "address.state": { $regex: cityParts[1], $options: 'i' } });
                }
                andFilters.push({ $or: cityOr });
            }
        }

        if (query_text) {
            andFilters.push({
                $or: [
                    { name: { $regex: query_text, $options: 'i' } },
                    { "address.city": { $regex: query_text, $options: 'i' } },
                    { "address.state": { $regex: query_text, $options: 'i' } }
                ]
            });
        }

        if (andFilters.length > 0) {
            query.$and = andFilters;
        }

        const hotels = await Hotel.find(query).sort({ createdAt: -1 });
        return NextResponse.json(hotels);
    } catch (error) {
        console.error("Error fetching hotels:", error);
        return NextResponse.json(
            { error: "Failed to fetch hotels" },
            { status: 500 }
        );
    }
}

export async function POST(req: NextRequest) {
    try {
        await connectToDatabase();
        const body = await req.json();

        const hotel = await Hotel.create(body);
        return NextResponse.json(hotel, { status: 201 });
    } catch (error) {
        console.error("Error creating hotel:", error);
        return NextResponse.json(
            { error: "Failed to create hotel" },
            { status: 500 }
        );
    }
}
