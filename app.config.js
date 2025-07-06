export default {
  expo: {
    name: "Nutri-Log",
    slug: "nutri-log",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    splash: {
      image: "./assets/splash.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff"
    },
    assetBundlePatterns: [
      "**/*"
    ],
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.freshexpo.nutri-log",
      usesAppleSignIn: true,
      googleServicesFile: "./GoogleService-Info.plist",
      infoPlist: {
        ITSAppUsesNonExemptEncryption: false,
        CFBundleURLTypes: [
          {
            CFBundleURLSchemes: [
              "com.googleusercontent.apps.19781117641-ds4qspmrbtovet444882f89h6jshf1ie"
            ]
          }
        ]
      }
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#ffffff"
      },
      package: "com.freshexpo.nutri-log"
    },
    web: {
      favicon: "./assets/favicon.png"
    },
    runtimeVersion: "1.0.0",
    sdkVersion: "53.0.0",
    extra: {
      eas: {
        projectId: "bfa821d0-ba49-4ea6-909e-a0417e05d2f8"
      }
    },
    owner: "dadina",
    updates: {
      url: "https://u.expo.dev/bfa821d0-ba49-4ea6-909e-a0417e05d2f8"
    },
    plugins: [
      "expo-web-browser",
      "expo-apple-authentication",
      "@react-native-google-signin/google-signin"
    ],
    scheme: "nutri-log"
  }
};