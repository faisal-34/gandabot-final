/**
 * Generates the Google Play Store feature graphic (1024×500px)
 * Run: node scripts/generate-feature-graphic.mjs
 */

import sharp from "sharp";
import { existsSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const LOGO = join(ROOT, "public/icons/icon-source.png");
const OUT_DIR = join(ROOT, "public");
const OUT = join(OUT_DIR, "feature-graphic.png");

if (!existsSync(LOGO)) {
  console.error("❌ Logo not found at public/icons/icon-source.png");
  process.exit(1);
}
if (!existsSync(OUT_DIR)) mkdirSync(OUT_DIR, { recursive: true });

const W = 1024;
const H = 500;
const LOGO_SIZE = 220;

// Resize logo to fit, preserving transparency
const logoBuffer = await sharp(LOGO)
  .resize(LOGO_SIZE, LOGO_SIZE, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .png()
  .toBuffer();

// SVG overlay: tagline text + subtle glow dots
const svg = `
<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <!-- Radial glow behind logo -->
    <radialGradient id="glow" cx="50%" cy="45%" r="35%">
      <stop offset="0%" stop-color="#2EB898" stop-opacity="0.18"/>
      <stop offset="100%" stop-color="#0C1F17" stop-opacity="0"/>
    </radialGradient>

    <!-- Subtle bottom gradient for depth -->
    <linearGradient id="vignette" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#0C1F17" stop-opacity="0"/>
      <stop offset="100%" stop-color="#060F0B" stop-opacity="0.6"/>
    </linearGradient>

    <!-- Teal accent line gradient -->
    <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#219079" stop-opacity="0"/>
      <stop offset="30%" stop-color="#2EB898" stop-opacity="0.9"/>
      <stop offset="70%" stop-color="#2EB898" stop-opacity="0.9"/>
      <stop offset="100%" stop-color="#219079" stop-opacity="0"/>
    </linearGradient>
  </defs>

  <!-- Background -->
  <rect width="${W}" height="${H}" fill="#0C1F17"/>

  <!-- Radial glow -->
  <rect width="${W}" height="${H}" fill="url(#glow)"/>

  <!-- Decorative dots -->
  <circle cx="80"  cy="60"  r="2.5" fill="#2EB898" opacity="0.25"/>
  <circle cx="140" cy="110" r="1.5" fill="#2EB898" opacity="0.18"/>
  <circle cx="50"  cy="160" r="1.8" fill="#F47B20" opacity="0.2"/>
  <circle cx="944" cy="80"  r="2.5" fill="#2EB898" opacity="0.25"/>
  <circle cx="980" cy="150" r="1.5" fill="#F47B20" opacity="0.2"/>
  <circle cx="900" cy="420" r="2"   fill="#2EB898" opacity="0.18"/>
  <circle cx="120" cy="420" r="1.8" fill="#2EB898" opacity="0.18"/>

  <!-- Thin decorative horizontal line below logo area -->
  <rect x="312" y="390" width="400" height="1" fill="url(#lineGrad)" opacity="0.6"/>

  <!-- Tagline: main -->
  <text
    x="${W / 2}"
    y="418"
    font-family="Georgia, 'Times New Roman', serif"
    font-size="22"
    font-weight="700"
    fill="#F5EDD8"
    text-anchor="middle"
    letter-spacing="3"
  >LEARN LUGANDA · DISCOVER UGANDA</text>

  <!-- Sub-tagline -->
  <text
    x="${W / 2}"
    y="446"
    font-family="Arial, sans-serif"
    font-size="13"
    font-weight="400"
    fill="#2EB898"
    text-anchor="middle"
    letter-spacing="2"
    opacity="0.85"
  >AI-POWERED LANGUAGE &amp; CULTURE COMPANION</text>

  <!-- Bottom vignette -->
  <rect width="${W}" height="${H}" fill="url(#vignette)"/>
</svg>`;

// Compose: background + glow SVG, then logo centered, then text SVG on top
await sharp({
  create: {
    width: W,
    height: H,
    channels: 4,
    background: { r: 12, g: 31, b: 23, alpha: 1 },
  },
})
  .composite([
    // Background SVG (glow, dots, text)
    {
      input: Buffer.from(svg),
      top: 0,
      left: 0,
    },
    // Logo centered, positioned in upper 75% of the graphic
    {
      input: logoBuffer,
      top: Math.round((H * 0.08)),
      left: Math.round((W - LOGO_SIZE) / 2),
    },
  ])
  .png()
  .toFile(OUT);

console.log(`✅ Feature graphic saved → public/feature-graphic.png (${W}×${H})`);
console.log("   Upload this to Google Play Console → Store listing → Feature graphic");
