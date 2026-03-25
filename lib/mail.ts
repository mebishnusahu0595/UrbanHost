import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: parseInt(process.env.SMTP_PORT || "587"),
    secure: false, // true for 465, false for 587
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
    },
});

export const sendApprovalWithCredentials = async (email: string, name: string, password: string, propertyName: string) => {
    const htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #f0f0f0; border-radius: 12px;">
            <div style="text-align: center; margin-bottom: 25px;">
                <h1 style="color: #1E3A8A; margin: 0; font-size: 28px;">Urban Host</h1>
                <p style="color: #64748b; margin: 5px 0; font-weight: 500;">Partner Notification</p>
            </div>
            
            <div style="background: linear-gradient(135deg, #1E3A8A 0%, #3B82F6 100%); color: white; padding: 30px; border-radius: 16px; margin-bottom: 24px; text-align: center;">
                <h2 style="margin: 0 0 10px 0; font-size: 24px;">Congratulations, ${name}!</h2>
                <p style="margin: 0; opacity: 0.9; font-size: 16px;">Your property "<strong>${propertyName}</strong>" is now live on Urban Host.</p>
            </div>
            
            <div style="background: #f8fafc; padding: 24px; border-radius: 16px; border: 1px solid #e2e8f0; margin-bottom: 24px;">
                <h3 style="margin: 0 0 16px 0; color: #0f172a; font-size: 18px;">Access Your Dashboard</h3>
                <table style="width: 100%; border-collapse: collapse;">
                    <tr>
                        <td style="padding: 10px 0; color: #64748b; font-size: 14px;">Email:</td>
                        <td style="padding: 10px 0; font-weight: 700; color: #0f172a;">${email}</td>
                    </tr>
                    <tr>
                        <td style="padding: 10px 0; color: #64748b; font-size: 14px;">Temporary Password:</td>
                        <td style="padding: 10px 0;">
                            <span style="font-family: ui-monospace, monospace; background: #fff; padding: 6px 12px; border-radius: 6px; border: 1px solid #cbd5e1; font-weight: 700; color: #1E3A8A;">${password}</span>
                        </td>
                    </tr>
                </table>
            </div>
            
            <div style="text-align: center; margin: 32px 0;">
                <a href="${process.env.NEXTAUTH_URL}/login" 
                   style="background: #1E3A8A; color: white; padding: 14px 32px; text-decoration: none; border-radius: 10px; font-weight: 700; display: inline-block; font-size: 16px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
                    Login to Partner Portal
                </a>
            </div>

            <div style="background: #fffbeb; padding: 16px; border-radius: 12px; border-left: 4px solid #f59e0b; margin-bottom: 24px;">
                <p style="margin: 0; color: #92400e; font-size: 13px; line-height: 1.5;">
                    <strong>Security Tip:</strong> Please change your password immediately after your first login to keep your account secure.
                </p>
            </div>
            
            <div style="text-align: center; color: #94a3b8; font-size: 12px; border-top: 1px solid #f1f5f9; padding-top: 24px;">
                <p>© ${new Date().getFullYear()} Urban Host Hospitality Services. All rights reserved.</p>
                <p>Support: kuberhoteliers@gmail.com</p>
            </div>
        </div>
    `;

    return transporter.sendMail({
        from: `"Urban Host" <${process.env.SMTP_USER}>`,
        to: email,
        subject: `🎉 Your Property "${propertyName}" is Live!`,
        html: htmlContent,
    });
};

export const sendRejectionEmail = async (email: string, name: string, propertyName: string, reason?: string) => {
    const htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #f0f0f0; border-radius: 12px;">
            <div style="text-align: center; margin-bottom: 25px;">
                <h1 style="color: #1E3A8A; margin: 0; font-size: 28px;">Urban Host</h1>
            </div>
            
            <div style="background: #fff1f2; color: #be123c; padding: 30px; border-radius: 16px; margin-bottom: 24px; text-align: center; border: 1px solid #fecdd3;">
                <h2 style="margin: 0 0 10px 0; font-size: 20px;">Review Update: Rejected</h2>
                <p style="margin: 0; opacity: 0.9; font-size: 16px;">We've finished reviewing your property listing "<strong>${propertyName}</strong>".</p>
            </div>
            
            <div style="padding: 10px 0; color: #475569; line-height: 1.6;">
                <p>Hi ${name},</p>
                <p>Thank you for your interest in partnering with Urban Host. At this time, we are unable to approve your listing for <strong>${propertyName}</strong>.</p>
                
                ${reason ? `
                <div style="background: #f8fafc; padding: 20px; border-radius: 12px; border: 1px solid #e2e8f0; margin: 20px 0;">
                    <p style="margin: 0 0 8px 0; font-weight: 700; color: #0f172a;">Reason for rejection:</p>
                    <p style="margin: 0; font-size: 14px; color: #64748b;">${reason}</p>
                </div>
                ` : ''}
                
                <p>You can review our quality standards and update your property details through your dashboard. Once the necessary updates are made, you can resubmit for review.</p>
                
                <div style="text-align: center; margin: 32px 0;">
                    <a href="${process.env.NEXTAUTH_URL}/property-owner/dashboard" 
                       style="background: #1E3A8A; color: white; padding: 12px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block;">
                        Go to Dashboard
                    </a>
                </div>

                <p>If you have any questions or believe this was a mistake, please reach out to our support team.</p>
            </div>
            
            <div style="text-align: center; color: #94a3b8; font-size: 12px; border-top: 1px solid #f1f5f9; padding-top: 24px; margin-top: 30px;">
                <p>© ${new Date().getFullYear()} Urban Host. All rights reserved.</p>
                <p>Support: kuberhoteliers@gmail.com</p>
            </div>
        </div>
    `;

    return transporter.sendMail({
        from: `"Urban Host" <${process.env.SMTP_USER}>`,
        to: email,
        subject: `Property Update: "${propertyName}" Listing Status`,
        html: htmlContent,
    });
};

