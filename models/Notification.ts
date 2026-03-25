import mongoose, { Schema, Document } from 'mongoose';

export interface INotification extends Document {
    type: 'PROFILE_UPDATE' | 'PASSWORD_CHANGE' | 'HOTEL_UPDATE' | 'NEW_BOOKING' | 'SYSTEM';
    title: string;
    message: string;
    userId: mongoose.Types.ObjectId;
    userName: string;
    userRole: string;
    hotelId?: mongoose.Types.ObjectId;
    hotelName?: string;
    changeDetails?: {
        field: string;
        oldValue: any;
        newValue: any;
    }[];
    details?: any;
    isRead: boolean;
    createdAt: Date;
}

const NotificationSchema: Schema = new Schema({
    type: {
        type: String,
        required: true,
        enum: ['PROFILE_UPDATE', 'PASSWORD_CHANGE', 'HOTEL_UPDATE', 'NEW_BOOKING', 'SYSTEM']
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    userName: { type: String, required: true },
    userRole: { type: String, required: true },
    hotelId: { type: Schema.Types.ObjectId, ref: 'Hotel' },
    hotelName: { type: String },
    changeDetails: [{
        field: String,
        oldValue: Schema.Types.Mixed,
        newValue: Schema.Types.Mixed
    }],
    details: { type: Schema.Types.Mixed },
    isRead: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Notification || mongoose.model<INotification>('Notification', NotificationSchema);
