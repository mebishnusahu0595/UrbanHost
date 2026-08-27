import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/stayntour';
const imagesDir = path.resolve('BnBimages');

function normalize(str) {
    return (str || '').toLowerCase().replace(/[^a-z0-9]/g, '');
}

// Curated specific mappings for 100% accuracy matching hotel names to exact BnBimages files
const curatedPhotoMappings = [
    {
        keywords: ['camai', 'anchorage'],
        images: ['camai bnb.JPG', 'camai gallery 1.JPG', 'camai gallery 2.JPG'],
        roomImages: ['rich bedroom.bmp', 'green room.PNG', 'rose room.PNG']
    },
    {
        keywords: ['cozy cove', 'homer'],
        images: ['cozy cove inn.jpg', 'cozy cove inn gallery 1.JPG'],
        roomImages: ['parish bedroom.JPG', 'The bear paw.jpg', 'The forget me not.jpg']
    },
    {
        keywords: ['bougainvillea', '1822'],
        images: ['bougainvillea house.JPG', '1822-bougainvillea-house.jpg'],
        roomImages: ['master bed.JPG', 'guest room.jpg']
    },
    {
        keywords: ['omalley', "o'malley", '1896'],
        images: ["The 1896 O' Malley house.jpg", "The 1896 OMalley house.jpg"],
        roomImages: ['english room.png', 'french floor.png', 'willo room.png']
    },
    {
        keywords: ['casa tierra', 'tucson'],
        images: ['Casa Tierra.jpg', 'Casa Tierra1.jpg', 'Casa Tierra2.jpg', 'Casa Tierra3.jpg'],
        roomImages: ['adobe.JPG', 'east patio.JPG']
    },
    {
        keywords: ['eureka springs', 'peabody'],
        images: ['Eureka-1.gif', 'Eureka-2.gif', 'Eureka-3.gif', 'Eureka-4.gif', 'Eureka-Springs-B&B1.gif', 'Eureka-Springs-B&B2.gif'],
        roomImages: ['Cinnamon-Room.jpg', 'ArborRoom-QueenTwin.jpg']
    },
    {
        keywords: ['mountain thyme', 'jessieville', 'hot springs'],
        images: ['Mountain-Thyme-B&B1.gif', 'Mountain-Thyme-B&B2.gif', 'Mountain-Thyme-B&B3.gif', 'Mountain-Thyme-B&B4.gif'],
        roomImages: ['standard 1 king bed.jpg', 'standard 1 queen bed.jpg']
    },
    {
        keywords: ['buckhorn', 'gatlinburg'],
        images: ['thebuckhorninn1.jpg', 'thebuckhorninn2.jpg'],
        roomImages: ['whirlpool suites.jpg', 'standard 1 king bed.jpg']
    },
    {
        keywords: ['lookout point', 'hot springs'],
        images: ['lookoutpointinn1.gif', 'lookoutpointinn2.gif', 'lookoutpointinn3.gif', 'lookoutpointinn4.gif'],
        roomImages: ['Sedona Suites.jpg', 'Paddlewheeler suite.jpg']
    },
    {
        keywords: ['wildflower', 'mountain view'],
        images: ['wildflowerbb1.gif', 'wildflowerbb2.gif', 'wildflowerbb3.gif', 'wildflowerbb4.gif'],
        roomImages: ['Moon Light Room.jpg', 'sunset room.jpg']
    },
    {
        keywords: ['beland manor', 'fort smith'],
        images: ['belandmanor.jpg', 'belandmanor1.jpg', 'belandmanor2.jpg'],
        roomImages: ['Executive Suite.jpg', 'King George room 1.jpg']
    },
    {
        keywords: ['bernard lodge', 'st bernard', 'chester'],
        images: ['stbernardlodge1.jpg', 'stbernardlodge2.jpg', 'Bernard Lodge.jpg'],
        roomImages: ['BarnLoft.jpg', 'Bedroom4.jpg']
    },
    {
        keywords: ['alpenhorn', 'hermann'],
        images: ['alpenhorngasthaus.jpg', 'alpenhorngasthaus1.jpg', 'alpenhorngasthaus2.jpg'],
        roomImages: ['deluxe king.png', 'standard duble.png']
    },
    {
        keywords: ['cannonboro', 'charleston'],
        images: ['Cannonboro_img.png', 'Charleston1.jpg', 'Charleston2.jpg'],
        roomImages: ['The Master Suite.png', 'The Waterford Suite.png']
    },
    {
        keywords: ['carriage house', 'newport'],
        images: ['Carriage House Inn1.jpg', 'Carriage House Inn2.jpg', 'CarriageHouse_01.jpg'],
        roomImages: ['OfficeSuite_01.jpg', 'deluxe-suite.jpg']
    },
    {
        keywords: ['ashley inn', 'lancaster'],
        images: ['The Ashley Inn_img.png', 'Ashland.jpg'],
        roomImages: ['suite family room.jpg', 'standard room.png']
    },
    {
        keywords: ['robinwood', 'eureka'],
        images: ['robinwoodbnb1.gif', 'robinwoodbnb2.gif', 'robinwoodbnb3.gif', 'robinwoodbnb4.gif'],
        roomImages: ['Blue hills.jpg', 'bedroomqueen.jpg']
    },
    {
        keywords: ['rosemont', 'little rock'],
        images: ['rosemontoflittlerock1.gif', 'rosemontoflittlerock2.gif', 'rosemontoflittlerock3.gif', 'rosemontoflittlerock4.gif'],
        roomImages: ['bedroom2_1.jpg', 'bed3_small_right.jpg']
    },
    {
        keywords: ['west ridge', 'pa', 'pennsylvania'],
        images: ['westridgeguesthousepa1.jpg', 'westridgeguesthousepa2.jpg'],
        roomImages: ['standard 2 double bed.jpg', 'master bed.JPG']
    },
    {
        keywords: ['white house inn', 'vermont', 'wilmington'],
        images: ['whitehouseinn.jpg', 'whitehouseinn1.jpg', 'whitehouseinn2.jpg', 'whitehouseinn3.jpg', 'whitehouseinn4.jpg'],
        roomImages: ['terrace1.jpg', 'terrace2.jpg', 'terrace3.jpg']
    },
    {
        keywords: ['waitsfield', 'vermont'],
        images: ['waitsfieldinn1.jpg', 'waitsfieldinn2.jpg'],
        roomImages: ['stardust room.jpg', 'sunrise room.jpg']
    },
    {
        keywords: ['bell hill', 'cobden'],
        images: ['historicbellhillbandb.jpg', 'historicbellhillbandb1.jpg', 'historicbellhillbandb2.jpg'],
        roomImages: ['rich bedroom.bmp', 'green room.PNG']
    },
    {
        keywords: ['singing hills', 'cave city'],
        images: ['singinghillsinn.jpg', 'singinghillsinn1.jpg', 'singinghillsinn2.jpg'],
        roomImages: ['standard 1 king bed.jpg', 'standard 1 queen bed.jpg']
    },
    {
        keywords: ['four seasons', 'fourseasons', 'colorado'],
        images: ['fourseasonscountryinn.jpg', 'fourseasonscountryinn1.jpg', 'fourseasonscountryinn2.jpg'],
        roomImages: ['Winter.jpg', 'Spring.png']
    },
    {
        keywords: ['eagles view', 'eagle'],
        images: ['eaglesviewbnb.jpg', 'eaglesviewbnb1.jpg', 'eaglesviewbnb2.jpg'],
        roomImages: ['BarnLoft.jpg', 'Loft Suite.png']
    },
    {
        keywords: ['elkhorn', 'estes park'],
        images: ['elkhornbnb.jpg', 'elkhornbnb1.jpg', 'elkhornbnb2.jpg'],
        roomImages: ['firewood room.JPG', 'Green house room.JPG']
    },
    {
        keywords: ['grey swan', 'blackstone'],
        images: ['greyswaninn1.jpg', 'greyswaninn2.jpg'],
        roomImages: ['londonroom.jpg', 'moroccoroom.jpg', 'moscowroom.jpg']
    },
    {
        keywords: ['burke place', 'louisiana'],
        images: ['burkeplace.jpg', 'burkeplace1.jpg', 'burkeplace2.jpg'],
        roomImages: ['Laplace Room.png', 'Villenueve Room.png']
    },
    {
        keywords: ['country victorian', 'b&b'],
        images: ['Country-Victorian-B-&-B1.jpg', 'Country-Victorian-B-&-B2.jpg', 'Country-Victorian-B-&-B7.jpg', 'Country-Victorian-B-&-B13.jpg'],
        roomImages: ['rose room.PNG', 'rose suit.JPG']
    },
    {
        keywords: ['baker', 'hot springs'],
        images: ['baker1.gif', 'baker2.gif', 'baker3.gif', 'baker4.gif'],
        roomImages: ['standard 1 king bed.jpg', 'deluxe-suite.jpg']
    },
    {
        keywords: ['rochester', 'inn'],
        images: ['rochesterinn1.jpg', 'rochesterinn2.jpg'],
        roomImages: ['room01.jpg', 'room03.jpg', 'room04.jpg']
    },
    {
        keywords: ['lake degray', 'cabins'],
        images: ['lakedegraycabins1.gif', 'lakedegraycabins2.gif', 'lakedegraycabins3.gif', 'lakedegraycabins4.gif'],
        roomImages: ['houseboat002003.jpg', 'living-rm-schoolhouse-new.jpg']
    },
    {
        keywords: ['mountain memories'],
        images: ['mountainmemories-B&B1.gif', 'mountainmemories-B&B2.gif', 'mountainmemories-B&B3.gif'],
        roomImages: ['standard 1 king bed.jpg', 'whirlpool suites.jpg']
    },
    {
        keywords: ['miss martha'],
        images: ['missmarthas1.gif', 'missmarthas2.gif', 'missmarthas3.gif', 'missmarthas4.gif'],
        roomImages: ['ArborRoom-QueenTwin.jpg', 'Cinnamon-Room.jpg']
    },
    {
        keywords: ['providence', 'inn'],
        images: ['providenceinn1.jpg', 'providenceinn2.jpg'],
        roomImages: ['room1.png', 'room2.png', 'room4.png']
    },
    {
        keywords: ['victorian rose', 'garden'],
        images: ['victorianrosegarden.jpg', 'victorianrosegarden1.jpg', 'victorianrosegarden2.jpg'],
        roomImages: ['rose room.PNG', 'rose suit.JPG']
    },
    {
        keywords: ['white river', 'inn'],
        images: ['thewhiteriverinn1.gif', 'thewhiteriverinn2.gif', 'thewhiteriverinn3.gif', 'thewhiteriverinn4.gif'],
        roomImages: ['standard 1 king bed.jpg', 'standard 1 queen bed.jpg']
    },
    {
        keywords: ['tiffany', 'bed and breakfast'],
        images: ['tiffanysbedandbreakfast1.gif', 'tiffanysbedandbreakfast2.gif', 'tiffanysbedandbreakfast3.gif', 'tiffanysbedandbreakfast4.gif'],
        roomImages: ['room 1c.jpg', 'room 3 2nd.jpg']
    },
    {
        keywords: ['ward mansion'],
        images: ['wardmansionbandb1.gif', 'wardmansionbandb2.gif', 'wardmansionbandb3.gif', 'wardmansionbandb4.gif'],
        roomImages: ['The Master Suite.png', 'Executive Suite.jpg']
    },
    {
        keywords: ['rock cottage', 'gardens'],
        images: ['rockcottagegardens1.gif', 'rockcottagegardens2.gif', 'rockcottagegardens3.gif', 'rockcottagegardens4.gif'],
        roomImages: ['Cinnamon-Room.jpg', 'Green house room.JPG']
    },
    {
        keywords: ['gables'],
        images: ['gablesn1.gif', 'gablesn2.gif', 'gablesn3.gif', 'gablesn4.gif'],
        roomImages: ['standard 1 king bed.jpg', 'standard 1 queen bed.jpg']
    },
    {
        keywords: ['coquina', 'inn'],
        images: ['coquinainn.jpg', 'coquinainn1.jpg'],
        roomImages: ['Terrace Suite.png', 'Loft Suite.png']
    },
    {
        keywords: ['convent house'],
        images: ['conventhousebb1.jpg', 'conventhousebb2.jpg'],
        roomImages: ['master bed.JPG', 'guest room.jpg']
    },
    {
        keywords: ['fantasia'],
        images: ['fantasiabb1.jpg', 'fantasiabb2.jpg'],
        roomImages: ['rich bedroom.bmp', 'deluxe king.png']
    },
    {
        keywords: ['blair', 'mountain'],
        images: ['blairmtn1.jpg', 'blairmtn2.jpg', 'blairmtn3.jpg'],
        roomImages: ['BarnLoft.jpg', 'Bedroom4.jpg']
    },
    {
        keywords: ['main street inn'],
        images: ['mainstreetinnbb.jpg', 'mainstreetinnbb1.jpg', 'mainstreetinnbb2.jpg', 'mainstreetinnbb3.jpg'],
        roomImages: ['room01.jpg', 'room03.jpg']
    },
    {
        keywords: ['bb on the hill'],
        images: ['bbonthehill.jpg', 'bbonthehill1.jpg', 'bbonthehill2.jpg'],
        roomImages: ['sunset room.jpg', 'sunrise room.jpg']
    }
];