export const sendReApprovalEmail = async (email: string, name: string, propertyName: string) => {
    const htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #f0f0f0; border-radius: 12px;">
            <div style="text-align: center; margin-bottom: 25px;">
                <h1 style="color: #1E3A8A; margin: 0; font-size: 28px;">Urban Host</h1>
            </div>
            
            <div style="background: #f0fdf4; color: #15803d; padding: 30px; border-radius: 16px; margin-bottom: 24px; text-align: center; border: 1px solid #bbf7d0;">
                <h2 style="margin: 0 0 10px 0; font-size: 24px;">Re-Approved!</h2>
                <p style="margin: 0; opacity: 0.9; font-size: 16px;">Your property "<strong>${propertyName}</strong>" has been re-approved after review and is now live.</p>
            </div>
            
            <div style="padding: 10px 0; color: #475569; line-height: 1.6;">
                <p>Hi ${name},</p>
                <p>We've completed a second review of your property <strong>${propertyName}</strong> and we're happy to inform you it's now approved.</p>
                <p>All updates you made have been verified, and travelers can now discover and book your property.</p>
                
                <div style="text-align: center; margin: 32px 0;">
                    <a href="${process.env.NEXTAUTH_URL}/property-owner/dashboard" 
                       style="background: #1E3A8A; color: white; padding: 14px 32px; text-decoration: none; border-radius: 10px; font-weight: 700; display: inline-block; font-size: 16px;">
                        Go to Dashboard
                    </a>
                </div>
            </div>
            
            <div style="text-align: center; color: #94a3b8; font-size: 12px; border-top: 1px solid #f1f5f9; padding-top: 24px;">
                <p>© ${new Date().getFullYear()} Urban Host. All rights reserved.</p>
                <p>Support: kuberhoteliers@gmail.com</p>
            </div>
        </div>
    `;

    return transporter.sendMail({
        from: `"Urban Host" <${process.env.SMTP_USER}>`,
        to: email,
        subject: `✅ Re-Approved: "${propertyName}" is now Live!`,
        html: htmlContent,
    });
};

export const sendPropertyLiveEmail = async (email: string, name: string, propertyName: string) => {
    const htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #f0f0f0; border-radius: 12px;">
            <div style="text-align: center; margin-bottom: 25px;">
                <h1 style="color: #1E3A8A; margin: 0; font-size: 28px;">Urban Host</h1>
            </div>
            
            <div style="background: linear-gradient(135deg, #1E3A8A 0%, #3B82F6 100%); color: white; padding: 30px; border-radius: 16px; margin-bottom: 24px; text-align: center;">
                <h2 style="margin: 0 0 10px 0; font-size: 24px;">Your Property is Live!</h2>
                <p style="margin: 0; opacity: 0.9; font-size: 16px;">"<strong>${propertyName}</strong>" is now active on Urban Host.</p>
            </div>
            
            <div style="padding: 10px 0; color: #475569; line-height: 1.6;">
                <p>Hi ${name},</p>
                <p>We've finished reviewing your property <strong>${propertyName}</strong> and it's now officially bookable on our platform!</p>
                <p>You can manage bookings, update availability, and more through your partner dashboard.</p>
                
                <div style="text-align: center; margin: 32px 0;">
                    <a href="${process.env.NEXTAUTH_URL}/property-owner/dashboard" 
                       style="background: #1E3A8A; color: white; padding: 14px 32px; text-decoration: none; border-radius: 10px; font-weight: 700; display: inline-block; font-size: 16px;">
                        Partner Dashboard
                    </a>
                </div>
            </div>
            
            <div style="text-align: center; color: #94a3b8; font-size: 12px; border-top: 1px solid #f1f5f9; padding-top: 24px;">
                <p>© ${new Date().getFullYear()} Urban Host. All rights reserved.</p>
            </div>
        </div>
    `;

    return transporter.sendMail({
        from: `"Urban Host" <${process.env.SMTP_USER}>`,
        to: email,
        subject: `🎉 Your Property "${propertyName}" is now Live!`,
        html: htmlContent,
    });
};
export const sendContactEmail = async (name: string, email: string, subject: string, message: string) => {
    const htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #f0f0f0; border-radius: 12px;">
            <div style="text-align: center; margin-bottom: 25px;">
                <h1 style="color: #1E3A8A; margin: 0; font-size: 28px;">Urban Host</h1>
                <p style="color: #64748b; margin: 5px 0; font-weight: 500;">New Contact Inquiry</p>
            </div>
            
            <div style="background: #f8fafc; padding: 24px; border-radius: 16px; border: 1px solid #e2e8f0; margin-bottom: 24px;">
                <h3 style="margin: 0 0 16px 0; color: #0f172a; font-size: 18px;">Inquiry Details</h3>
                <table style="width: 100%; border-collapse: collapse;">
                    <tr>
                        <td style="padding: 10px 0; color: #64748b; font-size: 14px;">Name:</td>
                        <td style="padding: 10px 0; font-weight: 700; color: #0f172a;">${name}</td>
                    </tr>
                    <tr>
                        <td style="padding: 10px 0; color: #64748b; font-size: 14px;">Email:</td>
                        <td style="padding: 10px 0; font-weight: 700; color: #0f172a;">${email}</td>
                    </tr>
                    <tr>
                        <td style="padding: 10px 0; color: #64748b; font-size: 14px;">Subject:</td>
                        <td style="padding: 10px 0; font-weight: 700; color: #0f172a;">${subject}</td>
                    </tr>
                </table>
                <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
                    <p style="color: #64748b; font-size: 14px; margin-bottom: 8px;">Message:</p>
                    <p style="color: #0f172a; font-size: 15px; line-height: 1.6; white-space: pre-wrap;">${message}</p>
                </div>
            </div>
            
            <div style="text-align: center; color: #94a3b8; font-size: 12px; border-top: 1px solid #f1f5f9; padding-top: 24px;">
                <p>© ${new Date().getFullYear()} Urban Host. All rights reserved.</p>
            </div>
        </div>
    `;

    return transporter.sendMail({
        from: `"Urban Host Contact" <${process.env.SMTP_USER}>`,
        to: "kuberhoteliers@gmail.com",
        replyTo: email,
        subject: `New Contact Inquiry: ${subject}`,
        html: htmlContent,
    });
};

export const sendReceptionistCredentials = async (email: string, name: string, password: string, hotelId: string) => {
    const htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #f0f0f0; border-radius: 12px;">
            <div style="text-align: center; margin-bottom: 25px;">
                <h1 style="color: #1E3A8A; margin: 0; font-size: 28px;">Urban Host</h1>
                <p style="color: #64748b; margin: 5px 0; font-weight: 500;">Receptionist Account Created</p>
            </div>
            
            <div style="background: linear-gradient(135deg, #1E3A8A 0%, #3B82F6 100%); color: white; padding: 30px; border-radius: 16px; margin-bottom: 24px; text-align: center;">
                <h2 style="margin: 0 0 10px 0; font-size: 24px;">Welcome, ${name}!</h2>
                <p style="margin: 0; opacity: 0.9; font-size: 16px;">Your receptionist account has been created.</p>
            </div>
            
            <div style="background: #f8fafc; padding: 24px; border-radius: 16px; border: 1px solid #e2e8f0; margin-bottom: 24px;">
                <h3 style="margin: 0 0 16px 0; color: #0f172a; font-size: 18px;">Login Credentials</h3>
                <table style="width: 100%; border-collapse: collapse;">
                    <tr>
                        <td style="padding: 10px 0; color: #64748b; font-size: 14px;">Email:</td>
                        <td style="padding: 10px 0; font-weight: 700; color: #0f172a;">${email}</td>
                    </tr>
                    <tr>
                        <td style="padding: 10px 0; color: #64748b; font-size: 14px;">Password:</td>
                        <td style="padding: 10px 0;">
                            <span style="font-family: ui-monospace, monospace; background: #fff; padding: 6px 12px; border-radius: 6px; border: 1px solid #cbd5e1; font-weight: 700; color: #1E3A8A;">${password}</span>
                        </td>
                    </tr>
                </table>
            </div>
            
            <div style="text-align: center; margin: 32px 0;">
                <a href="${process.env.NEXTAUTH_URL}/login" 
                   style="background: #1E3A8A; color: white; padding: 14px 32px; text-decoration: none; border-radius: 10px; font-weight: 700; display: inline-block; font-size: 16px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
                    Login to Reception Panel
                </a>
            </div>
            
            <div style="background: #fffbeb; padding: 16px; border-radius: 12px; border-left: 4px solid #f59e0b; margin-bottom: 24px;">
                <p style="margin: 0; color: #92400e; font-size: 13px; line-height: 1.5;">
                    <strong>Important:</strong> You have access to view and manage bookings for your assigned hotel only. You can mark guests as checked-in when they arrive.
                </p>
            </div>
            
            <div style="text-align: center; color: #94a3b8; font-size: 12px; border-top: 1px solid #f1f5f9; padding-top: 24px;">
                <p>© ${new Date().getFullYear()} Urban Host. All rights reserved.</p>
                <p>Support: kuberhoteliers@gmail.com</p>
            </div>
        </div>
    `;

    return transporter.sendMail({
        from: `"Urban Host" <${process.env.SMTP_USER}>`,
        to: email,
        subject: `🎉 Your Receptionist Account is Ready!`,
        html: htmlContent,
    });
};

