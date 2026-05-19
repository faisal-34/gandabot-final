/**
 * Icon generation script for GandaBot PWA
 * Run: node scripts/generate-icons.mjs
 * Requires: npm install sharp --save-dev
 *
 * Place your source icon (at least 512x512 PNG) at:
 *   public/icons/icon-source.png
 */

import sharp from "sharp";
import { existsSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const INPUT = join(ROOT, "public/icons/icon-source.png");
const OUT_DIR = join(ROOT, "public/icons");

if (!existsSync(INPUT)) {
  console.error("❌ Source icon not found:", INPUT);
  console.error("   Place a 512x512+ PNG at public/icons/icon-source.png");
  process.exit(1);
}

if (!existsSync(OUT_DIR)) mkdirSync(OUT_DIR, { recursive: true });

const SIZES = [72, 96, 128, 144, 152, 192, 384, 512];

// Regular icons — white background to match the bird logo
for (const size of SIZES) {
  await sharp(INPUT)
    .resize(size, size, { fit: "contain", background: { r: 255, g: 255, b: 255, alpha: 1 } })
    .flatten({ background: { r: 255, g: 255, b: 255 } })
    .png()
    .toFile(join(OUT_DIR, `icon-${size}x${size}.png`));
  console.log(`✅ icon-${size}x${size}.png`);
}

// Maskable icons — white background with safe-area padding
for (const size of [192, 512]) {
  const innerSize = Math.round(size * 0.8);
  const padding = Math.round((size - innerSize) / 2);
  await sharp(INPUT)
    .resize(innerSize, innerSize, { fit: "contain", background: { r: 255, g: 255, b: 255, alpha: 1 } })
    .flatten({ background: { r: 255, g: 255, b: 255 } })
    .extend({
      top: padding,
      bottom: padding,
      left: padding,
      right: padding,
      background: { r: 255, g: 255, b: 255 },
    })
    .resize(size, size)
    .png()
    .toFile(join(OUT_DIR, `icon-maskable-${size}x${size}.png`));
  console.log(`✅ icon-maskable-${size}x${size}.png`);
}

console.log("\n🎉 All icons generated in public/icons/");
