import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/stayntour';

function cleanHotelTitle(name) {
    if (!name) return 'Charming Historic Inn';
    let n = name;

    // Remove file extensions like .png, .jpg, .jpeg and trailing numbers/dates
    n = n.replace(/\.(?:png|jpg|jpeg|gif|bmp|webp)[0-9a-zA-Z_]*/gi, '');
    
    // Remove "Since \d{4}" prefix
    n = n.replace(/^Since\s+\d{4}\s+/i, '');

    // Remove descriptions or taglines like "National Register of Historic...", "Celebrating 25 years..."
    n = n.replace(/^National\s+Register\s+of\s+Historic\s*(?:Places)?/i, 'Historic Register Inn');
    n = n.replace(/^Celebrating\s+\d+\s+years\s+of\s+/i, '');
    n = n.replace(/^(?:We\s+found\s+staying\s+at\s+the|You'll\s+Want\s+to\s+Stay\s+at|We\s+highly\s+recommend|WELCOME\s+to|Alaska\s+and\s+stayed\s+in\s+6\s+different\s+B\s*&\s*B|Homer,\s+we\s+will\s+again\s+stay\s+at|The\s+three\s+story|Palace\s+Pizzaria\s+in\s+Cobden,\s+the|NonameThe|Noname|Friend|Victorian\s+home,\s*)\s*/i, '');

    // Fix repeated words (e.g. "The Brandon InnBrandon Inn" -> "The Brandon Inn")
    n = n.replace(/(\b[A-Za-z\s&'-]+)(?:\1)/gi, '$1');
    n = n.replace(/InnInn/gi, 'Inn');
    n = n.replace(/CottageCottage/gi, 'Cottage');
    n = n.replace(/LodgeLodge/gi, 'Lodge');
    n = n.replace(/ManorManor/gi, 'Manor');
    n = n.replace(/HouseHouse/gi, 'House');

    // Fix glued keywords
    n = n.replace(/(?:Bed and Breakfast|B&B|B & B)(?:Cottage|Inn|Lodge|Manor|House|Resort)/gi, (match) => {
        if (/B&B/i.test(match)) return 'B&B';
        return 'Bed and Breakfast';
    });

    // Fix "Apartment A A BnB" -> "Apartment A B&B"
    n = n.replace(/Apartment A A/i, 'Apartment A');

    // Remove leading/trailing non-alphanumeric
    n = n.replace(/^[^a-zA-Z0-9]+/, '').replace(/[^a-zA-Z0-9]+$/, '');
    n = n.replace(/\s+/g, ' ').trim();

    return n || 'Charming Historic Inn';
}

async function fixAllHotelNamesInDB() {
    console.log(`🔌 Connecting to MongoDB: ${MONGODB_URI}...`);
    await mongoose.connect(MONGODB_URI);
    console.log(`🟢 Connected to MongoDB.`);

    const db = mongoose.connection.db;
    const hotelsCol = db.collection('hotels');
    const usersCol = db.collection('users');

    const hotels = await hotelsCol.find({}).toArray();
    console.log(`Found ${hotels.length} hotels in database.`);

    let updatedCount = 0;
    for (const h of hotels) {
        const cleanedName = cleanHotelTitle(h.name);
        if (cleanedName !== h.name) {
            await hotelsCol.updateOne(
                { _id: h._id },
                { $set: { name: cleanedName, updatedAt: new Date() } }
            );
            
            // Also update owner name if applicable
            if (h.owner) {
                const ownerName = `${cleanedName.split(' ')[0]} Innkeeper (${h.address?.city || 'StayNTour'} Host)`;
                await usersCol.updateOne(
                    { _id: h.owner },
                    { $set: { name: ownerName } }
                );
            }
            updatedCount++;
        }
    }

    console.log(`\n=========================================================`);
    console.log(` ✅ Cleaned & Sanitized ${updatedCount} Hotel Names in Database!`);
    console.log(`=========================================================\n`);

    await mongoose.disconnect();
}

fixAllHotelNamesInDB().catch(err => {
    console.error('Error fixing hotel names:', err);
    process.exit(1);
});
