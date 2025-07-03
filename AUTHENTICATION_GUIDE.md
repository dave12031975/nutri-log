# Fresh Expo Authentication Setup Guide

## Übersicht

Diese Anleitung führt Sie Schritt für Schritt durch die Einrichtung der kompletten Authentifizierung für Fresh Expo mit Supabase. Wir behandeln Email/Passwort, Apple Sign-In und Google Sign-In.

## 🚨 Wichtiger Fix für Email-Verifizierung

**Das ursprüngliche Problem wurde behoben!** Der Fehler lag in der fehlerhaften Datenverarbeitung in `contexts/AuthContext.js`. Die Supabase-Antwort wurde nicht korrekt destructured.

---

## 1. Email/Passwort Authentifizierung

### ✅ Status: **FUNKTIONSFÄHIG**

Die Email/Passwort-Authentifizierung ist vollständig eingerichtet und funktioniert.

#### Schritt 1: Supabase Dashboard Konfiguration

1. **Öffne dein Supabase Dashboard**: https://kvvtfuwtmnnxasiwpqny.supabase.co
2. **Gehe zu Authentication > Settings**
3. **Konfiguriere Email-Einstellungen**:
   ```
   ✅ Enable email confirmations: AKTIV
   ✅ Enable secure email change: AKTIV  
   ✅ Enable email change confirmations: AKTIV
   ```

#### Schritt 2: URL-Konfiguration

1. **Site URL**: `exp://localhost:8081` (für Development)
2. **Redirect URLs** hinzufügen:
   ```
   exp://localhost:8081
   com.freshexpo.app://
   https://auth.expo.io/@dadina/fresh-expo
   ```

#### Schritt 3: SMTP-Konfiguration (Optional aber empfohlen)

Für Produktions-Email-Versand:
```
SMTP Host: smtp.gmail.com (oder dein Provider)
SMTP Port: 587
SMTP User: deine-email@gmail.com
SMTP Password: dein-app-passwort
```

#### Schritt 4: Testen

1. **Registrierung testen**:
   ```bash
   npm run dev
   ```
2. **Neue Email eingeben** → "Create Account" klicken
3. **Email prüfen** → Bestätigungslink klicken
4. **Login testen** mit bestätigter Email

### Troubleshooting Email Auth

**Problem**: "Keine Email erhalten"
- **Lösung**: Spam-Ordner prüfen, SMTP konfigurieren

**Problem**: "Invalid login credentials"  
- **Lösung**: Email muss bestätigt sein

**Problem**: "User already registered"
- **Lösung**: Andere Email verwenden oder Login versuchen

---

## 2. Apple Sign-In Setup

### ⏳ Status: **BEREIT ZUR KONFIGURATION**

#### Voraussetzungen

- ✅ Apple Developer Account ($99/Jahr)
- ✅ macOS mit Xcode installiert
- ✅ Expo Development Build (nicht Expo Go!)

#### Schritt 1: Expo-Pakete installieren

```bash
npx expo install expo-apple-authentication
```

#### Schritt 2: App-Konfiguration

**app.config.js** aktualisieren:
```javascript
export default {
  expo: {
    ios: {
      usesAppleSignIn: true, // ← HINZUFÜGEN
      bundleIdentifier: "com.freshexpo.app",
    },
    plugins: [
      "expo-web-browser",
      "expo-apple-authentication" // ← HINZUFÜGEN
    ],
  }
};
```

#### Schritt 3: Apple Developer Console

1. **Öffne Apple Developer Console**
2. **Gehe zu Certificates, Identifiers & Profiles > Identifiers**
3. **Wähle deine App ID**: `com.freshexpo.app`
4. **Aktiviere "Sign In with Apple"**
5. **Wähle "Enable as a primary App ID"**

#### Schritt 4: Supabase Apple Provider Setup

1. **Supabase Dashboard** → Authentication → Providers
2. **Apple aktivieren**:
   ```
   Services ID: com.freshexpo.app
   Team ID: [Dein Apple Team ID]
   Key ID: [Dein Apple Key ID]
   Secret Key: [Private Key von Apple]
   ```

#### Schritt 5: Code-Implementation

