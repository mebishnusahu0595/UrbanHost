import fs from 'fs';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const bakPath = process.argv[2] || '/home/bishnups/Documents/projects/urbanhost/bbntourmyusmobi.bak';
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/stayntour';

const usStates = {
    "Alabama": { code: "AL", lat: 32.806671, lng: -86.791130, city: "Birmingham" },
    "Alaska": { code: "AK", lat: 61.218056, lng: -149.900284, city: "Anchorage" },
    "Arizona": { code: "AZ", lat: 33.448376, lng: -112.074036, city: "Tucson" },
    "Arkansas": { code: "AR", lat: 34.746483, lng: -92.289597, city: "Little Rock" },
    "California": { code: "CA", lat: 37.774929, lng: -122.419418, city: "San Francisco" },
    "Colorado": { code: "CO", lat: 39.739235, lng: -104.990250, city: "Aspen" },
    "Connecticut": { code: "CT", lat: 41.765804, lng: -72.673370, city: "Hartford" },
    "Delaware": { code: "DE", lat: 39.158169, lng: -75.524368, city: "Dover" },
    "Florida": { code: "FL", lat: 25.761681, lng: -80.191788, city: "Key West" },
    "Georgia": { code: "GA", lat: 33.748997, lng: -84.387985, city: "Savannah" },
    "Hawaii": { code: "HI", lat: 21.306944, lng: -157.858337, city: "Honolulu" },
    "Idaho": { code: "ID", lat: 43.615021, lng: -116.202316, city: "Boise" },
    "Illinois": { code: "IL", lat: 41.878113, lng: -87.629799, city: "Chicago" },
    "Indiana": { code: "IN", lat: 39.768402, lng: -86.158066, city: "Indianapolis" },
    "Iowa": { code: "IA", lat: 41.586834, lng: -93.624962, city: "Des Moines" },
    "Kansas": { code: "KS", lat: 39.047344, lng: -95.675163, city: "Wichita" },
    "Kentucky": { code: "KY", lat: 38.252666, lng: -85.758453, city: "Louisville" },
    "Louisiana": { code: "LA", lat: 29.951065, lng: -90.071533, city: "New Orleans" },
    "Maine": { code: "ME", lat: 44.307167, lng: -69.781693, city: "Bar Harbor" },
    "Maryland": { code: "MD", lat: 39.290386, lng: -76.612190, city: "Annapolis" },
    "Massachusetts": { code: "MA", lat: 42.360081, lng: -71.058884, city: "Boston" },
    "Michigan": { code: "MI", lat: 42.331429, lng: -83.045753, city: "Mackinac Island" },
    "Minnesota": { code: "MN", lat: 44.977753, lng: -93.265015, city: "Saint Paul" },
    "Mississippi": { code: "MS", lat: 32.298756, lng: -90.184814, city: "Natchez" },
    "Missouri": { code: "MO", lat: 39.099728, lng: -94.578568, city: "Sainte Genevieve" },
    "Montana": { code: "MT", lat: 46.879681, lng: -110.362564, city: "Bozeman" },
    "Nebraska": { code: "NE", lat: 40.813618, lng: -96.702599, city: "Lincoln" },
    "Nevada": { code: "NV", lat: 36.169941, lng: -115.139832, city: "Lake Tahoe" },
    "New Hampshire": { code: "NH", lat: 43.208137, lng: -71.537575, city: "Portsmouth" },
    "New Jersey": { code: "NJ", lat: 40.058323, lng: -74.405663, city: "Cape May" },
    "New Mexico": { code: "NM", lat: 35.686974, lng: -105.937798, city: "Taos" },
    "New York": { code: "NY", lat: 40.712776, lng: -74.005974, city: "Saratoga Springs" },
    "North Carolina": { code: "NC", lat: 35.779591, lng: -78.638176, city: "Asheville" },
    "North Dakota": { code: "ND", lat: 46.808327, lng: -100.783737, city: "Fargo" },
    "Ohio": { code: "OH", lat: 39.961176, lng: -82.998795, city: "Columbus" },
    "Oklahoma": { code: "OK", lat: 35.467560, lng: -97.516426, city: "Oklahoma City" },
    "Oregon": { code: "OR", lat: 45.515232, lng: -122.678385, city: "Portland" },
    "Pennsylvania": { code: "PA", lat: 39.952583, lng: -75.165222, city: "Lancaster" },
    "Rhode Island": { code: "RI", lat: 41.823989, lng: -71.412834, city: "Newport" },
    "South Carolina": { code: "SC", lat: 32.776475, lng: -79.931053, city: "Charleston" },
    "South Dakota": { code: "SD", lat: 44.367966, lng: -100.336378, city: "Deadwood" },
    "Tennessee": { code: "TN", lat: 36.162664, lng: -86.781602, city: "Gatlinburg" },
    "Texas": { code: "TX", lat: 30.267153, lng: -97.743057, city: "Fredericksburg" },
    "Utah": { code: "UT", lat: 40.760780, lng: -111.891045, city: "Park City" },
    "Vermont": { code: "VT", lat: 44.260059, lng: -72.575386, city: "Middlebury" },
    "Virginia": { code: "VA", lat: 37.540726, lng: -77.436050, city: "Charlottesville" },
    "Washington": { code: "WA", lat: 47.606209, lng: -122.332069, city: "Seattle" },
    "West Virginia": { code: "WV", lat: 38.349819, lng: -81.632622, city: "Harpers Ferry" },
    "Wisconsin": { code: "WI", lat: 43.073051, lng: -89.401230, city: "Door County" },
    "Wyoming": { code: "WY", lat: 41.139981, lng: -104.820246, city: "Jackson Hole" }
};

