import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import Review from '@/models/Review';
import Hotel from '@/models/Hotel';

// GET: Fetch reviews for a specific hotel
export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await dbConnect();
        const { id } = await params;

        const { searchParams } = new URL(req.url);
        const limit = parseInt(searchParams.get('limit') || '20');
        const skip = parseInt(searchParams.get('skip') || '0');

        let hotelObjectId: mongoose.Types.ObjectId;
        try {
            hotelObjectId = new mongoose.Types.ObjectId(id);
        } catch {
            return NextResponse.json({ error: 'Invalid Hotel ID' }, { status: 400 });
        }

        // Fetch reviews with user details
        const reviews = await Review.find({ hotel: hotelObjectId })
            .populate('user', 'name image')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Review.countDocuments({ hotel: hotelObjectId });

        // Calculate rating distribution (5 star, 4 star, etc.)
        const distribution = await Review.aggregate([
            { $match: { hotel: hotelObjectId } },
            {
                $group: {
                    _id: '$rating',
                    count: { $sum: 1 },
                },
            },
        ]);

        // Format distribution into a 1-5 object
        const ratingCounts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        distribution.forEach((d) => {
            if (d._id >= 1 && d._id <= 5) {
                ratingCounts[d._id] = d.count;
            }
        });

        // Fallback to hotel metadata if no written reviews yet
        if (total === 0) {
            const hotel: any = await Hotel.findById(hotelObjectId).select('rating totalReviews reviewCount');
            if (hotel && (hotel.totalReviews > 0 || hotel.reviewCount > 0)) {
                const count = hotel.totalReviews || hotel.reviewCount || 60;
                const star5 = Math.round(count * 0.88);
                const star4 = count - star5;
                return NextResponse.json({
                    reviews: [],
                    total: count,
                    averageRating: (hotel.rating || 4.9).toFixed(1),
                    distribution: { 1: 0, 2: 0, 3: 0, 4: star4, 5: star5 },
                });
            }
        }

        return NextResponse.json({
            reviews,
            total,
            distribution: ratingCounts,
        });
    } catch (error: any) {
        console.error('Error fetching reviews:', error);
        return NextResponse.json(
            { error: 'Failed to fetch reviews' },
            { status: 500 }
        );
    }
}

// POST: Add a new review
export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();
        const { id } = await params;
        const { rating, comment } = await req.json();

        if (!rating || !comment) {
            return NextResponse.json(
                { error: 'Rating and comment are required' },
                { status: 400 }
            );
        }

        const hotelObjectId = new mongoose.Types.ObjectId(id);

        // Create review
        const newReview = await Review.create({
            user: (session.user as any).id,
            hotel: hotelObjectId,
            rating,
            comment,
            verifiedStay: true
        });

        // Update Hotel stats
        const stats = await Review.aggregate([
            { $match: { hotel: hotelObjectId } },
            {
                $group: {
                    _id: null,
                    avgRating: { $avg: '$rating' },
                    totalReviews: { $sum: 1 },
                },
            },
        ]);

        if (stats.length > 0) {
            await Hotel.findByIdAndUpdate(hotelObjectId, {
                rating: Math.round(stats[0].avgRating * 10) / 10,
                totalReviews: stats[0].totalReviews,
                reviewCount: stats[0].totalReviews,
            });
        }

        return NextResponse.json(newReview, { status: 201 });
    } catch (error: any) {
        console.error('Error creating review:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to create review' },
            { status: 500 }
        );
    }
}
