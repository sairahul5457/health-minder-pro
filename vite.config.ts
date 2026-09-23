export default defineConfig(({ mode }) => ({
  base: "/health-minder-pro/",

  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },

  plugins: [
    react(),
    mode === "development" && componentTagger(),

    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.ico"],

      manifest: {
        name: "MedRemind - Smart Medication Reminder",
        short_name: "MedRemind",
        description:
          "Your smart medication companion with alerts, safety checks, and caregiver notifications.",
        theme_color: "#2a9d8f",
        background_color: "#f5faf9",
        display: "standalone",
        orientation: "portrait",

        start_url: "/health-minder-pro/",

        icons: [
          {
            src: "/health-minder-pro/pwa-192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "/health-minder-pro/pwa-512.png",
            sizes: "512x512",
            type: "image/png",
          },
          {
            src: "/health-minder-pro/pwa-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },

      workbox: {
        navigateFallbackDenylist: [/^\/~oauth/],
        globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2}"],
      },
    }),
  ].filter(Boolean),

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
