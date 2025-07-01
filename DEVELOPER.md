# Fresh Expo - Developer Documentation

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ und npm
- iOS Simulator (Xcode) für iOS-Entwicklung
- Android Studio für Android-Entwicklung
- Expo CLI (wird automatisch installiert)
- EAS CLI (`npm install -g eas-cli`)

### Installation

```bash
# Repository klonen
git clone https://github.com/dave12031975/Fresh-expo.git
cd Fresh-expo/fesh-expo

# Dependencies installieren
npm install

# Environment Variables einrichten
cp .env.example .env
# Bearbeite .env mit deinen Supabase Credentials
```

## 📱 Development

### Lokale Entwicklung

```bash
# Expo Dev Server starten
npm start

# Spezifische Plattform
npm run ios      # iOS Simulator
npm run android  # Android Emulator
npm run web      # Web Browser
```

### Dev Client Entwicklung

```bash
# Mit Expo Dev Client
npm run dev

# Mit Tunnel für Remote-Testing
npm run tunnel
```

**Tunnel-Modus** ermöglicht es, die App auf physischen Geräten zu testen, auch ohne lokales WLAN:
- QR-Code wird in der Console angezeigt
- Funktioniert über das Internet
- Ideal für Tests unterwegs

## 🏗 Tech Stack Details

### Frontend Architecture

```
React Native 0.73.x
├── Expo SDK 50 (Managed Workflow)
├── React Navigation v6
│   └── Bottom Tab Navigator
├── React Native Gifted Chat
└── Expo Vector Icons
```

### Backend Services

```
Supabase
├── PostgreSQL Database
├── Realtime Subscriptions
├── Authentication (vorbereitet)
└── Row Level Security (RLS)
```

### Build & Deployment

```
EAS (Expo Application Services)
├── EAS Build (Native Builds)
├── EAS Update (OTA Updates)
└── EAS Submit (Store Uploads)
```

## 🛠 Commands Reference

### Development Commands

| Command | Beschreibung |
|---------|--------------|
| `npm start` | Startet Expo Dev Server |
| `npm run dev` | Startet mit Dev Client |
| `npm run tunnel` | Startet mit Tunnel für Remote Access |
| `npm run ios` | Öffnet im iOS Simulator |
| `npm run android` | Öffnet im Android Emulator |
| `npm run web` | Öffnet im Web Browser |

### Build Commands

| Command | Beschreibung |
|---------|--------------|
| `eas build --platform ios` | iOS Build erstellen |
| `eas build --platform android` | Android Build erstellen |
| `eas build --platform all` | Beide Plattformen bauen |
| `eas build:list` | Build-Historie anzeigen |

### Update Commands

| Command | Beschreibung |
|---------|--------------|
| `npm run update` | OTA Update veröffentlichen |
| `eas update --branch production` | Production Update |
| `eas update --branch preview` | Preview Update |
| `eas update:list` | Update-Historie anzeigen |

## 📂 Project Structure

```
fesh-expo/
├── App.js                    # Root Component mit Navigation
├── screens/                  # Screen Components
│   ├── ChatScreen.js        # Haupt-Chat Interface
│   └── ProfileScreen.js     # User Profile Screen
├── utils/                   # Utility Functions
│   ├── supabase.js         # Supabase Client Setup
│   ├── chatService.js      # Chat Business Logic
│   └── authService.js      # Auth Logic (prepared)
├── assets/                  # Static Assets
│   ├── images/             # Bilder und Icons
│   ├── icon.png           # App Icon
│   └── splash.png         # Splash Screen
├── supabase/               # Database Setup
│   └── schema.sql         # PostgreSQL Schema
├── .env                    # Environment Variables (git-ignored)
├── app.json               # Expo Configuration
├── eas.json               # EAS Build Configuration
└── package.json           # Dependencies
```

## 🔧 Configuration

### app.json

Hauptkonfiguration für Expo:
- App Name, Version, Bundle IDs
- Icons und Splash Screens
- Platform-spezifische Settings
- EAS Project ID