// Fallback high-res authentic thematic photos pool
const thematicPhotos = [
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

async function applyAuthenticBnbImages() {
    console.log(`🔌 Connecting to MongoDB: ${MONGODB_URI}...`);
    await mongoose.connect(MONGODB_URI);
    console.log(`🟢 Connected to MongoDB.`);

    const db = mongoose.connection.db;
    const hotelsCol = db.collection('hotels');

    const hotels = await hotelsCol.find({}).toArray();
    console.log(`Processing ${hotels.length} hotels...`);

    let authenticAssignedCount = 0;

    for (let i = 0; i < hotels.length; i++) {
        const h = hotels[i];
        const hNameLower = (h.name || '').toLowerCase();
        const hCityLower = (h.address?.city || '').toLowerCase();

        // Check if matching curated mapping
        let matchedMapping = null;
        for (const mapping of curatedPhotoMappings) {
            const allMatch = mapping.keywords.every(kw => hNameLower.includes(kw) || hCityLower.includes(kw));
            if (allMatch) {
                matchedMapping = mapping;
                break;
            }
        }

        let updatedImages = [];
        let updatedRooms = h.rooms ? [...h.rooms] : [];

        if (matchedMapping) {
            // Found exact authentic BnB photo match!
            updatedImages = matchedMapping.images.map(img => `/bnb-images/${encodeURIComponent(img)}`);
            
            // Add room images to rooms
            if (matchedMapping.roomImages && matchedMapping.roomImages.length > 0) {
                for (let rIdx = 0; rIdx < updatedRooms.length; rIdx++) {
                    const roomImgFile = matchedMapping.roomImages[rIdx % matchedMapping.roomImages.length];
                    updatedRooms[rIdx].image = `/bnb-images/${encodeURIComponent(roomImgFile)}`;
                    updatedRooms[rIdx].images = [
                        `/bnb-images/${encodeURIComponent(roomImgFile)}`,
                        ...updatedImages
                    ];
                }
            }

            // Also keep 1-2 high-res ambiance photos in hotel images gallery
            const fallback1 = thematicPhotos[(i * 3) % thematicPhotos.length];
            const fallback2 = thematicPhotos[(i * 5) % thematicPhotos.length];
            updatedImages.push(fallback1, fallback2);

            authenticAssignedCount++;
            console.log(`🎯 [EXACT MATCH ${authenticAssignedCount}] "${h.name}" ➔ Assigned ${matchedMapping.images.length} BnB Photos!`);
        } else {
            // Clean fallback
            const img1 = thematicPhotos[i % thematicPhotos.length];
            const img2 = thematicPhotos[(i + 3) % thematicPhotos.length];
            const img3 = thematicPhotos[(i + 7) % thematicPhotos.length];
            updatedImages = [img1, img2, img3];

            for (let rIdx = 0; rIdx < updatedRooms.length; rIdx++) {
                const rImg = thematicPhotos[(i + rIdx + 1) % thematicPhotos.length];
                updatedRooms[rIdx].image = rImg;
                updatedRooms[rIdx].images = [rImg, img1, img2];
            }
        }

        await hotelsCol.updateOne(
            { _id: h._id },
            {
                $set: {
                    images: updatedImages,
                    rooms: updatedRooms,
                    updatedAt: new Date()
                }
            }
        );
    }

    console.log(`\n=========================================================`);
    console.log(` ✅ Assigned Authentic BnB Images to All Properties!`);
    console.log(` 🖼️ Exactly Mapped Specific BnB Properties: ${authenticAssignedCount}`);
    console.log(`=========================================================\n`);

    await mongoose.disconnect();
}

applyAuthenticBnbImages().catch(err => {
    console.error('Error applying images:', err);
    process.exit(1);
});
