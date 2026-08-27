import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';

const bakPath = '/home/bishnups/Documents/projects/urbanhost/bbntourmyusmobi.bak';
const imagesDir = '/home/bishnups/Documents/projects/urbanhost/BnBimages';
const destDir = '/home/bishnups/Documents/projects/urbanhost/public/bnb-images';

// Ensure public/bnb-images directory exists
if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
}

// Copy all images from BnBimages to public/bnb-images
const allImageFiles = fs.readdirSync(imagesDir);
console.log(`Copying ${allImageFiles.length} images to public/bnb-images...`);
for (const file of allImageFiles) {
    const src = path.join(imagesDir, file);
    const dst = path.join(destDir, file);
    fs.copyFileSync(src, dst);
}
console.log(`✅ All images copied to public/bnb-images!`);

const imageFilesSet = new Map();
for (const file of allImageFiles) {
    imageFilesSet.set(file.toLowerCase(), `/bnb-images/${file}`);
    imageFilesSet.set(encodeURIComponent(file).toLowerCase(), `/bnb-images/${encodeURIComponent(file)}`);
}

async function extractBnbRecordsWithImages() {
    const bakBuffer = fs.readFileSync(bakPath);
    const bakStr = bakBuffer.toString('latin1');

    // Find all BnbMember / property blocks in the .bak file
    // Let's find patterns where BnbName, City, State, and image files appear
    console.log('Analyzing .bak records...');

    // We can also match hotel names from our MongoDB to their specific images in BnBimages
    // For example:
    // "Camai Bed and Breakfast" -> "camai bnb.JPG", "camai gallery 1.JPG", "camai gallery 2.JPG", "camainb logo.JPG"
    // "Cozy Cove Inn" -> "cozy cove inn.jpg", "cozy cove inn gallery 1.JPG", "cozy cove inn logo.JPG"
    // "Bougainvillea House" -> "1822-bougainvillea-house.jpg", "bougainvillea house.JPG"
    // "1896 O'Malley House" -> "The 1896 O' Malley house.jpg", "The 1896 OMalley house.jpg", "1896 o mailley house logo.gif"
    // "Casa Tierra" -> "Casa Tierra.jpg", "Casa Tierra1.jpg", "Casa Tierra2.jpg", "Casa Tierra3.jpg"
    // "Eureka Springs" -> "Eureka-1.gif", "Eureka-2.gif", "Eureka-Springs-B&B1.gif"
    // "Mountain Thyme" -> "Mountain-Thyme-B&B1.gif", "Mountain-Thyme-B&B2.gif", "mountainthyme-logo.gif"
    // "The Buckhorn Inn" -> "thebuckhorninn1.jpg", "thebuckhorninn2.jpg"
    // "Lookout Point Inn" -> "lookoutpointinn1.gif", "lookoutpointinn2.gif", "lookoutpointinn-logo.gif"
    // "Wildflower" -> "wildflowerbb1.gif", "wildflowerbb2.gif"
    // "Beland Manor" -> "belandmanor.jpg", "belandmanor1.jpg"
    // "St. Bernard Lodge" -> "Bernard Lodge.jpg", "stbernardlodge1.jpg", "stbernardlodge2.jpg"
    // "Alpenhorn Gasthaus" -> "alpenhorngasthaus.jpg", "alpenhorngasthaus1.jpg"
    // "Cannonboro Inn" -> "Cannonboro_img.png"
    // "Carriage House Inn" -> "Carriage House Inn1.jpg", "Carriage House Inn2.jpg"
    // "The Ashley Inn" -> "The Ashley Inn_img.png"
    // "Robinwood" -> "robinwoodbnb1.gif", "robinwoodbnb2.gif"
    // "Rosemont" -> "rosemontoflittlerock1.gif", "rosemontoflittlerock2.gif"
    // "West Ridge Guest House" -> "westridgeguesthousepa1.jpg", "westridgeguesthousepa2.jpg"
    // "White House Inn" -> "whitehouseinn.jpg", "whitehouseinn1.jpg"
    // "Waitsfield Inn" -> "waitsfieldinn1.jpg", "waitsfieldinn2.jpg"
    // "Historic Bell Hill" -> "historicbellhillbandb.jpg", "historicbellhillbandb1.jpg"
    // "Singing Hills" -> "singinghillsinn.jpg", "singinghillsinn1.jpg"
    // "Four Seasons Country Inn" -> "fourseasonscountryinn.jpg", "fourseasonscountryinn1.jpg"
    // "Eagle's View" -> "eaglesviewbnb.jpg", "eaglesviewbnb1.jpg"
    // "Elkhorn" -> "elkhornbnb.jpg", "elkhornbnb1.jpg"
    // "Grey Swan Inn" -> "greyswaninn1.jpg", "greyswaninn2.jpg"
    // "Burke Place" -> "burkeplace.jpg", "burkeplace1.jpg"
    // "Bocage Plantation" -> "bocage plantation logo.JPG"
    // "Cajun Country" -> "cajun country logo.JPG", "cajungypsy.jpg"
    // "Cane River Cottage" -> "canerivercottage logo.JPG"
    // "Churchill House Inn" -> "churchillhouse inn logo.JPG"
    // "Brandon Inn" -> "brandon inn logo.JPG"
    // "Chipman Inn" -> "chipman inn logo.JPG"
    // "Country Victorian" -> "Country-Victorian-B-&-B1.jpg", "Country-Victorian-B-&-B2.jpg"

    // Let's connect to MongoDB and see how many hotels match!
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/stayntour';
    await mongoose.connect(MONGODB_URI);
    const hotelsCol = mongoose.connection.db.collection('hotels');
    const hotels = await hotelsCol.find({}).toArray();

    console.log(`Matching images for ${hotels.length} hotels in database...`);

    function normalize(str) {
        return (str || '').toLowerCase().replace(/[^a-z0-9]/g, '');
    }

    let matchedHotelsCount = 0;
    const hotelImageMap = new Map();

    for (const h of hotels) {
        const hNorm = normalize(h.name);
        const hCityNorm = normalize(h.address?.city);
        const matchedImages = [];

        for (const file of allImageFiles) {
            // Ignore system thumbnails and unrelated icons
            if (file === 'Thumbs.db' || file === 'Master Password.bmp' || file.startsWith('check_image') || file.startsWith('slide') || file.startsWith('home_') || file === 'banner.jpg') {
                continue;
            }

            const fNameNoExt = path.parse(file).name;
            const fNorm = normalize(fNameNoExt);

            // Check if file name matches hotel name or prominent keywords in hotel name
            const hotelWords = h.name.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter(w => !['the', 'and', 'a', 'of', 'in', 'at', 'bnb', 'inn', 'hotel', 'bed', 'breakfast', 'lodge', 'cottage', 'manor', 'house', 'resort', 'suites', 'retreat'].includes(w));
            
            let isMatch = false;

            // Direct substring match
            if (fNorm.includes(hNorm) || hNorm.includes(fNorm) && fNorm.length > 5) {
                isMatch = true;
            } else if (hotelWords.length > 0) {
                // Check if 2 significant words match or 1 rare word (length >= 5)
                const matchedWords = hotelWords.filter(w => w.length >= 4 && fNorm.includes(w));
                if (matchedWords.length >= 2 || (matchedWords.length === 1 && matchedWords[0].length >= 6)) {
                    isMatch = true;
                }
            }

            if (isMatch) {
                matchedImages.push(`/bnb-images/${encodeURIComponent(file)}`);
            }
        }

        if (matchedImages.length > 0) {
            matchedHotelsCount++;
            hotelImageMap.set(h._id.toString(), matchedImages);
            console.log(`📍 Hotel: "${h.name}" (${h.address?.city}, ${h.address?.state})`);
            console.log(`   ➜ Matched ${matchedImages.length} Real Images:`, matchedImages);
        }
    }

    console.log(`\n=========================================================`);
    console.log(` ✅ Matched authentic photos for ${matchedHotelsCount} hotels!`);
    console.log(`=========================================================\n`);

    await mongoose.disconnect();
}

extractBnbRecordsWithImages().catch(console.error);