**utils/appleAuth.js** erstellen:
```javascript
import * as AppleAuthentication from 'expo-apple-authentication';
import { supabase } from './supabase';

export const signInWithApple = async () => {
  try {
    const credential = await AppleAuthentication.signInAsync({
      requestedScopes: [
        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        AppleAuthentication.AppleAuthenticationScope.EMAIL,
      ],
    });
    
    const { data, error } = await supabase.auth.signInWithIdToken({
      provider: 'apple',
      token: credential.identityToken,
    });
    
    if (error) throw error;
    return { user: data.user, session: data.session };
  } catch (error) {
    if (error.code === 'ERR_REQUEST_CANCELED') {
      throw new Error('Apple Sign-In wurde abgebrochen');
    }
    throw error;
  }
};
```

#### Schritt 6: UI Integration

**SignupScreen.js** aktualisieren:
```javascript
import { signInWithApple } from '../utils/appleAuth';

const handleSocialSignup = async (provider) => {
  if (provider === 'apple') {
    try {
      const { user, session } = await signInWithApple();
      console.log('Apple signup successful:', { user: user?.email });
    } catch (error) {
      console.error('Apple signup error:', error);
      Alert.alert('Apple Sign-In Fehler', error.message);
    }
  }
};
```

#### Schritt 7: Development Build erstellen

```bash
# Prebuild für native Code
npx expo prebuild

# Development Build erstellen
eas build --platform ios --profile development
```

### Apple Sign-In Troubleshooting

**Problem**: "Apple Authentication ist nicht verfügbar"
- **Lösung**: Nur auf iOS-Geräten verfügbar, nicht im Simulator

**Problem**: "Invalid client"
- **Lösung**: Bundle ID in Apple Developer Console prüfen

---

## 3. Google Sign-In Setup

### ⏳ Status: **BEREIT ZUR KONFIGURATION**

#### Voraussetzungen

- ✅ Google Cloud Console Account
- ✅ Expo Development Build (nicht Expo Go!)
- ✅ Firebase-Projekt (optional aber empfohlen)

#### Schritt 1: Pakete installieren

```bash
npx expo install @react-native-google-signin/google-signin
```

#### Schritt 2: Google Cloud Console Setup

1. **Google Cloud Console** öffnen: https://console.cloud.google.com
2. **Projekt erstellen** oder vorhandenes wählen
3. **APIs & Services > Credentials**
4. **OAuth 2.0 Client IDs erstellen**:

   **Web Client ID**:
   ```
   Application type: Web application
   Name: Fresh Expo Web
   Authorized redirect URIs: 
   https://kvvtfuwtmnnxasiwpqny.supabase.co/auth/v1/callback
   ```

   **iOS Client ID**:
   ```
   Application type: iOS
   Name: Fresh Expo iOS
   Bundle ID: com.freshexpo.app
   ```

   **Android Client ID**:
   ```
   Application type: Android
   Name: Fresh Expo Android
   Package name: com.freshexpo.app
   SHA-1 certificate fingerprint: [Dein SHA-1]
   ```

#### Schritt 3: SHA-1 Fingerprint erhalten

```bash
# Development Fingerprint
eas credentials

# Oder manuell
keytool -keystore ~/.android/debug.keystore -list -v
```

#### Schritt 4: App-Konfiguration

**app.config.js** aktualisieren:
```javascript
export default {
  expo: {
    plugins: [
      "expo-web-browser",
      [
        "@react-native-google-signin/google-signin",
        {
          iosUrlScheme: "com.googleusercontent.apps.YOUR_REVERSED_CLIENT_ID"
        }
      ]
    ],
  }
};
```

#### Schritt 5: Supabase Google Provider Setup

1. **Supabase Dashboard** → Authentication → Providers
2. **Google aktivieren**:
   ```
   Client ID: [Deine Google Web Client ID]
   Client Secret: [Dein Google Client Secret]
   ```

#### Schritt 6: Code-Implementation

