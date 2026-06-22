// Generates PWA / home-screen icons from the bird logo.
// Run with: node scripts/generate-icons.cjs
const sharp = require('sharp');

const SRC = 'public/Logo_Bird_BS_480.png';
const BG = { r: 0, g: 0, b: 0, alpha: 1 }; // black, matches the app + avatar

// size = output canvas; ratio = how much of it the logo fills (rest is padding).
// Maskable icons need extra padding so Android's circle/squircle mask doesn't crop.
async function make(size, ratio, out) {
  const inner = Math.round(size * ratio);
  const logo = await sharp(SRC)
    .resize(inner, inner, { fit: 'contain', background: BG })
    .toBuffer();
  await sharp({ create: { width: size, height: size, channels: 4, background: BG } })
    .composite([{ input: logo, gravity: 'center' }])
    .png()
    .toFile(out);
  console.log('wrote', out, `${size}x${size}`);
}

(async () => {
  await make(192, 0.84, 'public/icon-192.png');
  await make(512, 0.84, 'public/icon-512.png');
  await make(512, 0.62, 'public/icon-maskable-512.png');
  await make(180, 0.84, 'public/apple-touch-icon.png');
})();
