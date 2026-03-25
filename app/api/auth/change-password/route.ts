import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import bcrypt from 'bcryptjs';
import { createNotification } from '@/lib/notifications';

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { currentPassword, newPassword } = await req.json();

        if (!currentPassword || !newPassword) {
            return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
        }

        if (newPassword.length < 6) {
            return NextResponse.json({ error: 'New password must be at least 6 characters' }, { status: 400 });
        }

        await dbConnect();

        // Find user and include password field
        const user = await User.findOne({ email: session.user.email }).select('+password');

        if (!user || !user.password) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Check current password
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return NextResponse.json({ error: 'Incorrect current password' }, { status: 400 });
        }

        // Update password (pre-save hook will hash it)
        user.password = newPassword;
        await user.save();

        // Only notify for hotel owners, property owners, and receptionists
        if (user.role === 'hotelOwner' || user.role === 'propertyOwner' || user.role === 'receptionist') {
            await createNotification({
                type: 'PASSWORD_CHANGE',
                title: 'Password Changed',
                message: `${user.name} (${user.email}) changed their account password.`,
                userId: user._id,
                userName: user.name,
                userRole: user.role,
                details: { event: 'password_updated' }
            });
        }

        return NextResponse.json({ message: 'Password updated successfully' });
    } catch (error: any) {
        console.error('Change password error:', error);
        return NextResponse.json({ error: error.message || 'Failed to update password' }, { status: 500 });
    }
}
