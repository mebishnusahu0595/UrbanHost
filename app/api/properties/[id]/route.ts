import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import Hotel from '@/models/Hotel';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { createNotification } from '@/lib/notifications';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;

    const hotel = await Hotel.findById(id)
      .populate('owner', 'name email phone');

    if (!hotel) {
      return NextResponse.json(
        { error: 'Hotel not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ hotel }, { status: 200 });
  } catch (error: any) {
    console.error('Get hotel error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch hotel' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const { id } = await params;

    let hotel = await Hotel.findById(id);
    if (!hotel) {
      return NextResponse.json({ error: 'Hotel not found' }, { status: 404 });
    }

    const contentType = req.headers.get('content-type') || '';

    let name, description, propertyType, address, contactInfo, policies, amenities, rooms, addons, status, rating, totalReviews, checkInTime, checkOutTime, highlights, tags;
    let images: string[] = [];
    let documents: any = {};
    let isJson = false;

    // Parse Payload (JSON or FormData)
    if (contentType.includes('application/json')) {
      isJson = true;
      const body = await req.json();
      name = body.propertyName || body.name;
      description = body.description || (body.propertyName ? `${body.propertyName} - ${body.location}` : '');
      propertyType = body.propertyType;
      address = body.address;
      contactInfo = body.contact || body.contactInfo;
      policies = body.policies || {};
      amenities = body.amenities || [];
      rooms = body.rooms || [];
      addons = body.addons || [];
      status = body.status;
      rating = body.rating;
      totalReviews = body.totalReviews;
      checkInTime = body.checkInTime;
      checkOutTime = body.checkOutTime;
      highlights = body.highlights;
      tags = body.labels || body.tags;

      // JSON mode: documents and images are passed as URLs logic
      documents = body.documents || {};
      // Combine exterior and interior photos if structured that way
      if (body.photos) {
        images = [...(body.photos.exterior || []), ...(body.photos.interior || [])];
      } else if (body.images) {
        images = body.images;
      }

    } else {
      const formData = await req.formData();
      name = formData.get('name') as string;
      description = formData.get('description') as string;
      propertyType = formData.get('propertyType') as string;

      const addressData = formData.get('address');
      const contactData = formData.get('contactInfo');
      const policiesData = formData.get('policies');
      const amenitiesData = formData.get('amenities');
      const roomsData = formData.get('rooms');
      const addonsData = formData.get('addons');
      const highlightsData = formData.get('highlights');
      const tagsData = formData.get('tags');

      if (addressData) address = JSON.parse(addressData as string);
      if (contactData) contactInfo = JSON.parse(contactData as string);
      if (policiesData) policies = JSON.parse(policiesData as string);
      if (amenitiesData) amenities = JSON.parse(amenitiesData as string);
      if (roomsData) rooms = JSON.parse(roomsData as string);
      if (addonsData) addons = JSON.parse(addonsData as string);
      if (highlightsData) highlights = JSON.parse(highlightsData as string);
      if (tagsData) tags = JSON.parse(tagsData as string);

      checkInTime = formData.get('checkInTime') as string;
      checkOutTime = formData.get('checkOutTime') as string;
      status = formData.get('status') as string;
      rating = formData.get('rating') ? Number(formData.get('rating')) : undefined;
      totalReviews = formData.get('totalReviews') ? Number(formData.get('totalReviews')) : undefined;

      // FormData Image Handling
      const existingImages = formData.get('existingImages') ? JSON.parse(formData.get('existingImages') as string) : [];
      images = [...existingImages];
      const imageFiles = formData.getAll('images');

      if (imageFiles && imageFiles.length > 0) {
        const uploadDir = process.env.NODE_ENV === 'production'
          ? join('/var/www/urbanhost/uploads', 'properties')
          : join(process.cwd(), 'public', 'uploads', 'properties');
        try { await mkdir(uploadDir, { recursive: true }); } catch (err) { }

        for (const fileItem of imageFiles) {
          if (fileItem instanceof File && fileItem.size > 0) {
            try {
              const bytes = await fileItem.arrayBuffer();
              const buffer = Buffer.from(bytes);
              const sanitizedName = fileItem.name.replace(/[^a-zA-Z0-9.]/g, '_');
              const filename = `${Date.now()}-${sanitizedName}`;
              const filepath = join(uploadDir, filename);
              await writeFile(filepath, buffer);
              images.push(`/uploads/properties/${filename}`);
            } catch (uploadErr) {
              console.error('Error saving updated main image:', uploadErr);
            }
          }
        }
      }

      // Handle room images for FormData mode (assuming rooms is array of objects, need to handle images within)
      // Note: Complicated logic from original file omitted for brevity/safety unless crucial.
      // Original logic iterated rooms and checked room_${i}_image. 
      // We will keep it if rooms parsed correctly.
      if (rooms && Array.isArray(rooms)) {
        for (let i = 0; i < rooms.length; i++) {
          const roomImageFiles = formData.getAll(`room_${i}_image`);
          if (roomImageFiles && roomImageFiles.length > 0) {
            const uploadDir = process.env.NODE_ENV === 'production'
              ? join('/var/www/urbanhost/uploads', 'properties')
              : join(process.cwd(), 'public', 'uploads', 'properties');
            try { await mkdir(uploadDir, { recursive: true }); } catch (err) { }

            for (const fileItem of roomImageFiles) {
              if (fileItem instanceof File && fileItem.size > 0) {
                const bytes = await fileItem.arrayBuffer();
                const buffer = Buffer.from(bytes);
                const sanitizedName = fileItem.name.replace(/[^a-zA-Z0-9.]/g, '_');
                const filename = `${Date.now()}-room-${i}-${sanitizedName}`;
                const filepath = join(uploadDir, filename);
                await writeFile(filepath, buffer);
                if (!rooms[i].images) rooms[i].images = [];
                rooms[i].images.push(`/uploads/properties/${filename}`);
              }
            }
          }
        }
      }

      // FormData Document Handling
      documents = {
        ownershipProof: formData.get('existingOwnershipProof') || hotel.documents?.ownershipProof || null,
        panCard: formData.get('existingPanCard') || hotel.documents?.panCard || null,
      };
      const docFields = ['ownershipProof', 'panCard']; // Add others if needed
      for (const field of docFields) {
        const file = formData.get(field) as File;
        if (file && file.size > 0 && typeof file !== 'string') {
          const uploadDir = process.env.NODE_ENV === 'production'
            ? join('/var/www/urbanhost/uploads', 'documents')
            : join(process.cwd(), 'public', 'uploads', 'documents');
          try { await mkdir(uploadDir, { recursive: true }); } catch (err) { }
          const bytes = await file.arrayBuffer();
          const buffer = Buffer.from(bytes);
          const filename = `${Date.now()}-${file.name.replace(/\s+/g, '_')}`;
          const filepath = join(uploadDir, filename);
          await writeFile(filepath, buffer);
          documents[field] = `/uploads/documents/${filename}`;
        }
      }
    }

    // Common Fallbacks / Defaults
    if (!hotel.rating && rating) hotel.rating = rating;
    if (!hotel.totalReviews && totalReviews) hotel.totalReviews = totalReviews;

    // Map propertyType to category enum (Capitalized) if provided
    let category = hotel.category;
    if (propertyType) {
      const categoryMap: Record<string, string> = {
        'hotel': 'Hotel',
        'resort': 'Resort',
        'villa': 'Villa',
        'apartment': 'Apartment',
        'guesthouse': 'Guesthouse',
        'hostel': 'Hostel',
        'boutique': 'Boutique'
      };
      category = categoryMap[propertyType.toLowerCase()] || 'Hotel';
    }

    // Track changes for notification
    const oldHotel = hotel.toObject();
    const changeDetails: { field: string; oldValue: any; newValue: any }[] = [];

    // Compare fields and track changes (Simplified)
    if (name && name !== oldHotel.name) changeDetails.push({ field: 'name', oldValue: oldHotel.name, newValue: name });
    if (description && description !== oldHotel.description) {
      changeDetails.push({ field: 'description', oldValue: oldHotel.description, newValue: description });
    }
    if (address && JSON.stringify(address) !== JSON.stringify(oldHotel.address)) {
      changeDetails.push({ field: 'address', oldValue: oldHotel.address, newValue: address });
    }
    if (amenities && JSON.stringify(amenities) !== JSON.stringify(oldHotel.amenities)) {
      changeDetails.push({ field: 'amenities', oldValue: oldHotel.amenities, newValue: amenities });
    }
    if (checkInTime && checkInTime !== oldHotel.checkInTime) {
      changeDetails.push({ field: 'checkInTime', oldValue: oldHotel.checkInTime, newValue: checkInTime });
    }
    if (checkOutTime && checkOutTime !== oldHotel.checkOutTime) {
      changeDetails.push({ field: 'checkOutTime', oldValue: oldHotel.checkOutTime, newValue: checkOutTime });
    }
    if (contactInfo && JSON.stringify(contactInfo) !== JSON.stringify(oldHotel.contactInfo)) {
      changeDetails.push({ field: 'contactInfo', oldValue: oldHotel.contactInfo, newValue: contactInfo });
    }
    if (category && category !== oldHotel.category) {
      changeDetails.push({ field: 'category', oldValue: oldHotel.category, newValue: category });
    }
    if (images && JSON.stringify(images) !== JSON.stringify(oldHotel.images)) {
      changeDetails.push({ field: 'images', oldValue: oldHotel.images, newValue: images });
    }
    if (policies && JSON.stringify(policies) !== JSON.stringify(oldHotel.policies)) {
      changeDetails.push({ field: 'policies', oldValue: oldHotel.policies, newValue: policies });
    }
    if (rooms && JSON.stringify(rooms) !== JSON.stringify(oldHotel.rooms)) {
      changeDetails.push({ field: 'rooms', oldValue: oldHotel.rooms, newValue: rooms });
    }
    if (addons && JSON.stringify(addons) !== JSON.stringify(oldHotel.addons)) {
      changeDetails.push({ field: 'addons', oldValue: oldHotel.addons, newValue: addons });
    }
    if (status && status !== oldHotel.status) {
      changeDetails.push({ field: 'status', oldValue: oldHotel.status, newValue: status });
    }
    if (highlights && JSON.stringify(highlights) !== JSON.stringify(oldHotel.highlights)) {
      changeDetails.push({ field: 'highlights', oldValue: oldHotel.highlights, newValue: highlights });
    }
    if (tags && JSON.stringify(tags) !== JSON.stringify(oldHotel.labels)) {
      changeDetails.push({ field: 'labels', oldValue: oldHotel.labels, newValue: tags });
    }
    if (rating && rating !== oldHotel.rating) {
      changeDetails.push({ field: 'rating', oldValue: oldHotel.rating, newValue: rating });
    }
    if (totalReviews && totalReviews !== oldHotel.totalReviews) {
      changeDetails.push({ field: 'totalReviews', oldValue: oldHotel.totalReviews, newValue: totalReviews });
    }
    // Documents comparison is more complex due to merging, might need a deeper check if specific document changes need tracking.
    // For now, we'll assume the merge handles it.

    // Update hotel
    hotel = await Hotel.findByIdAndUpdate(
      id,
      {
        $set: {
          name,
          description,
          address,
          images,
          amenities,
          rooms,
          addons,
          status,
          contactInfo,
          policies,
          checkInTime,
          checkOutTime,
          documents: { ...oldHotel.documents, ...documents }, // Merge old documents with new ones
          highlights,
          labels: tags,
          category,
          rating,
          totalReviews,
        }
      },
      { new: true, runValidators: true }
    );

    if (!hotel) {
      return NextResponse.json({ error: 'Hotel not found' }, { status: 404 });
    }

    // Trigger notification for admin with detailed changes
    if ((session?.user as any).role !== 'admin' && changeDetails.length > 0) {
      const user = session.user as any;
      await createNotification({
        type: 'HOTEL_UPDATE',
        title: 'Property Updated',
        message: `${user.name} updated property: ${hotel.name}`,
        userId: user.id || user._id,
        userName: user.name,
        userRole: user.role,
        hotelId: hotel._id,
        hotelName: hotel.name,
        changeDetails: changeDetails
      });
    }

    return NextResponse.json(
      { message: 'Hotel updated successfully', hotel },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Update hotel error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update hotel' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    await dbConnect();
    const { id } = await params;

    const hotel = await Hotel.findByIdAndDelete(id);

    if (hotel && session && (session.user as any).role !== 'admin') {
      const user = session.user as any;
      await createNotification({
        type: 'HOTEL_UPDATE',
        title: 'Property Deleted',
        message: `${user.name} deleted property: ${hotel.name}`,
        userId: user.id || user._id,
        userName: user.name,
        userRole: user.role,
        hotelId: hotel._id,
        hotelName: hotel.name
      });
    }

    if (!hotel) {
      return NextResponse.json(
        { error: 'Hotel not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: 'Hotel deleted successfully' },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Delete hotel error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete hotel' },
      { status: 500 }
    );
  }
}