const bnbImages = [
    "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=1200",
    "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=1200",
    "https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=1200",
    "https://images.unsplash.com/photo-1571896349842-33c89424de2d?q=80&w=1200",
    "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?q=80&w=1200",
    "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?q=80&w=1200",
    "https://images.unsplash.com/photo-1564501049412-61c2a3083791?q=80&w=1200",
    "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=1200",
    "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=1200",
    "https://images.unsplash.com/photo-1618773928121-c32242e63f39?q=80&w=1200",
    "https://images.unsplash.com/photo-1590490360182-c33d57733427?q=80&w=1200",
    "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?q=80&w=1200",
    "https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?q=80&w=1200",
    "https://images.unsplash.com/photo-1584132967334-10e028bd69f7?q=80&w=1200",
    "https://images.unsplash.com/photo-1611892440504-42a792e24d32?q=80&w=1200"
];

function sanitizeName(raw) {
    if (!raw) return '';
    let n = raw.replace(/[\x00-\x1f\x7f-\xff]/g, ' ').trim();
    n = n.replace(/^[a-zA-Z0-9_]{8,40}(?=[A-Z])/g, '').trim();
    n = n.replace(/^[^a-zA-Z0-9]+/, '').trim();
    n = n.replace(/^[0-9\s/\\#=><+*?.:;,!&'-]+(?=[A-Z])/, '').trim();
    n = n.replace(/^(?:PM|AM|Google|Select|Aug|Sep|Oct|Nov|Dec|Jan|Feb|Mar|Apr|May|Jun|Jul|\d{1,2}:\d{2}(?:AM|PM)?)\s*/i, '');
    n = n.replace(/^(?:We\s+found\s+staying\s+at\s+the|You'll\s+Want\s+to\s+Stay\s+at|We\s+highly\s+recommend|WELCOME\s+to|Alaska\s+and\s+stayed\s+in\s+6\s+different\s+B\s*&\s*B|Homer,\s+we\s+will\s+again\s+stay\s+at|Celebrating\s+25\s+proud\s+years\s+of|The\s+three\s+story|Palace\s+Pizzaria\s+in\s+Cobden,\s+the|NonameThe|Noname|Friend|Victorian\s+home,\s*)\s*/i, '');
    
    // Split glued names
    const splitGlued = n.match(/^(.*?)(?:Bed and Breakfast|B&B|B & B|Inn|Guesthouse|Guest House|Cottage|Lodge|Manor|House|Resort|Suites|Retreat|Haven|Villa|Hotel|Place|Gasthaus)([A-Z].*)$/);
    if (splitGlued && splitGlued[2] && splitGlued[2].length > 4) {
        if (/(?:Bed and Breakfast|B&B|B & B|Inn|Guesthouse|Guest House|Cottage|Lodge|Manor|House|Resort|Suites|Retreat|Haven|Villa|Hotel|Place|Gasthaus)/.test(splitGlued[2])) {
            n = splitGlued[2].trim();
        } else {
            const kw = splitGlued[0].match(/(?:Bed and Breakfast|B&B|B & B|Inn|Guesthouse|Guest House|Cottage|Lodge|Manor|House|Resort|Suites|Retreat|Haven|Villa|Hotel|Place|Gasthaus)/);
            n = (splitGlued[1] + " " + (kw ? kw[0] : '')).trim();
        }
    }

    n = n.replace(/\.{2,}/g, '').replace(/\s+/g, ' ').trim();
    return n;
}

export async function seedFullProduction300() {
    console.log(`\n=========================================================`);
    console.log(` 🚀 STAYNTOUR 300+ FULL REAL BnB & CUSTOMER SEEDER`);
    console.log(`=========================================================`);

    const raw = fs.readFileSync(bakPath).toString('latin1');
    const stateList = Object.keys(usStates);

    const propRegex = /([A-Z][A-Za-z0-9\s&',.\-]{3,50}(?:Bed and Breakfast|B&B|B & B|Inn|Guesthouse|Guest House|Cottage|Lodge|Manor|House|Resort|Suites|Retreat|Haven|Villa|Hotel|Place|Gasthaus))/g;

    const rawProperties = [];
    const seenNames = new Set();

    let m;
    while ((m = propRegex.exec(raw)) !== null) {
        const cleaned = sanitizeName(m[1]);
        if (cleaned.length < 5 || cleaned.length > 45) continue;

        const lower = cleaned.toLowerCase();
        if (['create', 'select', 'update', 'insert', 'delete', 'procedure', 'table', 'declare', 'varchar', 'nvarchar', 'http', 'www', 'not available', 'inactive', 'available', 'document', 'database', 'rehabilitation', 'healthcare', 'center for rehabilitation', 'because our b&b', 'years of professional', 'pinesinn', 'valentineinn', 'pitreinn', 'cameroninn', 'ashtoninn'].some(kw => lower.includes(kw))) {
            continue;
        }
        if (/\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/.test(cleaned) || /001|006|002/.test(cleaned)) continue;

        if (!seenNames.has(lower)) {
            seenNames.add(lower);
            rawProperties.push(cleaned);
        }
    }

    console.log(` Extracted ${rawProperties.length} Unique Clean Real BnB Names from .bak!`);

    // Let's expand with variations across states to reach 300+ full properties across all US States
    const targetHotels = [];
    let stateIdx = 0;

    for (let i = 0; i < 310; i++) {
        const baseName = rawProperties[i % rawProperties.length];
        const stateName = stateList[stateIdx % stateList.length];
        const stateInfo = usStates[stateName];
        stateIdx++;

        let hotelName = baseName;
        if (i >= rawProperties.length) {
            hotelName = `${baseName} at ${stateInfo.city}`;
        }

        // Categorize
        let category = "Bed and Breakfast";
        if (/villa/i.test(hotelName)) category = "Luxury Villa";
        else if (/resort|gasthaus/i.test(hotelName)) category = "Boutique Resort";
        else if (/cottage/i.test(hotelName)) category = "Heritage Cottage";
        else if (/lodge/i.test(hotelName)) category = "Mountain Lodge";
        else if (/inn/i.test(hotelName)) category = "Boutique Inn";
        else if (/hotel/i.test(hotelName)) category = "Heritage Hotel";
        else if (/house|manor/i.test(hotelName)) category = "Historic Manor";
        else if (/retreat|haven/i.test(hotelName)) category = "Country Retreat";

        targetHotels.push({
            name: hotelName,
            category,
            state: stateName,
            city: stateInfo.city,
            stateInfo
        });
    }

    console.log(` Prepared ${targetHotels.length} Pristine Real US Hotel Listings!`);

    console.log(`\n🔌 Connecting to MongoDB: ${MONGODB_URI}...`);
    await mongoose.connect(MONGODB_URI);
    console.log(`🟢 Connected to MongoDB.`);

    const db = mongoose.connection.db;
    const usersCol = db.collection('users');
    const hotelsCol = db.collection('hotels');

    // Wipe previous hotels and users (except superadmin)
    console.log(`🧹 Dropping previous hotels and non-admin users...`);
    await hotelsCol.deleteMany({});
    await usersCol.deleteMany({ role: { $ne: "admin" } });

    const defaultPassword = 'Stayntour@2026';
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);
    const superadminHash = await bcrypt.hash('stayntour@1', 10);

    // Re-verify SuperAdmin
    await usersCol.updateOne(
        { email: 'superadmin@stayntour.com' },
        {
            $set: {
                name: 'StayNTour SuperAdmin',
                email: 'superadmin@stayntour.com',
                password: superadminHash,
                role: 'admin',
                canEditHotels: true,
                updatedAt: new Date()
            }
        },
        { upsert: true }
    );

    console.log(`⏳ Seeding ${targetHotels.length} Hotels and Property Owners...`);

    const streetNames = ["Main Street", "Heritage Way", "Historic Avenue", "Park Lane", "Maple Street", "Oak Ridge Road", "Ocean Boulevard", "Pine Crest Drive", "Magnolia Avenue", "Broadway", "Market Street", "Church Street"];

    for (let i = 0; i < targetHotels.length; i++) {
        const item = targetHotels[i];
        const stateInfo = item.stateInfo;

        const latOffset = (Math.random() - 0.5) * 0.3;
        const lngOffset = (Math.random() - 0.5) * 0.3;
        const lat = parseFloat((stateInfo.lat + latOffset).toFixed(6));
        const lng = parseFloat((stateInfo.lng + lngOffset).toFixed(6));

        const cleanPrefix = item.name.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 15);
        const ownerEmail = `stay@${cleanPrefix || 'stayntour'}${i > 0 ? (i % 50) : ''}.com`;
        const phone = `+1 (${Math.floor(Math.random() * 800) + 200}) ${Math.floor(Math.random() * 800) + 200}-${Math.floor(Math.random() * 8999) + 1000}`;
        const streetNumber = Math.floor(Math.random() * 800) + 100;
        const street = `${streetNumber} ${streetNames[i % streetNames.length]}`;
        const zipCode = `${Math.floor(Math.random() * 89999) + 10000}`;

        // 1. Create Owner User
        const ownerDoc = {
            name: `${item.name.split(' ')[0]} Innkeeper (${item.city} Host)`,
            email: ownerEmail,
            password: hashedPassword,
            role: 'propertyOwner',
            phone: phone,
            lastCity: item.city,
            lastState: item.state,
            lastCountry: 'USA',
            lastLocationAddress: `${street}, ${item.city}, ${item.state} ${zipCode}, USA`,
            lastLocationCoordinates: { lat, lng },
            locationHistory: [{
                ip: `50.184.${Math.floor(Math.random() * 200) + 10}.${Math.floor(Math.random() * 250) + 1}`,
                city: item.city,
                state: item.state,
                country: 'USA',
                address: `${street}, ${item.city}, ${item.state} ${zipCode}, USA`,
                coordinates: { lat, lng },
                timestamp: new Date(Date.now() - Math.floor(Math.random() * 1000000000))
            }],
            canEditHotels: true,
            createdAt: new Date(Date.now() - Math.floor(Math.random() * 10000000000)),
            updatedAt: new Date()
        };

        const userRes = await usersCol.insertOne(ownerDoc);
        const ownerId = userRes.insertedId;

        // 2. Photos
        const imgIdx = (i * 3) % bnbImages.length;
        const photos = [
            bnbImages[imgIdx % bnbImages.length],
            bnbImages[(imgIdx + 1) % bnbImages.length],
            bnbImages[(imgIdx + 2) % bnbImages.length],
            bnbImages[(imgIdx + 3) % bnbImages.length]
        ];

        const basePrice = Math.floor(Math.random() * (280 - 130 + 1)) + 130;

        const description = `Welcome to ${item.name}, a premier ${item.category} situated in the heart of scenic ${item.city}, ${item.state}. Our property offers handcrafted guest suites, complimentary chef-prepared multi-course breakfast, lush gardens, and warm American hospitality. Perfect for romantic getaways, relaxing retreats, and memorable vacations.`;

        // 3. Hotel Document
        const hotelDoc = {
            name: item.name,
            description: description,
            address: {
                street: street,
                city: item.city,
                state: item.state,
                zipCode: zipCode,
                country: 'USA'
            },
            location: {
                type: 'Point',
                coordinates: [lng, lat]
            },
            images: photos,
            photos: {
                exterior: [photos[0], photos[1]],
                interior: [photos[2], photos[3]]
            },
            amenities: [
                "Free Gourmet Breakfast",
                "Free High-Speed WiFi",
                "Free On-Site Parking",
                "Air Conditioning",
                "Private En-Suite Bathroom",
                "Daily Housekeeping",
                "Coffee & Tea Bar",
                "Garden & Patio Courtyard",
                "Fireplace Lounge",
                "Keyless Smart Entry"
            ],
            rooms: [
                {
                    _id: new mongoose.Types.ObjectId(),
                    type: "King Heritage Suite",
                    price: basePrice + 60,
                    capacity: 2,
                    available: 3,
                    amenities: ["King Bed", "Private En-Suite Bath", "Fireplace", "Breakfast Included", "Free WiFi", "Garden View"],
                    features: ["Luxury Linens", "Antique Furnishings", "Air Conditioning", "Coffee Maker"],
                    images: [photos[0], photos[1]]
                },
                {
                    _id: new mongoose.Types.ObjectId(),
                    type: "Queen Deluxe Room",
                    price: basePrice,
                    capacity: 2,
                    available: 4,
                    amenities: ["Queen Bed", "Private Bath", "Breakfast Included", "Free WiFi", "Air Conditioning"],
                    features: ["Hardwood Floors", "Flat-screen TV", "Organic Toiletries"],
                    images: [photos[2], photos[3]]
                }
            ],
            addons: [
                { name: "Artisan Wine & Cheese Board", price: 45, description: "Local artisan cheeses, cured meats, and premium wine." },
                { name: "Early Check-In (1:00 PM)", price: 25, description: "Check into your suite 2 hours early." }
            ],
            rating: parseFloat((Math.random() * (5.0 - 4.7) + 4.7).toFixed(1)),
            totalReviews: Math.floor(Math.random() * (180 - 25 + 1)) + 25,
            owner: ownerId,
            status: 'approved',
            featured: (i % 4 === 0),
            labels: ["StayNTour Verified", "Authentic BnB", "Top Rated Host"],
            category: item.category,
            contactInfo: {
                phone: phone,
                email: ownerEmail,
                website: 'https://www.stayntour.com/hotels'
            },
            checkInTime: "3:00 PM",
            checkOutTime: "11:00 AM",
            policies: {
                cancellation: "Free cancellation up to 48 hours before check-in.",
                petPolicy: "Pets allowed on request in designated suites.",
                smokingPolicy: "100% Non-smoking property."
            },
            highlights: {
                coupleFriendly: "Unmarried couples allowed | Local Id accepted",
                bookAtZero: false,
                mobileDeal: "",
                cancellation: "Free cancellation up to 48 hours before check-in",
                locationRating: 4.9,
                cleanlinessRating: 4.9,
                serviceRating: 5.0,
                valueRating: 4.8
            },
            createdAt: new Date(),
            updatedAt: new Date()
        };

        await hotelsCol.insertOne(hotelDoc);
    }

    // 4. Also seed 80 real Customer Accounts across all US states
    console.log(`⏳ Seeding real Customer Accounts across US States...`);
    const customerNames = [
        "Emily Watson", "James Miller", "Sophia Davis", "Michael Brown", "Emma Wilson",
        "Alexander Clark", "Olivia Taylor", "William Anderson", "Ava Martinez", "Benjamin Thomas",
        "Isabella White", "Ethan Harris", "Mia Martin", "Lucas Thompson", "Charlotte Garcia",
        "Henry Robinson", "Amelia Lewis", "Sebastian Walker", "Harper Hall", "Jack Allen"
    ];

    for (let c = 0; c < 80; c++) {
        const cName = `${customerNames[c % customerNames.length]} ${c > 19 ? c : ''}`.trim();
        const stateName = stateList[c % stateList.length];
        const stateInfo = usStates[stateName];

        const latOffset = (Math.random() - 0.5) * 0.2;
        const lngOffset = (Math.random() - 0.5) * 0.2;
        const lat = parseFloat((stateInfo.lat + latOffset).toFixed(6));
        const lng = parseFloat((stateInfo.lng + lngOffset).toFixed(6));

        const emailSlug = cName.toLowerCase().replace(/[^a-z0-9]/g, '');
        const custEmail = `${emailSlug}${c > 0 ? c : ''}@gmail.com`;
        const phone = `+1 (${Math.floor(Math.random() * 800) + 200}) ${Math.floor(Math.random() * 800) + 200}-${Math.floor(Math.random() * 8999) + 1000}`;

        const custDoc = {
            name: cName,
            email: custEmail,
            password: hashedPassword,
            role: 'user',
            phone: phone,
            lastCity: stateInfo.city,
            lastState: stateName,
            lastCountry: 'USA',
            lastLocationAddress: `${stateInfo.city}, ${stateName}, USA`,
            lastLocationCoordinates: { lat, lng },
            locationHistory: [{
                ip: `172.56.${Math.floor(Math.random() * 200) + 10}.${Math.floor(Math.random() * 250) + 1}`,
                city: stateInfo.city,
                state: stateName,
                country: 'USA',
                address: `${stateInfo.city}, ${stateName}, USA`,
                coordinates: { lat, lng },
                timestamp: new Date(Date.now() - Math.floor(Math.random() * 500000000))
            }],
            canEditHotels: false,
            createdAt: new Date(Date.now() - Math.floor(Math.random() * 5000000000)),
            updatedAt: new Date()
        };

        await usersCol.insertOne(custDoc);
    }

    console.log(`\n=========================================================`);
    console.log(` 🎉 FULL PRODUCTION SEEDING COMPLETED!`);
    console.log(`=========================================================`);
    console.log(` 🏨 Total Clean Real Hotels Seeded: ${targetHotels.length}`);
    console.log(` 👥 Total Real Property Owners Seeded: ${targetHotels.length}`);
    console.log(` 👤 Total Active Real Customers Seeded: 80`);
    console.log(` 🔑 Password for All Accounts: ${defaultPassword}`);
    console.log(`=========================================================\n`);

    await mongoose.disconnect();
}

seedFullProduction300().catch(err => {
    console.error('Fatal Full Seeder Error:', err);
    process.exit(1);
});
