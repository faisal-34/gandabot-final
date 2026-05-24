import type { NextConfig } from "next";
import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  disable: process.env.NODE_ENV === "development",
  workboxOptions: {
    disableDevLogs: true,
    runtimeCaching: [
      {
        urlPattern: /^https:\/\/fonts\.(?:googleapis|gstatic)\.com\/.*/i,
        handler: "CacheFirst",
        options: {
          cacheName: "google-fonts",
          expiration: { maxEntries: 4, maxAgeSeconds: 365 * 24 * 60 * 60 },
        },
      },
      {
        urlPattern: /\.(?:eot|otf|ttc|ttf|woff|woff2|font\.css)$/i,
        handler: "StaleWhileRevalidate",
        options: {
          cacheName: "static-font-assets",
          expiration: { maxEntries: 4, maxAgeSeconds: 7 * 24 * 60 * 60 },
        },
      },
      {
        urlPattern: /\.(?:jpg|jpeg|gif|png|svg|ico|webp)$/i,
        handler: "StaleWhileRevalidate",
        options: {
          cacheName: "static-image-assets",
          expiration: { maxEntries: 64, maxAgeSeconds: 24 * 60 * 60 },
        },
      },
      {
        urlPattern: /\.(?:js)$/i,
        handler: "StaleWhileRevalidate",
        options: {
          cacheName: "static-js-assets",
          expiration: { maxEntries: 32, maxAgeSeconds: 24 * 60 * 60 },
        },
      },
      {
        urlPattern: /\.(?:css|less)$/i,
        handler: "StaleWhileRevalidate",
        options: {
          cacheName: "static-style-assets",
          expiration: { maxEntries: 32, maxAgeSeconds: 24 * 60 * 60 },
        },
      },
      {
        // Only cache GET API responses — POST/PUT/DELETE must not be cached
        urlPattern: /\/api\/.*$/i,
        handler: "NetworkFirst",
        method: "GET",
        options: {
          cacheName: "apis",
          expiration: { maxEntries: 16, maxAgeSeconds: 24 * 60 * 60 },
          networkTimeoutSeconds: 10,
        },
      },
      {
        urlPattern: /.*/i,
        handler: "NetworkFirst",
        options: {
          cacheName: "others",
          expiration: { maxEntries: 32, maxAgeSeconds: 24 * 60 * 60 },
          networkTimeoutSeconds: 10,
        },
      },
    ],
  },
});

const isProd = process.env.NODE_ENV === "production";

/**
 * Security headers applied to every response.
 * HSTS only in production so local dev stays on HTTP without browser forcing HTTPS.
 */
const SECURITY_HEADERS = [
  // Prevent clickjacking
  { key: "X-Frame-Options", value: "DENY" },
  // Prevent MIME sniffing
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Control referrer leakage
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Allow browser DNS prefetching for performance
  { key: "X-DNS-Prefetch-Control", value: "on" },
  // Restrict browser features (camera/mic only via user gesture, no unnecessary APIs)
  {
    key: "Permissions-Policy",
    value: [
      "camera=(self)",       // allowed — GandaFeed record tab
      "microphone=(self)",   // allowed — GandaFeed record tab
      "geolocation=()",      // disallowed
      "payment=()",          // disallowed
      "usb=()",              // disallowed
      "interest-cohort=()",  // disable FLoC
    ].join(", "),
  },
  // HSTS: force HTTPS for 1 year in production
  ...(isProd
    ? [
        {
          key: "Strict-Transport-Security",
          value: "max-age=31536000; includeSubDomains; preload",
        },
      ]
    : []),
];

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // 4 MB — covers video thumbnail uploads; individual video files go
      // through /api/create/upload (multipart) which bypasses this limit
      bodySizeLimit: "4mb",
    },
  },
  async headers() {
    return [{ source: "/(.*)", headers: SECURITY_HEADERS }];
  },
  // Silence the "img.unsplash.com" Next.js image warning for LandingPage
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "img.clerk.com" },
    ],
  },
};

export default withPWA(nextConfig);
