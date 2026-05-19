import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.gandabot.app",
  appName: "GandaBot",
  webDir: "out",
  // For production: point to the live URL so the native shell loads the web app
  server: {
    url: process.env.CAPACITOR_SERVER_URL || "https://www.gandabot.com",
    cleartext: false,
    androidScheme: "https",
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: "#0C1F17",
      androidSplashResourceName: "splash",
      androidScaleType: "CENTER_CROP",
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true,
    },
    StatusBar: {
      style: "Dark",
      backgroundColor: "#0C1F17",
    },
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"],
    },
    Keyboard: {
      resize: "body",
      style: "dark",
    },
  },
  ios: {
    contentInset: "always",
    scheme: "gandabot",
    backgroundColor: "#0C1F17",
  },
  android: {
    buildOptions: {
      keystorePath: "android.keystore",
      keystoreAlias: "gandabot",
    },
    backgroundColor: "#0C1F17",
  },
};

export default config;
