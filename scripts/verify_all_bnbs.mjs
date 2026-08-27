import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/stayntour';

async function verifyAll310Bnbs() {
    console.log(`🔌 Connecting to MongoDB: ${MONGODB_URI}...`);
    await mongoose.connect(MONGODB_URI);
    console.log(`🟢 Connected to MongoDB.`);

    const db = mongoose.connection.db;
    const hotelsCol = db.collection('hotels');
    const usersCol = db.collection('users');

    const totalHotels = await hotelsCol.countDocuments({});
    const totalOwners = await usersCol.countDocuments({ role: { $in: ['propertyOwner', 'hotelOwner'] } });
    const totalCustomers = await usersCol.countDocuments({ role: 'user' });

    console.log(`\n================ DATABASE TOTALS ================`);
    console.log(`🏨 Total Hotels/BnBs in Database: ${totalHotels}`);
    console.log(`👤 Total Property Owners: ${totalOwners}`);
    console.log(`👥 Total Customer Users: ${totalCustomers}`);

    const sampleHotels = await hotelsCol.find({}).limit(10).toArray();

    console.log(`\n================ 10 SAMPLE PROPERTIES VERIFICATION ================`);
    for (let i = 0; i < sampleHotels.length; i++) {
        const h = sampleHotels[i];
        console.log(`\n#${i + 1}. [${h.name}]`);
        console.log(`   📍 Location: ${h.address?.street}, ${h.address?.city}, ${h.address?.state} ${h.address?.zipCode}, USA`);
        console.log(`   🗺️ Coords: [${h.location?.coordinates?.join(', ')}] (Lat: ${h.latitude}, Lng: ${h.longitude})`);
        console.log(`   🏷️ Category / Labels: ${h.labels?.join(', ') || 'N/A'}`);
        console.log(`   💰 Base Room Price: $${h.rooms?.[0]?.price || 0}/night`);
        console.log(`   🖼️ Hotel Photos (${h.images?.length}): ${h.images?.slice(0, 3)?.join(', ')}`);
        console.log(`   🛏️ Rooms (${h.rooms?.length}): ${h.rooms?.map(r => `${r.name} ($${r.price})`).join(' | ')}`);
        console.log(`   📝 Description Length: ${h.description?.length} chars`);
    }

    // Check for any missing fields across ALL 310
    const missingPhotos = await hotelsCol.countDocuments({ $or: [{ images: { $size: 0 } }, { images: { $exists: false } }] });
    const missingRooms = await hotelsCol.countDocuments({ $or: [{ rooms: { $size: 0 } }, { rooms: { $exists: false } }] });
    const missingCity = await hotelsCol.countDocuments({ $or: [{ "address.city": "" }, { "address.city": { $exists: false } }] });
    const missingCoords = await hotelsCol.countDocuments({ $or: [{ latitude: { $exists: false } }, { longitude: { $exists: false } }] });

    console.log(`\n================ DATA INTEGRITY AUDIT ================`);
    console.log(`Missing Photos: ${missingPhotos} / ${totalHotels}`);
    console.log(`Missing Rooms: ${missingRooms} / ${totalHotels}`);
    console.log(`Missing City/Address: ${missingCity} / ${totalHotels}`);
    console.log(`Missing Coordinates: ${missingCoords} / ${totalHotels}`);
    console.log(`======================================================\n`);

    await mongoose.disconnect();
}

verifyAll310Bnbs().catch(console.error);