export const sendOTP = async (email: string, otp: string) => {
    const htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #f0f0f0; border-radius: 12px;">
            <div style="text-align: center; margin-bottom: 25px;">
                <h1 style="color: #1E3A8A; margin: 0; font-size: 28px;">Urban Host</h1>
                <p style="color: #64748b; margin: 5px 0; font-weight: 500;">Verification Code</p>
            </div>
            
            <div style="background: #f0f9ff; padding: 30px; border-radius: 16px; margin-bottom: 24px; text-align: center; border: 1px solid #bae6fd;">
                <h2 style="margin: 0 0 16px 0; color: #0284c7; font-size: 20px;">Your One-Time Password</h2>
                <div style="margin: 20px 0;">
                    <span style="font-family: monospace; font-size: 32px; letter-spacing: 4px; font-weight: bold; color: #0f172a; background: white; padding: 16px 32px; border-radius: 12px; border: 2px dashed #94a3b8; display: inline-block;">
                        ${otp}
                    </span>
                </div>
                <p style="margin: 0; color: #64748b; font-size: 14px;">This code will expire in 10 minutes.</p>
            </div>
            
            <div style="text-align: center; color: #94a3b8; font-size: 12px; border-top: 1px solid #f1f5f9; padding-top: 24px;">
                <p>If you didn't request this code, you can ignore this email.</p>
                <p>© ${new Date().getFullYear()} Urban Host. All rights reserved.</p>
            </div>
        </div>
    `;

    return transporter.sendMail({
        from: `"Urban Host" <${process.env.SMTP_USER}>`,
        to: email,
        subject: `Your Login OTP - ${otp}`,
        html: htmlContent,
    });
};

export const sendHotelOwnerCredentials = async (email: string, name: string, password: string, accessType: 'view' | 'edit') => {
    const htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #f0f0f0; border-radius: 12px;">
            <div style="text-align: center; margin-bottom: 25px;">
                <h1 style="color: #1E3A8A; margin: 0; font-size: 28px;">Urban Host</h1>
                <p style="color: #64748b; margin: 5px 0; font-weight: 500;">Hotel Owner Account</p>
            </div>
            
            <div style="background: linear-gradient(135deg, #1E3A8A 0%, #3B82F6 100%); color: white; padding: 30px; border-radius: 16px; margin-bottom: 24px; text-align: center;">
                <h2 style="margin: 0 0 10px 0; font-size: 24px;">Welcome, ${name}!</h2>
                <p style="margin: 0; opacity: 0.9; font-size: 16px;">Your Hotel Owner account has been created.</p>
            </div>
            
            <div style="background: #f8fafc; padding: 24px; border-radius: 16px; border: 1px solid #e2e8f0; margin-bottom: 24px;">
                <h3 style="margin: 0 0 16px 0; color: #0f172a; font-size: 18px;">Login Credentials</h3>
                <table style="width: 100%; border-collapse: collapse;">
                    <tr>
                        <td style="padding: 10px 0; color: #64748b; font-size: 14px;">Email:</td>
                        <td style="padding: 10px 0; font-weight: 700; color: #0f172a;">${email}</td>
                    </tr>
                    <tr>
                        <td style="padding: 10px 0; color: #64748b; font-size: 14px;">Password:</td>
                        <td style="padding: 10px 0;">
                            <span style="font-family: ui-monospace, monospace; background: #fff; padding: 6px 12px; border-radius: 6px; border: 1px solid #cbd5e1; font-weight: 700; color: #1E3A8A;">${password}</span>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 10px 0; color: #64748b; font-size: 14px;">Access Type:</td>
                        <td style="padding: 10px 0;">
                            <span style="background: ${accessType === 'edit' ? '#dcfce7' : '#dbeafe'}; color: ${accessType === 'edit' ? '#166534' : '#1e40af'}; padding: 4px 12px; border-radius: 6px; font-weight: 600; font-size: 13px;">
                                ${accessType === 'edit' ? '✏️ Edit Access' : '👁️ View Only'}
                            </span>
                        </td>
                    </tr>
                </table>
            </div>
            
            <div style="text-align: center; margin: 32px 0;">
                <a href="${process.env.NEXTAUTH_URL}/login" 
                   style="background: #1E3A8A; color: white; padding: 14px 32px; text-decoration: none; border-radius: 10px; font-weight: 700; display: inline-block; font-size: 16px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
                    Login to Your Account
                </a>
            </div>

            <div style="background: #e0f2fe; padding: 20px; border-radius: 12px; border-left: 4px solid #0284c7; margin-bottom: 24px;">
                <h4 style="margin: 0 0 12px 0; color: #0c4a6e; font-size: 16px;">📊 Admin Panel Access</h4>
                <p style="margin: 0 0 12px 0; color: #0369a1; font-size: 14px; line-height: 1.5;">
                    View and manage your assigned properties through the admin panel:
                </p>
                <div style="text-align: center;">
                    <a href="https://urbanhost.in/admin/hotel-owners" 
                       style="background: #0284c7; color: white; padding: 10px 24px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block; font-size: 14px;">
                        View in Admin Panel
                    </a>
                </div>
            </div>
            
            <div style="background: #fffbeb; padding: 16px; border-radius: 12px; border-left: 4px solid #f59e0b; margin-bottom: 24px;">
                <p style="margin: 0; color: #92400e; font-size: 13px; line-height: 1.5;">
                    <strong>Security Tip:</strong> Please change your password after your first login to keep your account secure.
                </p>
            </div>
            
            <div style="text-align: center; color: #94a3b8; font-size: 12px; border-top: 1px solid #f1f5f9; padding-top: 24px;">
                <p>© ${new Date().getFullYear()} Urban Host. All rights reserved.</p>
                <p>Support: kuberhoteliers@gmail.com</p>
            </div>
        </div>
    `;

    return transporter.sendMail({
        from: `"Urban Host" <${process.env.SMTP_USER}>`,
        to: email,
        subject: `🏨 Your Hotel Owner Account is Ready!`,
        html: htmlContent,
    });
};

