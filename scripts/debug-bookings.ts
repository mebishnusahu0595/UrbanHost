
import mongoose from 'mongoose';
import Booking from '../models/Booking';
import dbConnect from '../lib/mongodb';

// We need to import Hotel and User models to ensure they are registered
import Hotel from '../models/Hotel';
import User from '../models/User';

async function run() {
    try {
        await dbConnect();

        const bookings = await Booking.find({})
            .sort({ createdAt: -1 })
            .limit(10)
            .lean();

        console.log(`Found ${bookings.length} bookings.`);

        if (bookings.length > 0) {
            console.log("First booking raw data:", JSON.stringify(bookings[0], null, 2));
        }

        bookings.forEach(b => {
            console.log(`ID: ${b._id}`);
            // @ts-ignore
            console.log(`  checkInDate: ${b.checkInDate} (type: ${typeof b.checkInDate})`);
            // @ts-ignore
            console.log(`  checkOutDate: ${b.checkOutDate} (type: ${typeof b.checkOutDate})`);
            // @ts-ignore
            console.log(`  createdAt: ${b.createdAt}`);
            console.log('---');
        });

    } catch (e) {
        console.error(e);
    } finally {
        await mongoose.disconnect();
    }
}

run();
