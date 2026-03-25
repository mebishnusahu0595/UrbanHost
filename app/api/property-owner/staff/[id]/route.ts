import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import Hotel from '@/models/Hotel';

import { createNotification } from '@/lib/notifications';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();
        const currentUser = await User.findOne({ email: session.user.email });

        if (!currentUser || !['propertyOwner', 'hotelOwner'].includes(currentUser.role)) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const { id } = await params;
        const { name, email, password, assignedHotel } = await req.json();

        // Verify target user is a receptionist and managed by this owner
        const targetUser = await User.findById(id);
        if (!targetUser || targetUser.role !== 'receptionist') {
            return NextResponse.json({ error: 'Staff not found' }, { status: 404 });
        }

        // Check ownership of the OLD assigned hotel to ensure permission
        // AND Check ownership of the NEW assigned hotel

        // Get all hotels owned by current user
        let ownedHotelIds: string[] = [];
        if (currentUser.role === 'hotelOwner' && currentUser.assignedHotels) {
            ownedHotelIds = currentUser.assignedHotels.map((id: any) => id.toString());
        } else {
            const hotels = await Hotel.find({ owner: currentUser._id }).select('_id');
            ownedHotelIds = hotels.map(h => h._id.toString());
        }

        if (!targetUser.assignedHotel || !ownedHotelIds.includes(targetUser.assignedHotel.toString())) {
            return NextResponse.json({ error: 'You do not have permission to edit this staff member' }, { status: 403 });
        }

        if (assignedHotel && !ownedHotelIds.includes(assignedHotel)) {
            return NextResponse.json({ error: 'You cannot assign staff to a hotel you do not own' }, { status: 403 });
        }

        // Update fields
        if (name) targetUser.name = name;
        if (email) targetUser.email = email;
        if (assignedHotel) targetUser.assignedHotel = assignedHotel;
        if (password && password.trim() !== "") {
            targetUser.password = password; // Will be hashed by pre-save hook
        }

        await targetUser.save();

        await createNotification({
            type: 'SYSTEM',
            title: 'Staff Member Updated',
            message: `${currentUser.name} updated details for receptionist: ${targetUser.name}`,
            userId: currentUser._id,
            userName: currentUser.name,
            userRole: currentUser.role,
            details: { staffId: targetUser._id, updates: { name, email, assignedHotel } }
        });

        return NextResponse.json(targetUser);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();
        const currentUser = await User.findOne({ email: session.user.email });

        if (!currentUser || !['propertyOwner', 'hotelOwner'].includes(currentUser.role)) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const { id } = await params;
        const targetUser = await User.findById(id);

        if (!targetUser || targetUser.role !== 'receptionist') {
            return NextResponse.json({ error: 'Staff not found' }, { status: 404 });
        }

        // Check permissions
        let ownedHotelIds: string[] = [];
        if (currentUser.role === 'hotelOwner' && currentUser.assignedHotels) {
            ownedHotelIds = currentUser.assignedHotels.map((id: any) => id.toString());
        } else {
            const hotels = await Hotel.find({ owner: currentUser._id }).select('_id');
            ownedHotelIds = hotels.map(h => h._id.toString());
        }

        if (!targetUser.assignedHotel || !ownedHotelIds.includes(targetUser.assignedHotel.toString())) {
            return NextResponse.json({ error: 'You do not have permission to delete this staff member' }, { status: 403 });
        }

        await User.findByIdAndDelete(id);

        await createNotification({
            type: 'SYSTEM',
            title: 'Staff Member Deleted',
            message: `${currentUser.name} deleted receptionist: ${targetUser.name}`,
            userId: currentUser._id,
            userName: currentUser.name,
            userRole: currentUser.role,
            details: { staffId: id, staffName: targetUser.name }
        });

        return NextResponse.json({ message: 'Staff deleted successfully' });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
