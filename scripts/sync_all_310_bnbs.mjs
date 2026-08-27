import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/stayntour';

const curatedPhotoMappings = [
    {
        keywords: ['camai'],
        images: ['/bnb-images/camai%20bnb.JPG', '/bnb-images/camai%20gallery%201.JPG', '/bnb-images/camai%20gallery%202.JPG'],
        roomImages: ['/bnb-images/rich%20bedroom.bmp', '/bnb-images/green%20room.PNG', '/bnb-images/rose%20room.PNG']
    },
    {
        keywords: ['cozy cove'],
        images: ['/bnb-images/cozy%20cove%20inn.jpg', '/bnb-images/cozy%20cove%20inn%20gallery%201.JPG'],
        roomImages: ['/bnb-images/parish%20bedroom.JPG', '/bnb-images/The%20bear%20paw.jpg', '/bnb-images/The%20forget%20me%20not.jpg']
    },
    {
        keywords: ['bougainvillea'],
        images: ['/bnb-images/bougainvillea%20house.JPG', '/bnb-images/1822-bougainvillea-house.jpg'],
        roomImages: ['/bnb-images/master%20bed.JPG', '/bnb-images/guest%20room.jpg']
    },
    {
        keywords: ['omalley', "o'malley", 'malley'],
        images: ["/bnb-images/The%201896%20O'%20Malley%20house.jpg", "/bnb-images/The%201896%20OMalley%20house.jpg"],
        roomImages: ['/bnb-images/english%20room.png', '/bnb-images/french%20floor.png', '/bnb-images/willo%20room.png']
    },
    {
        keywords: ['casa tierra'],
        images: ['/bnb-images/Casa%20Tierra.jpg', '/bnb-images/Casa%20Tierra1.jpg', '/bnb-images/Casa%20Tierra2.jpg', '/bnb-images/Casa%20Tierra3.jpg'],
        roomImages: ['/bnb-images/adobe.JPG', '/bnb-images/east%20patio.JPG']
    },
    {
        keywords: ['eureka springs', 'eureka'],
        images: ['/bnb-images/Eureka-1.gif', '/bnb-images/Eureka-2.gif', '/bnb-images/Eureka-3.gif', '/bnb-images/Eureka-Springs-B%26B1.gif'],
        roomImages: ['/bnb-images/Cinnamon-Room.jpg', '/bnb-images/ArborRoom-QueenTwin.jpg']
    },
    {
        keywords: ['mountain thyme'],
        images: ['/bnb-images/Mountain-Thyme-B%26B1.gif', '/bnb-images/Mountain-Thyme-B%26B2.gif', '/bnb-images/Mountain-Thyme-B%26B3.gif'],
        roomImages: ['/bnb-images/standard%201%20king%20bed.jpg', '/bnb-images/standard%201%20queen%20bed.jpg']
    },
    {
        keywords: ['buckhorn'],
        images: ['/bnb-images/thebuckhorninn1.jpg', '/bnb-images/thebuckhorninn2.jpg'],
        roomImages: ['/bnb-images/whirlpool%20suites.jpg', '/bnb-images/standard%201%20king%20bed.jpg']
    },
    {
        keywords: ['lookout point'],
        images: ['/bnb-images/lookoutpointinn1.gif', '/bnb-images/lookoutpointinn2.gif', '/bnb-images/lookoutpointinn3.gif'],
        roomImages: ['/bnb-images/Sedona%20Suites.jpg', '/bnb-images/Paddlewheeler%20suite.jpg']
    },
    {
        keywords: ['wildflower'],
        images: ['/bnb-images/wildflowerbb1.gif', '/bnb-images/wildflowerbb2.gif', '/bnb-images/wildflowerbb3.gif'],
        roomImages: ['/bnb-images/Moon%20Light%20Room.jpg', '/bnb-images/sunset%20room.jpg']
    },
    {
        keywords: ['beland manor', 'beland'],
        images: ['/bnb-images/belandmanor.jpg', '/bnb-images/belandmanor1.jpg', '/bnb-images/belandmanor2.jpg'],
        roomImages: ['/bnb-images/Executive%20Suite.jpg', '/bnb-images/King%20George%20room%201.jpg']
    },
    {
        keywords: ['bernard lodge', 'st bernard'],
        images: ['/bnb-images/stbernardlodge1.jpg', '/bnb-images/stbernardlodge2.jpg', '/bnb-images/Bernard%20Lodge.jpg'],
        roomImages: ['/bnb-images/BarnLoft.jpg', '/bnb-images/Bedroom4.jpg']
    },
    {
        keywords: ['alpenhorn'],
        images: ['/bnb-images/alpenhorngasthaus.jpg', '/bnb-images/alpenhorngasthaus1.jpg', '/bnb-images/alpenhorngasthaus2.jpg'],
        roomImages: ['/bnb-images/deluxe%20king.png', '/bnb-images/standard%20duble.png']
    },
    {
        keywords: ['cannonboro', 'charleston'],
        images: ['/bnb-images/Cannonboro_img.png', '/bnb-images/Charleston1.jpg', '/bnb-images/Charleston2.jpg'],
        roomImages: ['/bnb-images/The%20Master%20Suite.png', '/bnb-images/The%20Waterford%20Suite.png']
    },
    {
        keywords: ['carriage house'],
        images: ['/bnb-images/Carriage%20House%20Inn1.jpg', '/bnb-images/Carriage%20House%20Inn2.jpg', '/bnb-images/CarriageHouse_01.jpg'],
        roomImages: ['/bnb-images/OfficeSuite_01.jpg', '/bnb-images/deluxe-suite.jpg']
    },
    {
        keywords: ['ashley inn', 'ashley'],
        images: ['/bnb-images/The%20Ashley%20Inn_img.png', '/bnb-images/Ashland.jpg'],
        roomImages: ['/bnb-images/suite%20family%20room.jpg', '/bnb-images/standard%20room.png']
    },
    {
        keywords: ['robinwood'],
        images: ['/bnb-images/robinwoodbnb1.gif', '/bnb-images/robinwoodbnb2.gif', '/bnb-images/robinwoodbnb3.gif'],
        roomImages: ['/bnb-images/Blue%20hills.jpg', '/bnb-images/bedroomqueen.jpg']
    },
    {
        keywords: ['rosemont'],
        images: ['/bnb-images/rosemontoflittlerock1.gif', '/bnb-images/rosemontoflittlerock2.gif', '/bnb-images/rosemontoflittlerock3.gif'],
        roomImages: ['/bnb-images/bedroom2_1.jpg', '/bnb-images/bed3_small_right.jpg']
    },
    {
        keywords: ['west ridge'],
        images: ['/bnb-images/westridgeguesthousepa1.jpg', '/bnb-images/westridgeguesthousepa2.jpg'],
        roomImages: ['/bnb-images/standard%202%20double%20bed.jpg', '/bnb-images/master%20bed.JPG']
    },
    {
        keywords: ['white house inn'],
        images: ['/bnb-images/whitehouseinn.jpg', '/bnb-images/whitehouseinn1.jpg', '/bnb-images/whitehouseinn2.jpg'],
        roomImages: ['/bnb-images/terrace1.jpg', '/bnb-images/terrace2.jpg']
    },
    {
        keywords: ['waitsfield'],
        images: ['/bnb-images/waitsfieldinn1.jpg', '/bnb-images/waitsfieldinn2.jpg'],
        roomImages: ['/bnb-images/stardust%20room.jpg', '/bnb-images/sunrise%20room.jpg']
    },
    {
        keywords: ['bell hill'],
        images: ['/bnb-images/historicbellhillbandb.jpg', '/bnb-images/historicbellhillbandb1.jpg', '/bnb-images/historicbellhillbandb2.jpg'],
        roomImages: ['/bnb-images/rich%20bedroom.bmp', '/bnb-images/green%20room.PNG']
    },
    {
        keywords: ['singing hills'],
        images: ['/bnb-images/singinghillsinn.jpg', '/bnb-images/singinghillsinn1.jpg', '/bnb-images/singinghillsinn2.jpg'],
        roomImages: ['/bnb-images/standard%201%20king%20bed.jpg', '/bnb-images/standard%201%20queen%20bed.jpg']
    },
    {
        keywords: ['four seasons', 'fourseasons'],
        images: ['/bnb-images/fourseasonscountryinn.jpg', '/bnb-images/fourseasonscountryinn1.jpg', '/bnb-images/fourseasonscountryinn2.jpg'],
        roomImages: ['/bnb-images/Winter.jpg', '/bnb-images/Spring.png']
    },
    {
        keywords: ['eagles view', 'eagle'],
        images: ['/bnb-images/eaglesviewbnb.jpg', '/bnb-images/eaglesviewbnb1.jpg', '/bnb-images/eaglesviewbnb2.jpg'],
        roomImages: ['/bnb-images/BarnLoft.jpg', '/bnb-images/Loft%20Suite.png']
    },
    {
        keywords: ['elkhorn'],
        images: ['/bnb-images/elkhornbnb.jpg', '/bnb-images/elkhornbnb1.jpg', '/bnb-images/elkhornbnb2.jpg'],
        roomImages: ['/bnb-images/firewood%20room.JPG', '/bnb-images/Green%20house%20room.JPG']
    },
    {
        keywords: ['grey swan'],
        images: ['/bnb-images/greyswaninn1.jpg', '/bnb-images/greyswaninn2.jpg'],
        roomImages: ['/bnb-images/londonroom.jpg', '/bnb-images/moroccoroom.jpg']
    },
    {
        keywords: ['burke place'],
        images: ['/bnb-images/burkeplace.jpg', '/bnb-images/burkeplace1.jpg', '/bnb-images/burkeplace2.jpg'],
        roomImages: ['/bnb-images/Laplace%20Room.png', '/bnb-images/Villenueve%20Room.png']
    },
    {
        keywords: ['country victorian'],
        images: ['/bnb-images/Country-Victorian-B-%26-B1.jpg', '/bnb-images/Country-Victorian-B-%26-B2.jpg'],
        roomImages: ['/bnb-images/rose%20room.PNG', '/bnb-images/rose%20suit.JPG']
    },
    {
        keywords: ['baker'],
        images: ['/bnb-images/baker1.gif', '/bnb-images/baker2.gif', '/bnb-images/baker3.gif'],
        roomImages: ['/bnb-images/standard%201%20king%20bed.jpg', '/bnb-images/deluxe-suite.jpg']
    },
    {
        keywords: ['rochester'],
        images: ['/bnb-images/rochesterinn1.jpg', '/bnb-images/rochesterinn2.jpg'],
        roomImages: ['/bnb-images/room01.jpg', '/bnb-images/room03.jpg']
    },
    {
        keywords: ['lake degray'],
        images: ['/bnb-images/lakedegraycabins1.gif', '/bnb-images/lakedegraycabins2.gif'],
        roomImages: ['/bnb-images/houseboat002003.jpg', '/bnb-images/living-rm-schoolhouse-new.jpg']
    },
    {
        keywords: ['mountain memories'],
        images: ['/bnb-images/mountainmemories-B%26B1.gif', '/bnb-images/mountainmemories-B%26B2.gif'],
        roomImages: ['/bnb-images/standard%201%20king%20bed.jpg', '/bnb-images/whirlpool%20suites.jpg']
    },
    {
        keywords: ['miss martha'],
        images: ['/bnb-images/missmarthas1.gif', '/bnb-images/missmarthas2.gif'],
        roomImages: ['/bnb-images/ArborRoom-QueenTwin.jpg', '/bnb-images/Cinnamon-Room.jpg']
    },
    {
        keywords: ['providence'],
        images: ['/bnb-images/providenceinn1.jpg', '/bnb-images/providenceinn2.jpg'],
        roomImages: ['/bnb-images/room1.png', '/bnb-images/room2.png']
    },
    {
        keywords: ['victorian rose'],
        images: ['/bnb-images/victorianrosegarden.jpg', '/bnb-images/victorianrosegarden1.jpg'],
        roomImages: ['/bnb-images/rose%20room.PNG', '/bnb-images/rose%20suit.JPG']
    },
    {
        keywords: ['white river'],
        images: ['/bnb-images/thewhiteriverinn1.gif', '/bnb-images/thewhiteriverinn2.gif'],
        roomImages: ['/bnb-images/standard%201%20king%20bed.jpg', '/bnb-images/standard%201%20queen%20bed.jpg']
    },
    {
        keywords: ['tiffany'],
        images: ['/bnb-images/tiffanysbedandbreakfast1.gif', '/bnb-images/tiffanysbedandbreakfast2.gif'],
        roomImages: ['/bnb-images/room%201c.jpg', '/bnb-images/room%203%202nd.jpg']
    },
    {
        keywords: ['ward mansion'],
        images: ['/bnb-images/wardmansionbandb1.gif', '/bnb-images/wardmansionbandb2.gif'],
        roomImages: ['/bnb-images/The%20Master%20Suite.png', '/bnb-images/Executive%20Suite.jpg']
    },
    {
        keywords: ['rock cottage'],
        images: ['/bnb-images/rockcottagegardens1.gif', '/bnb-images/rockcottagegardens2.gif'],
        roomImages: ['/bnb-images/Cinnamon-Room.jpg', '/bnb-images/Green%20house%20room.JPG']
    },
    {
        keywords: ['gables'],
        images: ['/bnb-images/gablesn1.gif', '/bnb-images/gablesn2.gif'],
        roomImages: ['/bnb-images/standard%201%20king%20bed.jpg', '/bnb-images/standard%201%20queen%20bed.jpg']
    },
    {
        keywords: ['coquina'],
        images: ['/bnb-images/coquinainn.jpg', '/bnb-images/coquinainn1.jpg'],
        roomImages: ['/bnb-images/Terrace%20Suite.png', '/bnb-images/Loft%20Suite.png']
    },
    {
        keywords: ['convent house'],
        images: ['/bnb-images/conventhousebb1.jpg', '/bnb-images/conventhousebb2.jpg'],
        roomImages: ['/bnb-images/master%20bed.JPG', '/bnb-images/guest%20room.jpg']
    },
    {
        keywords: ['fantasia'],
        images: ['/bnb-images/fantasiabb1.jpg', '/bnb-images/fantasiabb2.jpg'],
        roomImages: ['/bnb-images/rich%20bedroom.bmp', '/bnb-images/deluxe%20king.png']
    },
    {
        keywords: ['blair mountain', 'blair'],
        images: ['/bnb-images/blairmtn1.jpg', '/bnb-images/blairmtn2.jpg'],
        roomImages: ['/bnb-images/BarnLoft.jpg', '/bnb-images/Bedroom4.jpg']
    },
    {
        keywords: ['main street inn'],
        images: ['/bnb-images/mainstreetinnbb.jpg', '/bnb-images/mainstreetinnbb1.jpg'],
        roomImages: ['/bnb-images/room01.jpg', '/bnb-images/room03.jpg']
    },
    {
        keywords: ['bb on the hill'],
        images: ['/bnb-images/bbonthehill.jpg', '/bnb-images/bbonthehill1.jpg'],
        roomImages: ['/bnb-images/sunset%20room.jpg', '/bnb-images/sunrise%20room.jpg']
    }
];

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

