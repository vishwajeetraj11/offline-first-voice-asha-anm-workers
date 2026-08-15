import type { NextConfig } from "next";
import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  cacheOnFrontEndNav: true,
  reloadOnOnline: true,
  disable: process.env.NODE_ENV === "development",
  fallbacks: {
    document: "/offline",
  },
  workboxOptions: {
    // Uploads/API calls are retried by our own IndexedDB-backed sync queue
    // (src/lib/sync/engine.ts). Letting Workbox also intercept and retry
    // those requests would create two competing retry mechanisms, so we
    // deliberately do not add runtime-caching rules for API routes here —
    // only static assets/pages get precached.
    runtimeCaching: [
      {
        // Keep the last successfully loaded app shell available for a full
        // browser refresh while offline. The client-side auth guard then
        // uses the persisted local worker state instead of redirecting.
        urlPattern: /^https?:\/\/[^/]+\/(?:|shift|sync|review\/.*)$/i,
        handler: "NetworkFirst",
        options: {
          cacheName: "app-pages",
          networkTimeoutSeconds: 3,
          cacheableResponse: { statuses: [0, 200] },
        },
      },
      {
        urlPattern: /^https?.*\.(?:png|jpg|jpeg|svg|gif|webp|ico)$/i,
        handler: "CacheFirst",
        options: {
          cacheName: "images",
          expiration: { maxEntries: 64, maxAgeSeconds: 30 * 24 * 60 * 60 },
        },
      },
    ],
  },
});

const nextConfig: NextConfig = {
  turbopack: {},
};

export default withPWA(nextConfig);
