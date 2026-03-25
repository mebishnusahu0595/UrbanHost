import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { sendReceptionistCredentials } from '@/lib/mail';

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userRole = (session.user as any).role;

        // Only admin can create receptionists
        if (userRole !== 'admin') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        await dbConnect();

        const { name, email, phone, assignedHotel, password } = await req.json();

        if (!name || !email || !assignedHotel || !password) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return NextResponse.json({ error: 'Email already exists' }, { status: 400 });
        }

        // Create receptionist
        const receptionist = new User({
            name,
            email,
            phone,
            password,
            role: 'receptionist',
            assignedHotel,
            isEmailVerified: true,
        });

        await receptionist.save();

        // Send credentials email
        try {
            await sendReceptionistCredentials(email, name, password, assignedHotel);
        } catch (emailError) {
            console.error('Failed to send email:', emailError);
        }

        return NextResponse.json({
            success: true,
            message: 'Receptionist created successfully',
            receptionist: {
                id: receptionist._id,
                name: receptionist.name,
                email: receptionist.email,
                assignedHotel: receptionist.assignedHotel
            }
        });

    } catch (error: any) {
        console.error('Create receptionist error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userRole = (session.user as any).role;

        // Only admin can view receptionists
        if (userRole !== 'admin') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        await dbConnect();

        const receptionists = await User.find({ role: 'receptionist' })
            .populate('assignedHotel', 'name address')
            .select('-password')
            .sort({ createdAt: -1 });

        return NextResponse.json({ receptionists });

    } catch (error: any) {
        console.error('Get receptionists error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