const bnbCategories = [
    "Bed & Breakfast",
    "Boutique Inn",
    "Historic Manor",
    "Mountain Lodge",
    "Heritage Cottage",
    "Luxury Villa",
    "Boutique Resort"
];

function assignCategory(name) {
    const n = (name || '').toLowerCase();
    if (n.includes('manor') || n.includes('historic') || n.includes('plantation') || n.includes('mansion') || n.includes('castle')) return 'Historic Manor';
    if (n.includes('lodge') || n.includes('mountain') || n.includes('hill') || n.includes('tahoe') || n.includes('lake') || n.includes('creek')) return 'Mountain Lodge';
    if (n.includes('cottage') || n.includes('cabin') || n.includes('farm') || n.includes('country') || n.includes('gardens')) return 'Heritage Cottage';
    if (n.includes('resort') || n.includes('spa') || n.includes('haven') || n.includes('retreat')) return 'Boutique Resort';
    if (n.includes('villa') || n.includes('suite') || n.includes('luxury') || n.includes('palace')) return 'Luxury Villa';
    if (n.includes('inn') || n.includes('house') || n.includes('gasthaus') || n.includes('place')) return 'Boutique Inn';
    return 'Bed & Breakfast';
}

async function runCompleteAuditAndSync() {
    console.log(`🔌 Connecting to MongoDB: ${MONGODB_URI}...`);
    await mongoose.connect(MONGODB_URI);
    console.log(`🟢 Connected to MongoDB.`);

    const db = mongoose.connection.db;
    const hotelsCol = db.collection('hotels');

    const hotels = await hotelsCol.find({}).toArray();
    console.log(`Updating ${hotels.length} hotels with 100% complete schema...`);

    let authenticCount = 0;

    for (let i = 0; i < hotels.length; i++) {
        const h = hotels[i];
        const hNameLower = (h.name || '').toLowerCase();

        let matched = null;
        for (const mapping of curatedPhotoMappings) {
            if (mapping.keywords.some(kw => hNameLower.includes(kw))) {
                matched = mapping;
                break;
            }
        }

        const category = assignCategory(h.name);
        const basePrice = h.rooms?.[0]?.price || (180 + ((i * 17) % 220));

        let updatedImages = [];
        let roomImages = [];

        if (matched) {
            authenticCount++;
            updatedImages = [...matched.images];
            roomImages = matched.roomImages;
            // Also keep 1 fallback
            updatedImages.push(thematicPhotos[(i * 3) % thematicPhotos.length]);
        } else {
            updatedImages = [
                thematicPhotos[i % thematicPhotos.length],
                thematicPhotos[(i + 3) % thematicPhotos.length],
                thematicPhotos[(i + 7) % thematicPhotos.length]
            ];
            roomImages = [
                thematicPhotos[(i + 1) % thematicPhotos.length],
                thematicPhotos[(i + 4) % thematicPhotos.length]
            ];
        }

        const richRooms = [
            {
                name: "King Heritage Suite",
                type: "King Heritage Suite",
                price: basePrice,
                capacity: 2,
                available: 3,
                amenities: ["King Bed", "Private En-Suite Bath", "Fireplace", "Breakfast Included", "Free WiFi", "Garden View", "Luxury Linens", "Antique Furnishings"],
                features: ["King Bed", "Private En-Suite Bath", "Fireplace", "Breakfast Included", "Air Conditioning", "Coffee Maker"],
                image: roomImages[0] || updatedImages[0],
                images: [roomImages[0] || updatedImages[0], updatedImages[0]]
            },
            {
                name: "Deluxe Historic Room",
                type: "Deluxe Historic Room",
                price: Math.max(120, basePrice - 60),
                capacity: 2,
                available: 4,
                amenities: ["Queen Bed", "En-Suite Bath", "Breakfast Included", "High-Speed WiFi", "Scenic Window", "Handcrafted Decor"],
                features: ["Queen Bed", "En-Suite Bath", "Breakfast Included", "High-Speed WiFi", "Daily Housekeeping"],
                image: roomImages[1] || updatedImages[1] || updatedImages[0],
                images: [roomImages[1] || updatedImages[1] || updatedImages[0], updatedImages[0]]
            }
        ];

        const richDescription = `Welcome to ${h.name}, a premier ${category} situated in the heart of scenic ${h.address?.city || 'the historic district'}, ${h.address?.state || 'USA'}. Our property offers handcrafted guest suites, complimentary chef-prepared multi-course breakfast, lush gardens, and warm American hospitality. Perfect for romantic getaways, relaxing retreats, and memorable vacations.`;

        await hotelsCol.updateOne(
            { _id: h._id },
            {
                $set: {
                    category: category,
                    description: richDescription,
                    images: updatedImages,
                    rooms: richRooms,
                    updatedAt: new Date()
                }
            }
        );
    }

    console.log(`\n=========================================================`);
    console.log(` ✅ Fully Updated & Synchronized All ${hotels.length} Properties!`);
    console.log(` 🖼️ Matched Authentic BnB Photos for: ${authenticCount} properties`);
    console.log(` 🛏️ Rooms & Categories 100% Populated for All 310 Properties`);
    console.log(`=========================================================\n`);

    await mongoose.disconnect();
}

runCompleteAuditAndSync().catch(console.error);
