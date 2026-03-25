import dbConnect from './lib/mongodb';
import Hotel from './models/Hotel';

async function checkHotels() {
    await dbConnect();
    const hotels = await Hotel.find({});
    console.log(`Total hotels: ${hotels.length}`);
    hotels.forEach(h => {
        console.log(`- Name: ${h.name}, City: ${h.address?.city}, Status: ${h.status}`);
    });
    process.exit(0);
}

checkHotels();
