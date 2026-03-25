import { NextRequest, NextResponse } from 'next/server';
import { sendContactEmail } from '@/lib/mail';

export async function POST(req: NextRequest) {
    try {
        const { name, email, subject, message } = await req.json();

        if (!name || !email || !subject || !message) {
            return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
        }

        await sendContactEmail(name, email, subject, message);

        return NextResponse.json({
            success: true,
            message: 'Your inquiry has been sent successfully. We will get back to you soon.'
        });

    } catch (error: any) {
        console.error('Contact API error:', error);
        return NextResponse.json({ error: 'Failed to send message. Please try again later.' }, { status: 500 });
    }
}
