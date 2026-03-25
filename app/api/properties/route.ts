
import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Hotel from '@/models/Hotel';
import User from '@/models/User';
import { getServerSession } from 'next-auth';
import { authOptions } from "@/lib/auth";

export async function GET(req: Request) {
    try {
        await connectToDatabase();
        const { searchParams } = new URL(req.url);
        const status = searchParams.get('status');
        const city = searchParams.get('city');
        const query_text = searchParams.get('query');
        const limit = parseInt(searchParams.get('limit') || '50');

        let query: any = {};
        let andFilters: any[] = [];

        // Filter by status if provided (public site usually asks for 'approved')
        if (status) query.status = status;

        // Filter by City/Location
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

        // Optional keyword search in name or description
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

        // Use aggregation to sort by "Urban Host Property" label availability
        const pipeline: any[] = [
            { $match: query },
            {
                $addFields: {
                    isUrbanHost: {
                        $in: ["Urban Host Property", { $ifNull: ["$labels", []] }]
                    }
                }
            },
            {
                $sort: {
                    isUrbanHost: -1,
                    featured: -1,
                    createdAt: -1
                }
            },
            { $limit: limit }
        ];

        const hotels = await Hotel.aggregate(pipeline);

        return NextResponse.json({ hotels, success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        await connectToDatabase();
        const session = await getServerSession(authOptions);

        // DO NOT use session user as owner for public property submissions
        // Properties should be pending until admin approves and creates owner account
        const body = await req.json();

        // Map wizard data to Schema
        const hotelData = {
            name: body.propertyName || body.name,
            description: body.description || `Property in ${body.location} - ${body.propertyType}`,
            address: {
                street: body.address.street || body.address.streetAddress,
                city: body.address.city,
                state: body.address.state,
                zipCode: body.address.zipCode || '000000',
                country: body.address.country || body.location,
            },
            location: {
                type: 'Point',
                coordinates: body.coordinates ? [body.coordinates.lng, body.coordinates.lat] : [78.6861, 17.3100],
            },
            embedUrl: body.embedUrl || "",
            images: body.images || [],
            photos: body.photos || {}, // Preserve photos object if sent
            contactInfo: {
                phone: (body.contact && body.contact.phoneCode) ? `${body.contact.phoneCode}-${body.contact.phoneNumber}` : (body.contactInfo?.phone || body.contact?.phone),
                email: body.contact?.emailBusiness || body.contactInfo?.email,
            },
            category: body.propertyType ? body.propertyType.charAt(0).toUpperCase() + body.propertyType.slice(1) : 'Hotel',
            status: body.status || 'submitted', // Default to submitted, not pending
            // No owner assigned until admin approval - leave undefined
            checkInTime: body.checkInTime || '14:00',
            checkOutTime: body.checkOutTime || '11:00',
            amenities: body.amenities || [],
            rooms: body.rooms || [],
            addons: body.addons || [],
            documents: body.documents || {} // Store documents if provided
        };

        // CRITICAL: If images array is empty but photos object exists, populate images from photos
        if ((!hotelData.images || hotelData.images.length === 0) && body.photos) {
            const exteriorPhotos = body.photos.exterior || [];
            const interiorPhotos = body.photos.interior || [];
            hotelData.images = [...exteriorPhotos, ...interiorPhotos];
        }

        const newHotel = await Hotel.create(hotelData);

        // DO NOT promote user to propertyOwner automatically
        // Promotion happens only when admin approves the property

        return NextResponse.json({ success: true, id: newHotel._id }, { status: 201 });

    } catch (error: any) {
        console.error('Error creating property:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
