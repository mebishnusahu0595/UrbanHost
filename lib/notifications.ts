import Notification from '@/models/Notification';
import dbConnect from './mongodb';

export async function createNotification({
    type,
    title,
    message,
    userId,
    userName,
    userRole,
    hotelId,
    hotelName,
    changeDetails,
    details = {}
}: {
    type: 'PROFILE_UPDATE' | 'PASSWORD_CHANGE' | 'HOTEL_UPDATE' | 'NEW_BOOKING' | 'SYSTEM';
    title: string;
    message: string;
    userId: any;
    userName: string;
    userRole: string;
    hotelId?: any;
    hotelName?: string;
    changeDetails?: { field: string; oldValue: any; newValue: any }[];
    details?: any;
}) {
    try {
        await dbConnect();
        const notification = await Notification.create({
            type,
            title,
            message,
            userId,
            userName,
            userRole,
            hotelId,
            hotelName,
            changeDetails,
            details,
            isRead: false
        });
        return notification;
    } catch (error) {
        console.error('Error creating notification:', error);
        return null;
    }
}
