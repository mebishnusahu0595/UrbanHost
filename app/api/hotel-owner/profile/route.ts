import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { createNotification } from '@/lib/notifications';

// PUT - Update hotel owner profile (self-update)
export async function PUT(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const sessionRole = (session.user as any).role;
        if (sessionRole !== 'hotelOwner') {
            return NextResponse.json({ error: 'Forbidden - Hotel Owner access required' }, { status: 403 });
        }

        await dbConnect();

        const body = await req.json();
        const { name, phone, address, city, state } = body;

        // Find and update user
        const user = await User.findOne({ email: session.user.email });
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Only allow updating specific fields
        if (name) user.name = name;
        if (phone !== undefined) user.phone = phone;
        // Store additional fields in a custom object if needed
        // For now, we'll just update what's in the schema

        await user.save();

        // Trigger notification for admin
        await createNotification({
            type: 'PROFILE_UPDATE',
            title: 'Profile Updated',
            message: `${user.name} (${user.email}) updated their profile details.`,
            userId: user._id,
            userName: user.name,
            userRole: 'hotelOwner',
            details: {
                updates: Object.keys(body).filter(key => ['name', 'phone', 'address', 'city', 'state'].includes(key))
            }
        });

        return NextResponse.json({
            message: 'Profile updated successfully',
            user: {
                name: user.name,
                email: user.email,
                phone: user.phone,
            }
        }, { status: 200 });
    } catch (error: any) {
        console.error('Update hotel owner profile error:', error);
        return NextResponse.json({ error: error.message || 'Failed to update profile' }, { status: 500 });
    }
}