export const sendBookingConfirmation = async (
    email: string,
    customerName: string,
    bookingId: string,
    hotelName: string,
    checkIn: Date,
    checkOut: Date,
    totalAmount: number,
    roomType: string,
    guests: number | { adults: number; children: number }
) => {
    const formatDate = (date: Date) => {
        return new Date(date).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
        });
    };

    const formatGuests = (g: number | { adults: number; children: number }) => {
        if (typeof g === 'number') return `${g} Guests`;
        const parts = [];
        if (g.adults) parts.push(`${g.adults} Adult${g.adults > 1 ? 's' : ''}`);
        if (g.children && g.children > 0) parts.push(`${g.children} Child${g.children > 1 ? 'ren' : ''}`);
        return parts.length > 0 ? parts.join(', ') : '0 Guests';
    };

    const formattedAmount = new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
    }).format(totalAmount);

    const htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
            <div style="text-align: center; margin-bottom: 25px; padding-bottom: 20px; border-bottom: 1px solid #f0f0f0;">
                <h1 style="color: #1E3A8A; margin: 0; font-size: 28px;">Urban Host</h1>
                <p style="color: #64748b; margin: 5px 0; font-weight: 500;">Booking Confirmation</p>
            </div>
            
            <div style="background: #ecfdf5; color: #047857; padding: 20px; border-radius: 12px; margin-bottom: 24px; text-align: center; border: 1px solid #6ee7b7;">
                <h2 style="margin: 0 0 8px 0; font-size: 20px;">Booking Confirmed!</h2>
                <p style="margin: 0; font-size: 15px;">Your reservation at <strong>${hotelName}</strong> is verified.</p>
                <div style="margin-top: 10px; font-size: 13px; color: #065f46;">Booking ID: #${bookingId.slice(-6).toUpperCase()}</div>
            </div>
            
            <div style="margin-bottom: 24px;">
                <h3 style="color: #1e293b; font-size: 16px; border-bottom: 1px solid #e2e8f0; padding-bottom: 10px; margin-bottom: 15px;">Reservation Details</h3>
                <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                    <tr>
                        <td style="padding: 8px 0; color: #64748b; width: 40%;">Guest Name:</td>
                        <td style="padding: 8px 0; font-weight: 600; color: #334155;">${customerName}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 0; color: #64748b;">Hotel:</td>
                        <td style="padding: 8px 0; font-weight: 600; color: #334155;">${hotelName}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 0; color: #64748b;">Room Type:</td>
                        <td style="padding: 8px 0; font-weight: 600; color: #334155;">${roomType}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 0; color: #64748b;">Guests:</td>
                        <td style="padding: 8px 0; font-weight: 600; color: #334155;">${formatGuests(guests)}</td>
                    </tr>
                </table>
            </div>

            <div style="margin-bottom: 24px; background-color: #f8fafc; padding: 15px; border-radius: 12px;">
                <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                     <tr>
                        <td style="padding: 8px 0; color: #64748b;">Check-In:</td>
                        <td style="padding: 8px 0; font-weight: 600; color: #334155;">${formatDate(checkIn)}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 0; color: #64748b;">Check-Out:</td>
                        <td style="padding: 8px 0; font-weight: 600; color: #334155;">${formatDate(checkOut)}</td>
                    </tr>
                </table>
            </div>

            <div style="background: #f8fafc; padding: 20px; border-radius: 12px; margin-bottom: 24px;">
                <h3 style="color: #1e293b; font-size: 16px; margin: 0 0 15px 0;">Payment Summary</h3>
                <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                    <tr style="border-top: 1px solid #e2e8f0;">
                        <td style="padding: 12px 0; font-weight: 700; color: #0f172a;">Total Paid</td>
                        <td style="padding: 12px 0; font-weight: 700; color: #1E3A8A; text-align: right; font-size: 18px;">${formattedAmount}</td>
                    </tr>
                </table>
            </div>
            
             <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.NEXTAUTH_URL}/my-bookings" 
                   style="background: #1E3A8A; color: white; padding: 12px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 15px;">
                    View Booking
                </a>
            </div>

            <div style="text-align: center; color: #94a3b8; font-size: 12px; border-top: 1px solid #f1f5f9; padding-top: 24px;">
                <p style="margin: 5px 0;">Need help? Contact us at support@urbanhost.in</p>
                <p style="margin: 5px 0;">© ${new Date().getFullYear()} Urban Host. All rights reserved.</p>
            </div>
        </div>
    `;

    return transporter.sendMail({
        from: `"Urban Host" <${process.env.SMTP_USER}>`,
        to: email,
        subject: `Booking Confirmed - ${hotelName} (#${bookingId.slice(-6).toUpperCase()})`,
        html: htmlContent,
    });
};

