import sharp from 'sharp';
import path from 'path';
import fs from 'fs';

async function optimizeImages() {
  const root = process.cwd();
  const heroIn = path.join(root, 'public', 'hero.png');
  const heroOut = path.join(root, 'public', 'hero.webp');
  const heroSmallOut = path.join(root, 'public', 'hero-mobile.webp');

  if (fs.existsSync(heroIn)) {
    console.log('Optimizing hero image...');
    await sharp(heroIn)
      .resize(1920, 1080, { fit: 'cover', position: 'center' })
      .webp({ quality: 82, effort: 6 })
      .toFile(heroOut);

    await sharp(heroIn)
      .resize(800, 600, { fit: 'cover', position: 'center' })
      .webp({ quality: 80, effort: 6 })
      .toFile(heroSmallOut);

    const origStat = fs.statSync(heroIn);
    const newStat = fs.statSync(heroOut);
    console.log(`Hero optimization done: ${(origStat.size / (1024*1024)).toFixed(2)} MB -> ${(newStat.size / 1024).toFixed(1)} KB!`);
  }
}

optimizeImages().catch(console.error);
