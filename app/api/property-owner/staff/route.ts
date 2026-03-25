import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import Hotel from '@/models/Hotel';
import bcrypt from 'bcryptjs';
import { createNotification } from '@/lib/notifications';

export async function GET(req: NextRequest) {
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

        // Get hotels owned by this user
        let hotelIds: any[] = [];
        if (currentUser.role === 'hotelOwner' && currentUser.assignedHotels) {
            hotelIds = currentUser.assignedHotels;
        } else {
            const hotels = await Hotel.find({ owner: currentUser._id }).select('_id');
            hotelIds = hotels.map(h => h._id);
        }

        // Find staff (receptionists) assigned to these hotels
        const staff = await User.find({
            role: 'receptionist',
            assignedHotel: { $in: hotelIds }
        }).populate('assignedHotel', 'name');

        return NextResponse.json(staff);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
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

        const { name, email, password, assignedHotel } = await req.json();

        if (!name || !email || !password || !assignedHotel) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Verify ownership of the assigned hotel
        let isOwner = false;
        if (currentUser.role === 'hotelOwner' && currentUser.assignedHotels) {
            isOwner = currentUser.assignedHotels.some((h: any) => h.toString() === assignedHotel);
        } else {
            const hotel = await Hotel.findOne({ _id: assignedHotel, owner: currentUser._id });
            if (hotel) isOwner = true;
        }

        if (!isOwner) {
            return NextResponse.json({ error: 'You do not own this hotel' }, { status: 403 });
        }

        // Check if user exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return NextResponse.json({ error: 'User already exists' }, { status: 400 });
        }

        // Create new receptionist - Password hashing is handled by pre-save hook in User model
        const newStaff = await User.create({
            name,
            email,
            password, // Plain text here, model hook will hash it
            role: 'receptionist',
            assignedHotel,
            isEmailVerified: true, // Auto-verify staff
        });

        await createNotification({
            type: 'SYSTEM',
            title: 'New Staff Added',
            message: `${currentUser.name} added a receptionist: ${name} (${email}) for hotel ID: ${assignedHotel}`,
            userId: currentUser._id,
            userName: currentUser.name,
            userRole: currentUser.role,
            details: { staffId: newStaff._id, staffEmail: email, assignedHotel }
        });

        return NextResponse.json(newStaff, { status: 201 });
    } catch (error: any) {
        console.error("Create staff error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
