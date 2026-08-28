import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IReview extends Document {
    user: mongoose.Types.ObjectId;
    hotel: mongoose.Types.ObjectId;
    rating: number;
    title?: string;
    comment: string;
    verifiedStay?: boolean;
    stayDate?: string;
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
        title: {
            type: String,
            trim: true,
            maxLength: 200,
        },
        comment: {
            type: String,
            required: true,
            trim: true,
            maxLength: 2000,
        },
        verifiedStay: {
            type: Boolean,
            default: true,
        },
        stayDate: {
            type: String,
        },
    },
    {
        timestamps: true,
    }
);

// Indexes
reviewSchema.index({ hotel: 1, createdAt: -1 });
reviewSchema.index({ user: 1, hotel: 1 });

const Review: Model<IReview> =
    mongoose.models.Review || mongoose.model<IReview>('Review', reviewSchema);

export default Review;
