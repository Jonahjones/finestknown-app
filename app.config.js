import 'dotenv/config';

// Disable update notifications
process.env.EXPO_NO_UPDATES = '1';
process.env.EXPO_NO_UPDATE_NOTIFICATIONS = '1';
process.env.EXPO_SKIP_UPDATE_CHECK = '1';

export default {
  expo: {
    name: "finestknown-app",
    slug: "finestknown-app",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    scheme: "finestknownapp",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.finestknown.app"
    },
    android: {
      adaptiveIcon: {
        backgroundColor: "#E6F4FE",
        foregroundImage: "./assets/images/android-icon-foreground.png",
        backgroundImage: "./assets/images/android-icon-background.png",
        monochromeImage: "./assets/images/android-icon-monochrome.png"
      },
      edgeToEdgeEnabled: true,
      predictiveBackGestureEnabled: false,
      package: "com.finestknown.app"
    },
    web: {
      output: "static",
      favicon: "./assets/images/favicon.png"
    },
    plugins: [
      "expo-router",
      [
        "expo-splash-screen",
        {
          image: "./assets/images/splash-icon.png",
          imageWidth: 200,
          resizeMode: "contain",
          backgroundColor: "#ffffff",
          dark: {
            backgroundColor: "#000000"
          }
        }
      ]
    ],
    experiments: {
      typedRoutes: true,
      reactCompiler: true
    },
    updates: {
      enabled: false,
      checkAutomatically: "NEVER",
      fallbackToCacheTimeout: 0,
      requestHeaders: {},
      url: null,
      codeSigningCertificate: null,
      codeSigningMetadata: null
    },
    developmentClient: {
      silentLaunch: true
    },
    notification: {
      icon: "./assets/images/icon.png",
      color: "#ffffff"
    },
    extra: {
      supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL || "https://oghzxwjqhsmbqfuovqju.supabase.co",
      supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9naHp4d2pxaHNtYnFmdW92cWp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY5MTc3MjAsImV4cCI6MjA1MjQ5MzcyMH0.1YHhWdXHWcx5Zb6qkxjBYTW_CJdvbzpI_DYoGmZYNgM",
    }
  }
};
