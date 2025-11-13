export default {
  expo: {
    name: "Dice Wala",
    slug: "ludogame2025",
    version: "1.0.1",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "automatic",
    splash: {
      image: "./assets/splash.png",
      resizeMode: "contain",
      backgroundColor: "#8B4513"
    },
    description: "Dice Wala - Premium Ludo game with multiplayer support",
    assetBundlePatterns: [
      "**/*"
    ],
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.dicewala.app"
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#1a4d8f"
      },
      package: "com.dicewala.app",
      permissions: [
        "INTERNET",
        "VIBRATE"
      ]
    },
    web: {
      favicon: "./assets/favicon.png",
      bundler: "metro"
    },
    // Completely disable updates
    updates: {
      enabled: false,
      checkAutomatically: "NEVER",
      fallbackToCacheTimeout: 0
    },
    // Use nativeModulesDir to exclude expo-updates
    plugins: [],
    owner: "ludohub",
    extra: {
      eas: {
        projectId: "7cd25b44-3808-420f-88f5-0aad9b10ec8e"
      }
    }
  }
};