### eas.json

Build-Profile für verschiedene Umgebungen:
- `development`: Dev Client mit Debugging
- `preview`: Internal Testing
- `production`: Store-ready Builds

### Environment Variables

```bash
# Supabase
EXPO_PUBLIC_SUPABASE_URL=your-supabase-url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# OpenAI (für zukünftige AI Features)
OPENAI_API_KEY=your-openai-key
```

## 🎨 UI/UX Guidelines

### Design System

- **Primary Color:** #007AFF (iOS Blue)
- **Chat Bubbles:** 
  - User: #007AFF (Blue)
  - AI: #f0f0f0 (Light Gray)
- **Border Radius:** 18px für Chat Bubbles
- **Font Sizes:** 16px für Chat-Text

### Components

**ChatScreen Features:**
- Echtzeit-Nachrichten mit Supabase
- Typing Indicator während AI antwortet
- Smooth Scrolling und Keyboard Handling
- Avatar-Bilder für User und AI

**ProfileScreen Features:**
- User Avatar und Informationen
- Menü-Items mit Icons
- Logout-Funktion (vorbereitet)

## 🔄 State Management

Aktuell wird lokaler Component State verwendet:
- `useState` für UI State
- Supabase Realtime für Chat Sync
- AsyncStorage für Persistenz

Für größere Features empfohlen:
- Context API für globalen State
- Zustand oder Redux für komplexe State

## 🐛 Debugging

### Expo Tools

```bash
# Logs anzeigen
npx expo start --clear

# Metro Cache löschen
npx expo start -c

# Development Build Logs
eas build:view [build-id]
```

### Common Issues

1. **Metro Bundler Fehler**
   ```bash
   rm -rf node_modules
   npm install
   npx expo start -c
   ```

2. **Build Fehler**
   - Prüfe `eas.json` Konfiguration
   - Stelle sicher, dass alle Assets existieren
   - Überprüfe Bundle IDs

3. **Supabase Connection**
   - Verifiziere `.env` Variables
   - Prüfe Supabase Dashboard
   - Teste Netzwerkverbindung

## 🚀 Deployment

### iOS App Store

1. Production Build erstellen:
   ```bash
   eas build --platform ios --profile production
   ```

2. Zu App Store Connect hochladen:
   ```bash
   eas submit --platform ios
   ```

### Android Play Store

1. Production Build erstellen:
   ```bash
   eas build --platform android --profile production
   ```

2. Zu Play Console hochladen:
   ```bash
   eas submit --platform android
   ```

### OTA Updates

Nach dem ersten Release können JS-Updates OTA gepusht werden:

```bash
# Production Update
eas update --branch production --message "Bug fixes"

# Preview Update für Tester
eas update --branch preview --message "New feature test"
```

## 🔐 Security

### Best Practices

1. **Environment Variables**
   - Niemals `.env` committen
   - Verwende `EXPO_PUBLIC_` Prefix für Client-seitige Vars

2. **Supabase RLS**
   - Aktiviere Row Level Security
   - Schreibe Policies für Datenzugriff
   - Teste Permissions gründlich

3. **API Keys**
   - Rotiere Keys regelmäßig
   - Verwende unterschiedliche Keys für Dev/Prod
   - Implementiere Rate Limiting

## 📚 Additional Resources

- [Expo Documentation](https://docs.expo.dev)
- [React Navigation Docs](https://reactnavigation.org)
- [Supabase Docs](https://supabase.com/docs)
- [EAS Documentation](https://docs.expo.dev/eas)
- [Gifted Chat Docs](https://github.com/FaridSafi/react-native-gifted-chat)

## 🤝 Contributing

1. Fork das Repository
2. Erstelle einen Feature Branch
3. Committe deine Änderungen
4. Push zum Branch
5. Öffne einen Pull Request

### Code Style

- Verwende 2 Spaces für Indentation
- Semicolons am Zeilenende
- Single Quotes für Strings
- Funktionale Components bevorzugen