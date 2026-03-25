import dbConnect from './lib/mongodb';
import Hotel from './models/Hotel';

async function checkHotels() {
    await dbConnect();
    const hotels = await Hotel.find().sort({ createdAt: -1 }).limit(5);
    console.log(JSON.stringify(hotels.map(h => ({ name: h.name, images: h.images })), null, 2));
    process.exit(0);
}

checkHotels();
