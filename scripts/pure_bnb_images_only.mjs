import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/stayntour';
const imagesDir = path.resolve('BnBimages');

// Filter out system files or non-image assets
const allFiles = fs.readdirSync(imagesDir).filter(f => {
    return !['Thumbs.db', 'Master Password.bmp', 'check_image.png', 'home.bmp', 'home.png', 'home_1.png', 'home_2.png', 'home_3.png', 'home_4.png', 'home_img.png', 'home_right.png', 'logo copy.png', 'logo.png', 'logo1.PNG', 'logo_mobie1.png', 'sample.JPG', 'sample1.JPG'].includes(f);
});

console.log(`Total valid BnB property & room images in collection: ${allFiles.length}`);

// Curated specific mappings for known named BnBs
const specificBnBMappings = [
    {
        keywords: ['camai'],
        images: ['camai bnb.JPG', 'camai gallery 1.JPG', 'camai gallery 2.JPG', 'camainb logo.JPG'],
        rooms: ['rich bedroom.bmp', 'green room.PNG']
    },
    {
        keywords: ['cozy cove'],
        images: ['cozy cove inn.jpg', 'cozy cove inn gallery 1.JPG', 'cozy cove inn logo.JPG'],
        rooms: ['parish bedroom.JPG', 'The bear paw.jpg']
    },
    {
        keywords: ['bougainvillea'],
        images: ['bougainvillea house.JPG', '1822-bougainvillea-house.jpg'],
        rooms: ['master bed.JPG', 'guest room.jpg']
    },
    {
        keywords: ['omalley', "o'malley", 'malley'],
        images: ["The 1896 O' Malley house.jpg", "The 1896 OMalley house.jpg", "1896 o mailley house logo.gif"],
        rooms: ['english room.png', 'french floor.png']
    },
    {
        keywords: ['casa tierra'],
        images: ['Casa Tierra.jpg', 'Casa Tierra1.jpg', 'Casa Tierra2.jpg', 'Casa Tierra3.jpg'],
        rooms: ['adobe.JPG', 'east patio.JPG']
    },
    {
        keywords: ['eureka springs', 'eureka'],
        images: ['Eureka-1.gif', 'Eureka-2.gif', 'Eureka-3.gif', 'Eureka-4.gif', 'Eureka-Springs-B&B1.gif'],
        rooms: ['Cinnamon-Room.jpg', 'ArborRoom-QueenTwin.jpg']
    },
    {
        keywords: ['mountain thyme'],
        images: ['Mountain-Thyme-B&B1.gif', 'Mountain-Thyme-B&B2.gif', 'Mountain-Thyme-B&B3.gif', 'Mountain-Thyme-B&B4.gif'],
        rooms: ['standard 1 king bed.jpg', 'standard 1 queen bed.jpg']
    },
    {
        keywords: ['buckhorn'],
        images: ['thebuckhorninn1.jpg', 'thebuckhorninn2.jpg'],
        rooms: ['whirlpool suites.jpg', 'standard 1 king bed.jpg']
    },
    {
        keywords: ['lookout point'],
        images: ['lookoutpointinn1.gif', 'lookoutpointinn2.gif', 'lookoutpointinn3.gif', 'lookoutpointinn4.gif'],
        rooms: ['Sedona Suites.jpg', 'Paddlewheeler suite.jpg']
    },
    {
        keywords: ['wildflower'],
        images: ['wildflowerbb1.gif', 'wildflowerbb2.gif', 'wildflowerbb3.gif', 'wildflowerbb4.gif'],
        rooms: ['Moon Light Room.jpg', 'sunset room.jpg']
    },
    {
        keywords: ['beland manor', 'beland'],
        images: ['belandmanor.jpg', 'belandmanor1.jpg', 'belandmanor2.jpg'],
        rooms: ['Executive Suite.jpg', 'King George room 1.jpg']
    },
    {
        keywords: ['bernard lodge', 'st bernard'],
        images: ['stbernardlodge1.jpg', 'stbernardlodge2.jpg', 'Bernard Lodge.jpg'],
        rooms: ['BarnLoft.jpg', 'Bedroom4.jpg']
    },
    {
        keywords: ['alpenhorn'],
        images: ['alpenhorngasthaus.jpg', 'alpenhorngasthaus1.jpg', 'alpenhorngasthaus2.jpg'],
        rooms: ['deluxe king.png', 'standard duble.png']
    },
    {
        keywords: ['cannonboro', 'charleston'],
        images: ['Cannonboro_img.png', 'Charleston1.jpg', 'Charleston2.jpg'],
        rooms: ['The Master Suite.png', 'The Waterford Suite.png']
    },
    {
        keywords: ['carriage house'],
        images: ['Carriage House Inn1.jpg', 'Carriage House Inn2.jpg', 'CarriageHouse_01.jpg'],
        rooms: ['OfficeSuite_01.jpg', 'deluxe-suite.jpg']
    },
    {
        keywords: ['ashley inn', 'ashley'],
        images: ['The Ashley Inn_img.png', 'Ashland.jpg'],
        rooms: ['suite family room.jpg', 'standard room.png']
    },
    {
        keywords: ['robinwood'],
        images: ['robinwoodbnb1.gif', 'robinwoodbnb2.gif', 'robinwoodbnb3.gif', 'robinwoodbnb4.gif'],
        rooms: ['Blue hills.jpg', 'bedroomqueen.jpg']
    },
    {
        keywords: ['rosemont'],
        images: ['rosemontoflittlerock1.gif', 'rosemontoflittlerock2.gif', 'rosemontoflittlerock3.gif', 'rosemontoflittlerock4.gif'],
        rooms: ['bedroom2_1.jpg', 'bed3_small_right.jpg']
    },
    {
        keywords: ['west ridge'],
        images: ['westridgeguesthousepa1.jpg', 'westridgeguesthousepa2.jpg'],
        rooms: ['standard 2 double bed.jpg', 'master bed.JPG']
    },
    {
        keywords: ['white house inn'],
        images: ['whitehouseinn.jpg', 'whitehouseinn1.jpg', 'whitehouseinn2.jpg', 'whitehouseinn3.jpg', 'whitehouseinn4.jpg'],
        rooms: ['terrace1.jpg', 'terrace2.jpg']
    },
    {
        keywords: ['waitsfield'],
        images: ['waitsfieldinn1.jpg', 'waitsfieldinn2.jpg'],
        rooms: ['stardust room.jpg', 'sunrise room.jpg']
    },
    {
        keywords: ['bell hill'],
        images: ['historicbellhillbandb.jpg', 'historicbellhillbandb1.jpg', 'historicbellhillbandb2.jpg'],
        rooms: ['rich bedroom.bmp', 'green room.PNG']
    },
    {
        keywords: ['singing hills'],
        images: ['singinghillsinn.jpg', 'singinghillsinn1.jpg', 'singinghillsinn2.jpg'],
        rooms: ['standard 1 king bed.jpg', 'standard 1 queen bed.jpg']
    },
    {
        keywords: ['four seasons', 'fourseasons'],
        images: ['fourseasonscountryinn.jpg', 'fourseasonscountryinn1.jpg', 'fourseasonscountryinn2.jpg'],
        rooms: ['Winter.jpg', 'Spring.png']
    },
    {
        keywords: ['eagles view', 'eagle'],
        images: ['eaglesviewbnb.jpg', 'eaglesviewbnb1.jpg', 'eaglesviewbnb2.jpg'],
        rooms: ['BarnLoft.jpg', 'Loft Suite.png']
    },
    {
        keywords: ['elkhorn'],
        images: ['elkhornbnb.jpg', 'elkhornbnb1.jpg', 'elkhornbnb2.jpg'],
        rooms: ['firewood room.JPG', 'Green house room.JPG']
    },
    {
        keywords: ['grey swan'],
        images: ['greyswaninn1.jpg', 'greyswaninn2.jpg'],
        rooms: ['londonroom.jpg', 'moroccoroom.jpg']
    },
    {
        keywords: ['burke place'],
        images: ['burkeplace.jpg', 'burkeplace1.jpg', 'burkeplace2.jpg'],
        rooms: ['Laplace Room.png', 'Villenueve Room.png']
    },
    {
        keywords: ['country victorian'],
        images: ['Country-Victorian-B-&-B1.jpg', 'Country-Victorian-B-&-B2.jpg', 'Country-Victorian-B-&-B7.jpg', 'Country-Victorian-B-&-B13.jpg'],
        rooms: ['rose room.PNG', 'rose suit.JPG']
    },
    {
        keywords: ['baker'],
        images: ['baker1.gif', 'baker2.gif', 'baker3.gif', 'baker4.gif'],
        rooms: ['standard 1 king bed.jpg', 'deluxe-suite.jpg']
    },
    {
        keywords: ['rochester'],
        images: ['rochesterinn1.jpg', 'rochesterinn2.jpg'],
        rooms: ['room01.jpg', 'room03.jpg']
    },
    {
        keywords: ['lake degray'],
        images: ['lakedegraycabins1.gif', 'lakedegraycabins2.gif', 'lakedegraycabins3.gif', 'lakedegraycabins4.gif'],
        rooms: ['houseboat002003.jpg', 'living-rm-schoolhouse-new.jpg']
    },
    {
        keywords: ['mountain memories'],
        images: ['mountainmemories-B&B1.gif', 'mountainmemories-B&B2.gif', 'mountainmemories-B&B3.gif'],
        rooms: ['standard 1 king bed.jpg', 'whirlpool suites.jpg']
    },
    {
        keywords: ['miss martha'],
        images: ['missmarthas1.gif', 'missmarthas2.gif', 'missmarthas3.gif', 'missmarthas4.gif'],
        rooms: ['ArborRoom-QueenTwin.jpg', 'Cinnamon-Room.jpg']
    },
    {
        keywords: ['providence'],
        images: ['providenceinn1.jpg', 'providenceinn2.jpg'],
        rooms: ['room1.png', 'room2.png']
    },
    {
        keywords: ['victorian rose'],
        images: ['victorianrosegarden.jpg', 'victorianrosegarden1.jpg', 'victorianrosegarden2.jpg'],
        rooms: ['rose room.PNG', 'rose suit.JPG']
    },
    {
        keywords: ['white river'],
        images: ['thewhiteriverinn1.gif', 'thewhiteriverinn2.gif', 'thewhiteriverinn3.gif', 'thewhiteriverinn4.gif'],
        rooms: ['standard 1 king bed.jpg', 'standard 1 queen bed.jpg']
    },
    {
        keywords: ['tiffany'],
        images: ['tiffanysbedandbreakfast1.gif', 'tiffanysbedandbreakfast2.gif', 'tiffanysbedandbreakfast3.gif', 'tiffanysbedandbreakfast4.gif'],
        rooms: ['room 1c.jpg', 'room 3 2nd.jpg']
    },
    {
        keywords: ['ward mansion'],
        images: ['wardmansionbandb1.gif', 'wardmansionbandb2.gif', 'wardmansionbandb3.gif', 'wardmansionbandb4.gif'],
        rooms: ['The Master Suite.png', 'Executive Suite.jpg']
    },
    {
        keywords: ['rock cottage'],
        images: ['rockcottagegardens1.gif', 'rockcottagegardens2.gif', 'rockcottagegardens3.gif', 'rockcottagegardens4.gif'],
        rooms: ['Cinnamon-Room.jpg', 'Green house room.JPG']
    },
    {
        keywords: ['gables'],
        images: ['gablesn1.gif', 'gablesn2.gif', 'gablesn3.gif', 'gablesn4.gif'],
        rooms: ['standard 1 king bed.jpg', 'standard 1 queen bed.jpg']
    },
    {
        keywords: ['coquina'],
        images: ['coquinainn.jpg', 'coquinainn1.jpg'],
        rooms: ['Terrace Suite.png', 'Loft Suite.png']
    },
    {
        keywords: ['convent house'],
        images: ['conventhousebb1.jpg', 'conventhousebb2.jpg'],
        rooms: ['master bed.JPG', 'guest room.jpg']
    },
    {
        keywords: ['fantasia'],
        images: ['fantasiabb1.jpg', 'fantasiabb2.jpg'],
        rooms: ['rich bedroom.bmp', 'deluxe king.png']
    },
    {
        keywords: ['blair mountain', 'blair'],
        images: ['blairmtn1.jpg', 'blairmtn2.jpg', 'blairmtn3.jpg'],
        rooms: ['BarnLoft.jpg', 'Bedroom4.jpg']
    },
    {
        keywords: ['main street inn'],
        images: ['mainstreetinnbb.jpg', 'mainstreetinnbb1.jpg', 'mainstreetinnbb2.jpg', 'mainstreetinnbb3.jpg'],
        rooms: ['room01.jpg', 'room03.jpg']
    },
    {
        keywords: ['bb on the hill'],
        images: ['bbonthehill.jpg', 'bbonthehill1.jpg', 'bbonthehill2.jpg'],
        rooms: ['sunset room.jpg', 'sunrise room.jpg']
    }
];