export const sendBookingCancellation = async (
    email: string,
    customerName: string,
    bookingId: string,
    hotelName: string,
    checkIn: Date,
    checkOut: Date,
    totalAmount: number,
    roomType: string
) => {
    const formatDate = (date: Date) => {
        return new Date(date).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
        });
    };

    const formattedAmount = new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
    }).format(totalAmount);

    const htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
            <div style="text-align: center; margin-bottom: 25px; padding-bottom: 20px; border-bottom: 1px solid #f0f0f0;">
                <h1 style="color: #1E3A8A; margin: 0; font-size: 28px;">Urban Host</h1>
                <p style="color: #64748b; margin: 5px 0; font-weight: 500;">Booking Cancellation</p>
            </div>
            
            <div style="background: #fef2f2; color: #b91c1c; padding: 20px; border-radius: 12px; margin-bottom: 24px; text-align: center; border: 1px solid #fecaca;">
                <h2 style="margin: 0 0 8px 0; font-size: 20px;">Booking Cancelled</h2>
                <p style="margin: 0; font-size: 15px;">Your reservation at <strong>${hotelName}</strong> has been cancelled.</p>
                <div style="margin-top: 10px; font-size: 13px; color: #991b1b;">Booking ID: #${bookingId.slice(-6).toUpperCase()}</div>
            </div>
            
            <div style="margin-bottom: 24px;">
                <h3 style="color: #1e293b; font-size: 16px; border-bottom: 1px solid #e2e8f0; padding-bottom: 10px; margin-bottom: 15px;">Reservation Details</h3>
                <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                    <tr>
                        <td style="padding: 8px 0; color: #64748b; width: 40%;">Guest Name:</td>
                        <td style="padding: 8px 0; font-weight: 600; color: #334155;">${customerName}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 0; color: #64748b;">Hotel:</td>
                        <td style="padding: 8px 0; font-weight: 600; color: #334155;">${hotelName}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 0; color: #64748b;">Room Type:</td>
                        <td style="padding: 8px 0; font-weight: 600; color: #334155;">${roomType}</td>
                    </tr>
                </table>
            </div>

            <div style="margin-bottom: 24px; background-color: #f8fafc; padding: 15px; border-radius: 12px;">
                <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                     <tr>
                        <td style="padding: 8px 0; color: #64748b;">Check-In:</td>
                        <td style="padding: 8px 0; font-weight: 600; color: #334155;">${formatDate(checkIn)}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 0; color: #64748b;">Check-Out:</td>
                        <td style="padding: 8px 0; font-weight: 600; color: #334155;">${formatDate(checkOut)}</td>
                    </tr>
                </table>
            </div>

            <div style="background: #f8fafc; padding: 20px; border-radius: 12px; margin-bottom: 24px;">
                <h3 style="color: #1e293b; font-size: 16px; margin: 0 0 15px 0;">Refund Information</h3>
                <p style="font-size: 14px; color: #64748b; line-height: 1.5;">
                    The total amount of <strong>${formattedAmount}</strong> will be processed for refund as per the hotel's cancellation policy. It may take 5-7 business days to reflect in your original payment method.
                </p>
            </div>
            
            <div style="text-align: center; color: #94a3b8; font-size: 12px; border-top: 1px solid #f1f5f9; padding-top: 24px;">
                <p style="margin: 5px 0;">If you didn't request this cancellation, please contact us immediately.</p>
                <p style="margin: 5px 0;">Support: support@urbanhost.in</p>
                <p style="margin: 5px 0;">© ${new Date().getFullYear()} Urban Host. All rights reserved.</p>
            </div>
        </div>
    `;

    return transporter.sendMail({
        from: `"Urban Host" <${process.env.SMTP_USER}>`,
        to: email,
        subject: `Booking Cancelled - ${hotelName} (#${bookingId.slice(-6).toUpperCase()})`,
        html: htmlContent,
    });
};


