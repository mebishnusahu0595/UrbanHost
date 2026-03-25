import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import Hotel from '@/models/Hotel';
import { createNotification } from '@/lib/notifications';

export async function PUT(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const session = await getServerSession(authOptions);

        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();

        const hotel = await Hotel.findById(id);
        if (!hotel) {
            return NextResponse.json({ error: 'Hotel not found' }, { status: 404 });
        }

        // Check if user is admin or property owner
        const userRole = (session.user as any).role;
        const userId = (session.user as any).id;

        if (userRole !== 'admin' && (!hotel.owner || hotel.owner.toString() !== userId)) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const updateData = await req.json();

        // Calculate changes for notification
        let changeDetails: { field: string; oldValue: any; newValue: any }[] = [];

        // Check basic fields
        ['name', 'description', 'category', 'status'].forEach(field => {
            if (updateData[field] !== undefined && updateData[field] !== (hotel as any)[field]) {
                changeDetails.push({
                    field,
                    oldValue: (hotel as any)[field] || 'N/A',
                    newValue: updateData[field]
                });
            }
        });

        // Check address fields
        if (updateData.address) {
            ['street', 'city', 'state', 'zipCode', 'country'].forEach(subField => {
                const oldVal = hotel.address ? (hotel.address as any)[subField] : null;
                const newVal = updateData.address[subField];
                if (newVal !== undefined && newVal !== oldVal) {
                    changeDetails.push({
                        field: `address.${subField}`,
                        oldValue: oldVal || 'N/A',
                        newValue: newVal
                    });
                }
            });
        }

        // Check images
        if (updateData.images && JSON.stringify(updateData.images) !== JSON.stringify(hotel.images)) {
            changeDetails.push({
                field: 'images',
                oldValue: `${hotel.images.length} images`,
                newValue: `${updateData.images.length} images`
            });
        }

        // Check documents
        if (updateData.documents && JSON.stringify(updateData.documents) !== JSON.stringify(hotel.documents)) {
            changeDetails.push({
                field: 'documents',
                oldValue: `${Object.keys(hotel.documents || {}).length} docs`,
                newValue: `${Object.keys(updateData.documents || {}).length} docs`
            });
        }

        // Check rooms count
        if (updateData.rooms && updateData.rooms.length !== hotel.rooms.length) {
            changeDetails.push({
                field: 'rooms',
                oldValue: `${hotel.rooms.length} rooms`,
                newValue: `${updateData.rooms.length} rooms`
            });
        }

        // Check amenities
        if (updateData.amenities && JSON.stringify(updateData.amenities) !== JSON.stringify(hotel.amenities)) {
            changeDetails.push({
                field: 'amenities',
                oldValue: `${hotel.amenities.length} amenities`,
                newValue: `${updateData.amenities.length} amenities`
            });
        }

        // Check addons
        if (updateData.addons && JSON.stringify(updateData.addons) !== JSON.stringify(hotel.addons || [])) {
            changeDetails.push({
                field: 'addons',
                oldValue: `${(hotel.addons || []).length} addons`,
                newValue: `${updateData.addons.length} addons`
            });
        }

        // Check emergency contacts
        if (updateData.emergencyContacts) {
            ['propertyManagerName', 'primaryContact', 'alternateContact', 'email'].forEach(subField => {
                const oldVal = hotel.emergencyContacts ? (hotel.emergencyContacts as any)[subField] : null;
                const newVal = updateData.emergencyContacts[subField];
                if (newVal !== undefined && newVal !== oldVal) {
                    changeDetails.push({
                        field: `emergencyContacts.${subField}`,
                        oldValue: oldVal || 'N/A',
                        newValue: newVal
                    });
                }
            });
        }

        // Check agreement status
        if (updateData.agreementSigned !== undefined && updateData.agreementSigned !== hotel.agreementSigned) {
            changeDetails.push({
                field: 'agreementSigned',
                oldValue: hotel.agreementSigned ? 'Signed' : 'Not Signed',
                newValue: updateData.agreementSigned ? 'Signed' : 'Not Signed'
            });
        }

        // Update the hotel
        const updatedHotel = await Hotel.findByIdAndUpdate(
            id,
            { $set: updateData },
            { new: true, runValidators: true }
        );

        // Send notification if user is property owner (Admins editing probably doesn't need to notify themselves, but good for logs)
        // If the editor is the owner, notify admin.
        if (userRole === 'propertyOwner' || userRole === 'hotelOwner') {
            if (changeDetails.length > 0) {
                await createNotification({
                    type: 'HOTEL_UPDATE',
                    title: 'Property Updated',
                    message: `Property "${hotel.name}" details were updated by ${session.user.name}.`,
                    userId: userId,
                    userName: session.user.name || 'Property Owner',
                    userRole: userRole,
                    hotelId: hotel._id,
                    hotelName: hotel.name,
                    changeDetails
                });
            }
        }

        return NextResponse.json(updatedHotel);
    } catch (error: any) {
        console.error('Hotel update error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const session = await getServerSession(authOptions);

        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();

        const hotel = await Hotel.findById(id);
        if (!hotel) {
            return NextResponse.json({ error: 'Hotel not found' }, { status: 404 });
        }

        // Check if user is admin or property owner
        const userRole = (session.user as any).role;
        const userId = (session.user as any).id;

        if (userRole !== 'admin' && (!hotel.owner || hotel.owner.toString() !== userId)) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const updateData = await req.json();

        // Update the hotel with partial data
        const updatedHotel = await Hotel.findByIdAndUpdate(
            id,
            { $set: updateData },
            { new: true, runValidators: true }
        );

        // Send notification for addon changes if user is property owner
        if ((userRole === 'propertyOwner' || userRole === 'hotelOwner') && updateData.addons) {
            await createNotification({
                type: 'HOTEL_UPDATE',
                title: 'Property Addons Updated',
                message: `Addons updated for property "${hotel.name}" by ${session.user.name}.`,
                userId: userId,
                userName: session.user.name || 'Property Owner',
                userRole: userRole,
                hotelId: hotel._id,
                hotelName: hotel.name,
                changeDetails: [{
                    field: 'addons',
                    oldValue: `${(hotel.addons || []).length} addons`,
                    newValue: `${updateData.addons.length} addons`
                }]
            });
        }

        return NextResponse.json(updatedHotel);
    } catch (error: any) {
        console.error('Hotel patch error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        await dbConnect();

        const hotel = await Hotel.findById(id).populate('owner', 'name email');

        if (!hotel) {
            return NextResponse.json({ error: 'Hotel not found' }, { status: 404 });
        }

        return NextResponse.json(hotel);
    } catch (error: any) {
        console.error('Hotel fetch error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