**utils/googleAuth.js** erstellen:
```javascript
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { supabase } from './supabase';

// Konfiguration
GoogleSignin.configure({
  webClientId: 'DEINE_WEB_CLIENT_ID.apps.googleusercontent.com',
  iosClientId: 'DEINE_IOS_CLIENT_ID.apps.googleusercontent.com',
});

export const signInWithGoogle = async () => {
  try {
    await GoogleSignin.hasPlayServices();
    const userInfo = await GoogleSignin.signIn();
    
    if (userInfo.data.idToken) {
      const { data, error } = await supabase.auth.signInWithIdToken({
        provider: 'google',
        token: userInfo.data.idToken,
      });
      
      if (error) throw error;
      return { user: data.user, session: data.session };
    } else {
      throw new Error('Kein ID-Token erhalten!');
    }
  } catch (error) {
    throw error;
  }
};
```

#### Schritt 7: UI Integration

**SignupScreen.js** aktualisieren:
```javascript
import { signInWithGoogle } from '../utils/googleAuth';

const handleSocialSignup = async (provider) => {
  if (provider === 'google') {
    try {
      const { user, session } = await signInWithGoogle();
      console.log('Google signup successful:', { user: user?.email });
    } catch (error) {
      console.error('Google signup error:', error);
      Alert.alert('Google Sign-In Fehler', error.message);
    }
  }
};
```

#### Schritt 8: Development Build erstellen

```bash
# Prebuild für native Code
npx expo prebuild

# Development Build erstellen  
eas build --platform all --profile development
```

### Google Sign-In Troubleshooting

**Problem**: "DEVELOPER_ERROR"
- **Lösung**: SHA-1 Fingerprint in Google Console prüfen

**Problem**: "SIGN_IN_CANCELLED"
- **Lösung**: User hat Anmeldung abgebrochen (normal)

**Problem**: "PLAY_SERVICES_NOT_AVAILABLE"
- **Lösung**: Google Play Services auf Android-Gerät aktualisieren

---

## 4. Deployment-Checkliste

### Vor dem Production Build

- [ ] **Email Auth**: SMTP konfiguriert
- [ ] **Apple Auth**: Apple Developer Account aktiv
- [ ] **Google Auth**: Production SHA-1 Fingerprints hinzugefügt
- [ ] **Supabase**: Redirect URLs für Production eingestellt
- [ ] **Environment Variables**: Production-Werte gesetzt

### Production URLs

```
Site URL: https://your-production-domain.com
Redirect URLs:
- https://your-production-domain.com/auth/callback
- com.freshexpo.app://auth/callback
```

### Build Commands

```bash
# Production Build
eas build --platform all --profile production

# OTA Update (nur JS-Änderungen)
eas update --branch production
```

---

## 5. Testing Checklist

### Email/Passwort ✅
- [ ] Registrierung funktioniert
- [ ] Email-Bestätigung erhalten
- [ ] Login nach Bestätigung möglich
- [ ] Passwort-Reset funktioniert

### Apple Sign-In ⏳
- [ ] Apple-Button erscheint (nur iOS)
- [ ] Apple-Anmeldung funktioniert
- [ ] User-Daten werden korrekt gespeichert
- [ ] Mehrfache Anmeldung funktioniert

### Google Sign-In ⏳
- [ ] Google-Button erscheint
- [ ] Google-Anmeldung funktioniert (iOS & Android)
- [ ] User-Daten werden korrekt gespeichert
- [ ] Mehrfache Anmeldung funktioniert

---

## 6. Support & Debugging

### Logs überprüfen

```bash
# Expo Logs
npx expo start --dev-client

# Supabase Auth Logs
# Supabase Dashboard → Auth → Logs
```

### Häufige Fehlerquellen

1. **Development vs Production**: URLs nicht korrekt konfiguriert
2. **Native Module**: Expo Go statt Development Build verwendet
3. **Certificates**: Abgelaufene oder falsche Zertifikate
4. **Environment**: Falsche API-Keys oder URLs

### Weitere Hilfe

- **Supabase Discord**: https://discord.supabase.com
- **Expo Discord**: https://discord.gg/4gtbPAdpaE
- **Dokumentation**: https://docs.expo.dev/develop/authentication/

---

**Status Update**: Die Email/Passwort-Authentifizierung ist vollständig funktionsfähig. Apple und Google Sign-In sind vorbereitet und bereit zur Konfiguration.