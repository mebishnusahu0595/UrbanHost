import sharp from 'sharp';
import path from 'path';
import fs from 'fs';

async function generatePwaIcons() {
  const root = process.cwd();
  const iconIn = path.join(root, 'public', 'icon.png');
  const icon192Out = path.join(root, 'public', 'icon-192.png');
  const icon512Out = path.join(root, 'public', 'icon-512.png');

  if (fs.existsSync(iconIn)) {
    console.log('Generating PWA Icons...');
    await sharp(iconIn)
      .resize(192, 192, { fit: 'contain', background: { r: 30, g: 58, b: 138, alpha: 1 } })
      .png()
      .toFile(icon192Out);

    await sharp(iconIn)
      .resize(512, 512, { fit: 'contain', background: { r: 30, g: 58, b: 138, alpha: 1 } })
      .png()
      .toFile(icon512Out);

    console.log('Generated icon-192.png and icon-512.png successfully!');
  }
}

generatePwaIcons().catch(console.error);
