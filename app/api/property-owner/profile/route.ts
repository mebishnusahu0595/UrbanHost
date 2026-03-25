import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { createNotification } from '@/lib/notifications';

export async function PUT(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();
        const user = await User.findOne({ email: session.user.email });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const data = await req.json();

        // Fields allowed to be updated
        const allowedFields = ['phone', 'address', 'city', 'state', 'pincode', 'companyName', 'gstin'];
        let changeDetails: { field: string; oldValue: any; newValue: any }[] = [];

        allowedFields.forEach(field => {
            if (data[field] !== undefined && data[field] !== (user as any)[field]) {
                changeDetails.push({
                    field,
                    oldValue: (user as any)[field] || 'N/A',
                    newValue: data[field]
                });
                (user as any)[field] = data[field];
            }
        });

        // Handle Name separately
        let newName = user.name;
        if (data.firstName && data.lastName) {
            newName = `${data.firstName} ${data.lastName}`;
        } else if (data.name) {
            newName = data.name;
        }

        if (newName !== user.name) {
            changeDetails.push({
                field: 'name',
                oldValue: user.name,
                newValue: newName
            });
            user.name = newName;
        }

        await user.save();

        // Create Notification
        if (changeDetails.length > 0) {
            await createNotification({
                type: 'PROFILE_UPDATE',
                title: 'Profile Updated',
                message: `${user.name} (${user.email}) updated their profile details.`,
                userId: user._id,
                userName: user.name,
                userRole: user.role,
                changeDetails
            });
        }

        return NextResponse.json({ message: 'Profile updated successfully', user });
    } catch (error: any) {
        console.error("Profile update error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
