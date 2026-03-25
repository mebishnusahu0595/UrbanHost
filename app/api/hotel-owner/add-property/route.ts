
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import Hotel from '@/models/Hotel';
import { writeFile } from 'fs/promises';
import path from 'path';
import fs from 'fs';
import { createNotification } from '@/lib/notifications';

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const canEdit = (session.user as any).canEditHotels;
        if (!canEdit) {
            return NextResponse.json({ error: 'Forbidden - Edit access required' }, { status: 403 });
        }

        await dbConnect();
        const formData = await req.formData();

        // Helper to save file
        const saveFile = async (file: File, folder: string) => {
            const buffer = Buffer.from(await file.arrayBuffer());
            const filename = `${Date.now()}_${file.name.replace(/\s+/g, '_')}`;
            const uploadDir = process.env.NODE_ENV === 'production'
                ? path.join('/var/www/urbanhost/uploads', folder)
                : path.join(process.cwd(), 'public', 'uploads', folder);

            if (!fs.existsSync(uploadDir)) {
                fs.mkdirSync(uploadDir, { recursive: true });
            }

            await writeFile(path.join(uploadDir, filename), buffer);
            return `/uploads/${folder}/${filename}`;
        };

        // Extract Basic Fields
        const name = formData.get('name') as string;
        const description = formData.get('description') as string;
        const propertyType = formData.get('propertyType') as string;
        const price = parseFloat(formData.get('price') as string);
        const tags = JSON.parse(formData.get('tags') as string || '[]');
        const rating = parseFloat(formData.get('rating') as string || '4.5');
        const totalReviews = parseInt(formData.get('totalReviews') as string || '0');
        const checkInTime = formData.get('checkInTime') as string;
        const checkOutTime = formData.get('checkOutTime') as string;

        // Extract Complex Object Fields
        const address = JSON.parse(formData.get('address') as string || '{}');
        const contactInfo = JSON.parse(formData.get('contactInfo') as string || '{}');
        const policies = JSON.parse(formData.get('policies') as string || '{}');
        const amenities = JSON.parse(formData.get('amenities') as string || '[]');
        const highlights = JSON.parse(formData.get('highlights') as string || '{}');

        // Handle Property Images
        const propertyImages: string[] = JSON.parse(formData.get('existingImages') as string || '[]');
        const newImages = formData.getAll('images') as File[];

        for (const img of newImages) {
            if (img.size > 0) {
                const imgPath = await saveFile(img, 'hotels');
                propertyImages.push(imgPath);
            }
        }

        // Handle Rooms and Room Images
        const roomsJson = JSON.parse(formData.get('rooms') as string || '[]');
        const rooms = [];

        for (let i = 0; i < roomsJson.length; i++) {
            const room = roomsJson[i];
            const roomImages = room.images || []; // Existing images

            // Get new images for this room
            // The frontend appends them as room_0_image, room_0_image (multiple)
            // But formData.getAll returns all values for a key
            const newRoomImages = formData.getAll(`room_${i}_image`) as File[];

            for (const img of newRoomImages) {
                if (img.size > 0) {
                    const imgPath = await saveFile(img, 'rooms');
                    roomImages.push(imgPath);
                }
            }

            rooms.push({
                ...room,
                images: roomImages
            });
        }

        // Handle Documents
        const documents: any = {};

        const idProof = formData.get('idProof') as File;
        if (idProof && idProof.size > 0) {
            documents.idProof = await saveFile(idProof, 'documents');
        } else {
            documents.idProof = formData.get('existingIdProof');
        }

        const addressProof = formData.get('addressProof') as File;
        if (addressProof && addressProof.size > 0) {
            documents.addressProof = await saveFile(addressProof, 'documents');
        } else {
            documents.addressProof = formData.get('existingAddressProof');
        }

        const ownershipProof = formData.get('ownershipProof') as File;
        if (ownershipProof && ownershipProof.size > 0) {
            documents.ownershipProof = await saveFile(ownershipProof, 'documents');
        } else {
            documents.ownershipProof = formData.get('existingOwnershipProof');
        }

        // Create Hotel Object
        const hotelData = {
            name,
            description,
            category: propertyType,
            price,
            labels: tags, // schema uses labels? AddHotel uses tags. Let's assume schema matches.
            rating,
            totalReviews,
            address: {
                street: address.street,
                city: address.city,
                state: address.state,
                country: address.country || 'India',
                zipCode: address.zipCode
            },
            contactInfo,
            policies,
            checkInTime,
            checkOutTime,
            amenities,
            highlights,
            images: propertyImages,
            rooms,
            documents,
            owner: (session.user as any).id,
            status: 'pending' // Default to pending for approval
        };

        const newHotel = await Hotel.create(hotelData);

        // Trigger notification for admin
        const user = session.user as any;
        await createNotification({
            type: 'HOTEL_UPDATE',
            title: 'New Property Added',
            message: `${user.name} added a new property: ${name}. Pending approval.`,
            userId: user.id || user._id,
            userName: user.name,
            userRole: user.role,
            hotelId: newHotel._id,
            hotelName: name
        });

        return NextResponse.json({ success: true, hotel: newHotel }, { status: 201 });

    } catch (error: any) {
        console.error('Error creating hotel:', error);
        return NextResponse.json({ error: error.message || 'Failed to create hotel' }, { status: 500 });
    }
}
