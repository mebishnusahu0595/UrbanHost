import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IReview extends Document {
    user: mongoose.Types.ObjectId;
    hotel: mongoose.Types.ObjectId;
    rating: number;
    comment: string;
    createdAt: Date;
    updatedAt: Date;
}

const reviewSchema = new Schema<IReview>(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        hotel: {
            type: Schema.Types.ObjectId,
            ref: 'Hotel',
            required: true,
        },
        rating: {
            type: Number,
            required: true,
            min: 1,
            max: 5,
        },
        comment: {
            type: String,
            required: true,
            trim: true,
            maxLength: 1000,
        },
    },
    {
        timestamps: true,
    }
);

// Prevent multiple reviews from same user for same hotel (optional, but good practice, maybe user wants multiple stays? simpler to allow for now or just restrict?)
// For now, I'll not enforce unique index on user+hotel to allow multiple reviews for different stays if implemented later, but typically one review per user per hotel is standard 
// unless we check bookings. Let's keep it simple.

const Review: Model<IReview> = mongoose.models.Review || mongoose.model<IReview>('Review', reviewSchema);

export default Review;