// Curate distinct exterior photos from BnBimages
const authenticExteriorPool = allFiles.filter(f => {
    const l = f.toLowerCase();
    return l.includes('inn') || l.includes('house') || l.includes('bnb') || l.includes('lodge') || l.includes('manor') || l.includes('cottage') || l.includes('cabin') || l.includes('bb') || l.includes('ext') || l.includes('guesthouse') || l.includes('villa') || /^[a-z]+-[0-9]\.gif$/i.test(f) || /^[a-z]+[0-9]\.(jpg|gif|png)$/i.test(f);
});

// Curate distinct room photos from BnBimages
const authenticRoomPool = allFiles.filter(f => {
    const l = f.toLowerCase();
    return l.includes('room') || l.includes('suite') || l.includes('bed') || l.includes('loft') || l.includes('patio') || l.includes('interior') || l.includes('terrace') || l.includes('bath');
});

console.log(`Exterior Pool: ${authenticExteriorPool.length} authentic BnB exteriors`);
console.log(`Room Pool: ${authenticRoomPool.length} authentic BnB suites & rooms`);

function encodePath(filename) {
    return `/bnb-images/${encodeURIComponent(filename)}`;
}

async function replaceAllWithPureBnbImages() {
    console.log(`🔌 Connecting to MongoDB: ${MONGODB_URI}...`);
    await mongoose.connect(MONGODB_URI);
    console.log(`🟢 Connected to MongoDB.`);

    const db = mongoose.connection.db;
    const hotelsCol = db.collection('hotels');

    const hotels = await hotelsCol.find({}).toArray();
    console.log(`Replacing images for ALL ${hotels.length} hotels with 100% PURE BnBimages...`);

    for (let i = 0; i < hotels.length; i++) {
        const h = hotels[i];
        const hNameLower = (h.name || '').toLowerCase();

        let matched = null;
        for (const mapping of specificBnBMappings) {
            if (mapping.keywords.some(kw => hNameLower.includes(kw))) {
                matched = mapping;
                break;
            }
        }

        let hotelImages = [];
        let room1Img = "";
        let room2Img = "";

        if (matched) {
            hotelImages = matched.images.map(encodePath);
            room1Img = encodePath(matched.rooms[0] || authenticRoomPool[i % authenticRoomPool.length]);
            room2Img = encodePath(matched.rooms[1] || authenticRoomPool[(i + 1) % authenticRoomPool.length]);
        } else {
            // Pick 3-4 unique authentic BnB images from the authentic BnB pool (NO UNSPLASH!)
            const ext1 = authenticExteriorPool[(i * 3) % authenticExteriorPool.length];
            const ext2 = authenticExteriorPool[(i * 3 + 1) % authenticExteriorPool.length];
            const ext3 = authenticExteriorPool[(i * 3 + 2) % authenticExteriorPool.length];
            const rmSample = authenticRoomPool[(i * 2) % authenticRoomPool.length];

            hotelImages = [encodePath(ext1), encodePath(ext2), encodePath(ext3), encodePath(rmSample)];
            room1Img = encodePath(authenticRoomPool[(i * 2) % authenticRoomPool.length]);
            room2Img = encodePath(authenticRoomPool[(i * 2 + 1) % authenticRoomPool.length]);
        }

        const basePrice = h.rooms?.[0]?.price || (180 + ((i * 17) % 220));

        const richRooms = [
            {
                name: "King Heritage Suite",
                type: "King Heritage Suite",
                price: basePrice,
                capacity: 2,
                available: 3,
                amenities: ["King Bed", "Private En-Suite Bath", "Fireplace", "Breakfast Included", "Free WiFi", "Garden View", "Luxury Linens", "Antique Furnishings"],
                features: ["King Bed", "Private En-Suite Bath", "Fireplace", "Breakfast Included", "Air Conditioning", "Coffee Maker"],
                image: room1Img,
                images: [room1Img, hotelImages[0], hotelImages[1]]
            },
            {
                name: "Deluxe Historic Room",
                type: "Deluxe Historic Room",
                price: Math.max(120, basePrice - 60),
                capacity: 2,
                available: 4,
                amenities: ["Queen Bed", "En-Suite Bath", "Breakfast Included", "High-Speed WiFi", "Scenic Window", "Handcrafted Decor"],
                features: ["Queen Bed", "En-Suite Bath", "Breakfast Included", "High-Speed WiFi", "Daily Housekeeping"],
                image: room2Img,
                images: [room2Img, hotelImages[0], hotelImages[1]]
            }
        ];

        await hotelsCol.updateOne(
            { _id: h._id },
            {
                $set: {
                    images: hotelImages,
                    rooms: richRooms,
                    updatedAt: new Date()
                }
            }
        );
    }

    console.log(`\n=========================================================`);
    console.log(` ✅ Replaced 100% of Images with PURE BnBimages across all ${hotels.length} hotels!`);
    console.log(` 🚫 ZERO Unsplash images remaining in database!`);
    console.log(`=========================================================\n`);

    await mongoose.disconnect();
}

replaceAllWithPureBnbImages().catch(console.error);
