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

// Regular icons
for (const size of SIZES) {
  await sharp(INPUT)
    .resize(size, size, { fit: "contain", background: { r: 12, g: 31, b: 23, alpha: 1 } })
    .png()
    .toFile(join(OUT_DIR, `icon-${size}x${size}.png`));
  console.log(`✅ icon-${size}x${size}.png`);
}

// Maskable icons (extra padding — safe area 80% of canvas)
for (const size of [192, 512]) {
  const innerSize = Math.round(size * 0.72);
  const padding = Math.round((size - innerSize) / 2);
  await sharp(INPUT)
    .resize(innerSize, innerSize, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .extend({
      top: padding,
      bottom: padding,
      left: padding,
      right: padding,
      background: { r: 12, g: 31, b: 23, alpha: 1 },
    })
    .resize(size, size)
    .png()
    .toFile(join(OUT_DIR, `icon-maskable-${size}x${size}.png`));
  console.log(`✅ icon-maskable-${size}x${size}.png`);
}

console.log("\n🎉 All icons generated in public/icons/");
