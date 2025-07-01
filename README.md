# Fresh Expo App

Eine moderne React Native App mit Expo SDK 50, die einen ChatGPT-ähnlichen Chat, Navigation und OTA-Updates unterstützt.

## Features

- 💬 Moderner Chat mit react-native-gifted-chat
- 🤖 AI-Chat Integration mit Supabase
- 🎨 ChatGPT-ähnliches Design mit runden Chat-Bubbles
- 📱 Tab-Navigation (Chat & Profil)
- 🖼️ Lokale Assets für Avatare
- 💾 Echtzeit-Nachrichten mit Supabase
- 🔄 OTA-Updates via EAS
- 🔐 Authentifizierung vorbereitet

## Installation

```bash
# Dependencies installieren
npm install

# iOS Pods installieren (nur macOS)
cd ios && pod install && cd ..
```

## Entwicklung

```bash
# Expo Dev Server starten
npm start

# iOS Simulator
npm run ios

# Android Emulator
npm run android
```

## Konfiguration

### Supabase Setup

1. Die `.env` Datei ist bereits konfiguriert
2. Führe das SQL-Schema in Supabase aus:
   - Gehe zu deinem Supabase Dashboard
   - SQL Editor öffnen
   - Inhalt von `supabase/schema.sql` ausführen

Die App ist jetzt mit deiner Supabase-Instanz verbunden!

### EAS Build

```bash
# EAS CLI installieren (falls noch nicht geschehen)
npm install -g eas-cli

# Mit Expo Account einloggen
eas login

# Projekt konfigurieren
eas build:configure

# Build für iOS
eas build --platform ios

# Build für Android
eas build --platform android
```

### OTA Updates

```bash
# Update veröffentlichen
eas update --branch production --message "Update Beschreibung"
```

## Projektstruktur

```
fesh-expo/
├── App.js              # Hauptkomponente mit Navigation
├── screens/
│   ├── ChatScreen.js   # Chat-Bildschirm
│   └── ProfileScreen.js # Profil-Bildschirm
├── utils/
│   └── supabase.js     # Supabase Client Konfiguration
├── assets/
│   └── images/         # Lokale Bilder (Avatare, Logo)
├── eas.json            # EAS Build Konfiguration
└── app.json            # Expo App Konfiguration
```

## Verwendete Pakete

- **Expo SDK**: 50
- **React Native**: 0.73.x
- **React Navigation**: ^6.x
- **Gifted Chat**: ^2.2.x
- **Supabase JS**: Latest
- **EAS CLI**: >= 4.x

## Offline-Nutzung

Die App kann auch ohne WLAN getestet werden:
- Lokale Assets werden gebündelt
- Chat funktioniert im Demo-Modus
- Expo Dev Client unterstützt lokales Testen