export const sendPasswordResetOTP = async (email: string, otp: string) => {
    const htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #f0f0f0; border-radius: 12px;">
            <div style="text-align: center; margin-bottom: 25px;">
                <h1 style="color: #1E3A8A; margin: 0; font-size: 28px;">Urban Host</h1>
                <p style="color: #64748b; margin: 5px 0; font-weight: 500;">Password Reset Request</p>
            </div>
            
            <div style="background: #fff7ed; padding: 30px; border-radius: 16px; margin-bottom: 24px; text-align: center; border: 1px solid #ffedd5;">
                <h2 style="margin: 0 0 16px 0; color: #9a3412; font-size: 20px;">Reset Your Password</h2>
                <p style="margin: 0 0 20px 0; color: #7c2d12; font-size: 15px;">Use the following code to reset your password. This code will expire in 10 minutes.</p>
                <div style="margin: 20px 0;">
                    <span style="font-family: monospace; font-size: 32px; letter-spacing: 4px; font-weight: bold; color: #0f172a; background: white; padding: 16px 32px; border-radius: 12px; border: 2px dashed #94a3b8; display: inline-block;">
                        ${otp}
                    </span>
                </div>
            </div>
            
            <div style="text-align: center; color: #94a3b8; font-size: 12px; border-top: 1px solid #f1f5f9; padding-top: 24px;">
                <p>If you didn't request a password reset, please ignore this email or contact support if you're concerned.</p>
                <p>© ${new Date().getFullYear()} Urban Host. All rights reserved.</p>
            </div>
        </div>
    `;

    return transporter.sendMail({
        from: `"Urban Host Support" <${process.env.SMTP_USER}>`,
        to: email,
        subject: `Password Reset OTP - ${otp}`,
        html: htmlContent,
    });
};
