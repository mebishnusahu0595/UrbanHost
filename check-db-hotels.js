const mongoose = require('mongoose');

const MONGODB_URI = 'mongodb://localhost:27017/urbanhost';

async function checkHotels() {
    await mongoose.connect(MONGODB_URI);
    const Hotel = mongoose.model('Hotel', new mongoose.Schema({}, { strict: false }), 'hotels');
    const hotels = await Hotel.find().sort({ createdAt: -1 }).limit(5);
    console.log(JSON.stringify(hotels.map(h => ({ name: h.name, images: h.images, status: h.status })), null, 2));
    process.exit(0);
}

checkHotels().catch(err => {
    console.error(err);
    process.exit(1);
});
