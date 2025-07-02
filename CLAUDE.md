# Fresh Expo - AI Context für Claude

## 🎯 Projekt-Übersicht

Fresh Expo ist eine moderne React Native Chat-App mit Expo SDK 50, die einen ChatGPT-ähnlichen AI-Chat bietet. Die App verwendet Supabase für Echtzeit-Nachrichten und ist für produktive Nutzung mit OTA-Updates vorbereitet.

## 🏗 Tech Stack

- **Framework:** React Native mit Expo SDK 50
- **Navigation:** React Navigation v6 mit Bottom Tabs
- **Chat UI:** react-native-gifted-chat v2.2.x
- **Backend:** Supabase (Realtime, Auth, Database)
- **AI Integration:** Vorbereitet für OpenAI API
- **Build/Deploy:** EAS Build & Update
- **Entwicklung:** Expo Dev Client

## 📁 Projekt-Struktur

```
fesh-expo/
├── App.js                 # Haupt-App mit Navigation Setup
├── screens/
│   ├── ChatScreen.js      # AI-Chat mit Supabase Integration
│   └── ProfileScreen.js   # Benutzerprofil
├── utils/
│   ├── supabase.js       # Supabase Client Konfiguration
│   ├── chatService.js    # Chat-Logik & AI-Integration
│   └── authService.js    # Authentifizierungs-Service
├── assets/
│   └── images/           # Avatare und App-Icon
├── supabase/
│   └── schema.sql        # Datenbank-Schema
└── eas.json             # EAS Build Konfiguration
```

## 🔑 Wichtige Befehle

- `npm run dev` - Startet Dev Client lokal
- `npm run tunnel` - Startet mit Tunnel für Remote-Testing
- `npm run update` - Veröffentlicht OTA-Update
- `npm run ios` - Startet iOS Simulator
- `eas build --platform ios` - Erstellt iOS Build

## 🚀 Deployment

- **EAS Project ID:** bfa821d0-ba49-4ea6-909e-a0417e05d2f8
- **Bundle ID:** com.freshexpo.app
- **Owner:** dadina
- **Updates:** Automatisch via EAS Update

## 💡 Entwicklungs-Hinweise

### Chat-Feature erweitern
- AI-Antworten sind in `chatService.js` -> `getAIResponse()`
- Für echte AI: OpenAI API Key in `.env` hinzufügen und Funktion anpassen

### Supabase Tabellen
- `messages` Tabelle mit Realtime-Updates
- RLS (Row Level Security) aktiviert
- Policies für öffentlichen Zugriff (später mit Auth absichern)

### Styling
- ChatGPT-ähnliches Design mit runden Bubbles
- Farben: #007AFF (Primary), #f0f0f0 (Bubble Background)
- Icons: Ionicons von @expo/vector-icons

### Testing
- Dev Client für physische Geräte
- Tunnel-Mode für Remote-Testing ohne WLAN
- Simulator für schnelle Entwicklung

## 🐛 Bekannte Probleme & Lösungen

1. **Build-Fehler:** Stelle sicher, dass `eas.json` korrekt konfiguriert ist
2. **Supabase-Verbindung:** Prüfe `.env` Datei und Netzwerkverbindung
3. **OTA-Updates:** Nur für JS-Änderungen, native Änderungen brauchen neuen Build

## 📈 Nächste Features

- [ ] Authentifizierung aktivieren
- [ ] OpenAI Integration
- [ ] Push-Benachrichtigungen
- [ ] Bild-Upload im Chat
- [ ] Voice Messages
- [ ] Android Build

## 🔐 Sicherheit

- Supabase Anon Key ist öffentlich (by design)
- RLS schützt Datenbank
- Auth-Service vorbereitet für User-Management
- Keine sensitiven Daten im Code

## ⚠️ **KRITISCHER WORKFLOW - Vor jedem Build/Deployment**

**IMMER diese Schritte in genau dieser Reihenfolge befolgen:**

```bash
# 1. Projekt validieren
npx expo doctor

# 2. Änderungen committen und pushen
git add .
git commit -m "Your commit message"
git push

# 3. Development Build erstellen
eas build --platform ios --profile development --clear-cache
# Warten bis Build fertig ist...

# 4. QR-Code scannen um Build zu installieren

# 5. Expo Dev Server starten
npx expo start

# 6. QR-Code scannen um zu connecten

# 7. Fertig! 🎉
```

### Häufige Probleme

- **OpenAI Package Warnung**: Bereits in package.json konfiguriert (ignoriert)
- **Push Notifications**: Erfordert existierende Apple Push Keys (Maximum erreicht)
- **Expo Doctor**: Immer vor Build ausführen um Dependency-Probleme zu fangen

## 📞 Support

- EAS Dashboard: https://expo.dev/accounts/dadina/projects/fresh-expo
- GitHub: https://github.com/dave12031975/Fresh-expo
- Supabase Dashboard: https://supabase.com/dashboard