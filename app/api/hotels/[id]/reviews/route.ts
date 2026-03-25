import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import Review from '@/models/Review';
import Hotel from '@/models/Hotel';

// GET: Fetch reviews for a specific hotel
export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> } // Correctly typing params as a Promise for Next.js 15+ if needed, or standard object
) {
    try {
        await dbConnect();
        const { id } = await params; // Await params just in case (Next.js 15 change, harmless in 14)

        const { searchParams } = new URL(req.url);
        const limit = parseInt(searchParams.get('limit') || '20');
        const skip = parseInt(searchParams.get('skip') || '0');

        // Fetch reviews with user details
        const reviews = await Review.find({ hotel: id })
            .populate('user', 'name image') // Start with name and image
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Review.countDocuments({ hotel: id });

        // Calculate rating distribution (5 star, 4 star, etc.)
        // We can do this with aggregation for efficiency
        const distribution = await Review.aggregate([
            { $match: { hotel: new mongoose.Types.ObjectId(id) } },
            {
                $group: {
                    _id: '$rating',
                    count: { $sum: 1 },
                },
            },
        ]);

        // Format distribution into a 1-5 object
        const ratingCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        distribution.forEach((d) => {
            if (d._id >= 1 && d._id <= 5) {
                ratingCounts[d._id as 1 | 2 | 3 | 4 | 5] = d.count;
            }
        });

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

import mongoose from 'mongoose';

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

        // Create review
        const newReview = await Review.create({
            user: (session.user as any).id,
            hotel: id,
            rating,
            comment,
        });

        // Update Hotel stats
        // We can use aggregation to get precise new stats
        const stats = await Review.aggregate([
            { $match: { hotel: new mongoose.Types.ObjectId(id) } },
            {
                $group: {
                    _id: null,
                    avgRating: { $avg: '$rating' },
                    totalReviews: { $sum: 1 },
                },
            },
        ]);

        if (stats.length > 0) {
            await Hotel.findByIdAndUpdate(id, {
                rating: Math.round(stats[0].avgRating * 10) / 10, // Round to 1 decimal place
                totalReviews: stats[0].totalReviews,
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
