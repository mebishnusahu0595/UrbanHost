import fs from 'fs';
import path from 'path';

const bakPath = '/home/bishnups/Documents/projects/urbanhost/bbntourmyusmobi.bak';
const imagesDir = '/home/bishnups/Documents/projects/urbanhost/BnBimages';

async function analyzeBakImages() {
    console.log('Reading BnBimages directory...');
    const imageFiles = fs.readdirSync(imagesDir);
    console.log(`Total image files in BnBimages: ${imageFiles.length}`);

    const imageFilesLower = new Map();
    for (const file of imageFiles) {
        imageFilesLower.set(file.toLowerCase(), file);
        // Also map without extension or normalized
        const nameWithoutExt = path.parse(file).name.toLowerCase();
        imageFilesLower.set(nameWithoutExt, file);
    }

    console.log('Scanning .bak file for image references...');
    const bakBuffer = fs.readFileSync(bakPath);
    // Convert to latin1/ascii string chunks to find references
    const bakStr = bakBuffer.toString('latin1');

    // Look for occurrences of image filenames or .jpg / .gif / .png patterns in .bak
    const matchedFromBak = [];
    const pattern = /([a-zA-Z0-9_\-\s.&'%#]+\.(?:jpg|jpeg|png|gif|bmp))/gi;
    let match;
    const seenImagesInBak = new Set();
    while ((match = pattern.exec(bakStr)) !== null) {
        const foundName = match[1].trim();
        if (foundName.length > 3 && !seenImagesInBak.has(foundName.toLowerCase())) {
            seenImagesInBak.add(foundName.toLowerCase());
            const fileOnDisk = imageFilesLower.get(foundName.toLowerCase());
            if (fileOnDisk) {
                matchedFromBak.push({
                    bakName: foundName,
                    diskFile: fileOnDisk
                });
            }
        }
    }

    console.log(`Found ${seenImagesInBak.size} image references in .bak file.`);
    console.log(`Exact matching images on disk from .bak: ${matchedFromBak.length}`);
    console.log('Sample matches from .bak:');
    console.log(matchedFromBak.slice(0, 20));

    // Also see if we can match hotel names in MongoDB to images in BnBimages
    return {
        totalFiles: imageFiles.length,
        matchedInBak: matchedFromBak
    };
}

analyzeBakImages().catch(console.error);
