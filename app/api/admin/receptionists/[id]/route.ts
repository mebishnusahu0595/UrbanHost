import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { sendReceptionistCredentials } from '@/lib/mail';

// Update receptionist
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

        const userRole = (session.user as any).role;

        if (userRole !== 'admin') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        await dbConnect();

        const { name, phone, assignedHotel } = await req.json();

        const receptionist = await User.findByIdAndUpdate(
            id,
            {
                $set: {
                    name,
                    phone,
                    assignedHotel,
                }
            },
            { new: true }
        ).populate('assignedHotel', 'name address');

        if (!receptionist) {
            return NextResponse.json({ error: 'Receptionist not found' }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            message: 'Receptionist updated successfully',
            receptionist
        });

    } catch (error: any) {
        console.error('Update receptionist error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// Delete receptionist
export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const session = await getServerSession(authOptions);

        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userRole = (session.user as any).role;

        if (userRole !== 'admin') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        await dbConnect();

        const receptionist = await User.findByIdAndDelete(id);

        if (!receptionist) {
            return NextResponse.json({ error: 'Receptionist not found' }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            message: 'Receptionist deleted successfully'
        });

    } catch (error: any) {
        console.error('Delete receptionist error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
