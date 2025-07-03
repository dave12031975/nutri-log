# Google Authentication Setup für Fresh Expo

## 🎯 Übersicht

Diese Anleitung führt Sie durch die komplette Implementierung von Google Sign-In für Fresh Expo. Die Integration erfolgt analog zur bestehenden Apple Sign-In Implementierung.

## 📋 Voraussetzungen

- Expo CLI installiert
- EAS CLI installiert (`npm install -g @expo/eas-cli`)
- Google Cloud Console Zugang
- Bundle ID: `com.freshexpo.app`

## 🔧 Schritt 1: Pakete installieren

```bash
cd /Users/davedinapoli/fesh-expo/fesh-expo
npx expo install @react-native-google-signin/google-signin expo-auth-session expo-crypto
```

## 🌐 Schritt 2: Google Cloud Console Setup

### 2.1 Projekt erstellen
1. Öffnen Sie [Google Cloud Console](https://console.cloud.google.com/)
2. Erstellen Sie ein neues Projekt oder wählen Sie ein bestehendes
3. **Projektname**: "Fresh Expo"
4. Notieren Sie sich die **Project ID**

### 2.2 APIs aktivieren (OPTIONAL)
**Hinweis**: Für OAuth 2.0 mit Supabase müssen Sie normalerweise KEINE zusätzlichen APIs aktivieren. Die OAuth 2.0 Credentials reichen aus. Falls Sie später erweiterte Features benötigen, können Sie folgende APIs aktivieren:
- Google Identity Platform (für erweiterte Auth Features)
- Google+ API (veraltet, nicht empfohlen)

### 2.3 OAuth 2.0 Credentials erstellen

#### iOS Client ID
1. Gehen Sie zu **APIs & Services > Credentials**
2. Klicken Sie auf **+ Create Credentials > OAuth 2.0 Client ID**
3. Wählen Sie **iOS** als Application type
4. **Name**: "Fresh Expo iOS"
5. **Bundle ID**: `com.freshexpo.app`
6. **App Store ID**: (leer lassen)
7. Klicken Sie auf **Create**
8. **Notieren Sie sich die Client ID**

#### Web Client ID (für Supabase)
1. Erstellen Sie eine weitere OAuth 2.0 Client ID
2. Wählen Sie **Web application** als Application type
3. **Name**: "Fresh Expo Web (Supabase)"
4. **Authorized redirect URIs**: 
   ```
   https://kvvtfuwtmnnxasiwpqny.supabase.co/auth/v1/callback
   ```
5. Klicken Sie auf **Create**
6. **Notieren Sie sich Client ID und Client Secret**

### 2.4 Konfigurationsdateien herunterladen
1. Klicken Sie auf die iOS Client ID
2. Laden Sie **GoogleService-Info.plist** herunter
3. Kopieren Sie die Datei in das Root-Verzeichnis: `/Users/davedinapoli/fesh-expo/fesh-expo/GoogleService-Info.plist`

## 🔐 Schritt 3: Supabase Configuration

### 3.1 Google Provider aktivieren
1. Öffnen Sie [Supabase Dashboard](https://kvvtfuwtmnnxasiwpqny.supabase.co)
2. Navigieren Sie zu **Authentication > Providers**
3. Aktivieren Sie **Google**
4. Tragen Sie ein:
   - **Client ID**: Web Client ID aus Schritt 2.3
   - **Client Secret**: Web Client Secret aus Schritt 2.3
5. **Redirect URL** ist automatisch: `https://kvvtfuwtmnnxasiwpqny.supabase.co/auth/v1/callback`
6. Klicken Sie auf **Save**

## 📱 Schritt 4: Code Implementation

### 4.1 app.config.js erweitern

```javascript
export default {
  expo: {
    plugins: [
      "expo-web-browser",
      "expo-apple-authentication",
      "@react-native-google-signin/google-signin" // NEU HINZUFÜGEN
    ],
    ios: {
      googleServicesFile: "./GoogleService-Info.plist", // NEU HINZUFÜGEN
      bundleIdentifier: "com.freshexpo.app",
      buildNumber: "1.0.0"
    },
    // ... rest der Konfiguration
  }
};
```

### 4.2 utils/authService.js erweitern

```javascript
import { GoogleSignin } from '@react-native-google-signin/google-signin';

// Google konfigurieren
export const initGoogle = () => {
  GoogleSignin.configure({
    webClientId: 'IHRE_WEB_CLIENT_ID.apps.googleusercontent.com', // Aus Schritt 2.3
    iosClientId: 'IHRE_IOS_CLIENT_ID.apps.googleusercontent.com', // Aus Schritt 2.3
    offlineAccess: true,
  });
};

// Google Sign-In implementieren
export const signInWithGoogle = async () => {
  try {
    await GoogleSignin.hasPlayServices();
    const userInfo = await GoogleSignin.signIn();
    
    console.log('Google userInfo:', userInfo);
    
    // Mit Supabase verbinden
    const { data, error } = await supabase.auth.signInWithIdToken({
      provider: 'google',
      token: userInfo.idToken,
    });
    
    if (error) {
      console.error('Supabase Google sign-in error:', error);
      throw error;
    }
    
    console.log('Google sign-in successful:', data);
    return { success: true, data };
  } catch (error) {
    console.error('Google sign-in error:', error);
    return { success: false, error: error.message };
  }
};

// Sign-Out erweitern
export const signOut = async () => {
  try {
    // Google Sign-Out
    const isSignedIn = await GoogleSignin.isSignedIn();
    if (isSignedIn) {
      await GoogleSignin.signOut();
    }
    
    // Supabase Sign-Out
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    
    return { success: true };
  } catch (error) {
    console.error('Sign-out error:', error);
    return { success: false, error: error.message };
  }
};
```

### 4.3 screens/LoginScreen.js erweitern

```javascript
import { signInWithGoogle, initGoogle } from '../utils/authService';

// In useEffect:
useEffect(() => {
  initGoogle(); // Google konfigurieren
}, []);

// Google Sign-In Handler
const handleGoogleSignIn = async () => {
  setLoading(true);
  try {
    const result = await signInWithGoogle();
    if (result.success) {
      console.log('Google sign-in successful');
      // Navigation wird automatisch durch AuthContext gehandelt
    } else {
      Alert.alert('Google Sign-In Fehler', result.error);
    }
  } catch (error) {
    Alert.alert('Google Sign-In Fehler', error.message);
  } finally {
    setLoading(false);
  }
};

// Google Button hinzufügen (nach Apple Button):
<TouchableOpacity
  style={[styles.socialButton, styles.googleButton]}
  onPress={handleGoogleSignIn}
  disabled={loading}
>
  <Ionicons name="logo-google" size={24} color="#fff" />
  <Text style={styles.socialButtonText}>Mit Google anmelden</Text>
</TouchableOpacity>
```

### 4.4 Styling erweitern

```javascript
// In styles object:
googleButton: {
  backgroundColor: '#4285F4', // Google Blue
  marginBottom: 15,
},
```

## 🧪 Schritt 5: Testing

### 5.1 Pre-Build Checklist
- [ ] `GoogleService-Info.plist` im Root-Verzeichnis
- [ ] Web Client ID in `authService.js` eingetragen
- [ ] iOS Client ID in `authService.js` eingetragen
- [ ] Supabase Google Provider aktiviert
- [ ] `app.config.js` aktualisiert

### 5.2 Build Commands

```bash
# Vor dem Build: Expo Doctor ausführen
npx expo doctor

# iOS Development Build
eas build --platform ios --profile development --clear-cache

# Nach dem Build: QR-Code scannen und App installieren
```

### 5.3 Test Cases
1. **Google Sign-In Button** erscheint auf Login Screen
2. **Google OAuth Flow** öffnet sich korrekt
3. **Erfolgreiche Anmeldung** navigiert zu Chat Screen
4. **Provider-Erkennung** zeigt "Signed in with Google" im Profil
5. **Google Avatar** wird geladen (falls verfügbar)
6. **Navigation** zwischen Chat und Profil funktioniert
7. **Sign Out** funktioniert korrekt

## 🚨 Troubleshooting

### Häufige Probleme

**"Developer Error" beim Google Sign-In:**
- Prüfen Sie die Client IDs in `authService.js`
- Überprüfen Sie die Bundle ID in Google Console
- Stellen Sie sicher, dass `GoogleService-Info.plist` im Root liegt

**"Sign in cancelled":**
- Normale User-Aktion - kein Fehler

**"Network Error":**
- Prüfen Sie Internetverbindung
- Stellen Sie sicher, dass Google Services API aktiviert ist

**"Invalid Client":**
- Client ID stimmt nicht mit Bundle ID überein
- Überprüfen Sie die Konfiguration in Google Console

**Provider wird als "Email" angezeigt:**
- Prüfen Sie die Logs in der Console
- Überprüfen Sie die JWT Token Dekodierung
- Stellen Sie sicher, dass Supabase den Provider korrekt speichert

### Debug Commands

```bash
# Expo Logs anzeigen
npx expo logs --type=device

# EAS Build Logs
eas build:list
eas build:view [BUILD_ID]
```

## 📊 Verification

Nach der Implementierung sollten folgende Features funktionieren:

1. ✅ Google Sign-In Button im Login Screen
2. ✅ Google OAuth Flow
3. ✅ Automatische Navigation nach Login
4. ✅ Provider-Erkennung: "Signed in with Google"
5. ✅ Google Avatar im Profil (falls verfügbar)
6. ✅ Konsistente Navigation
7. ✅ Sign Out funktioniert

## 🔗 Wichtige URLs

- **Google Cloud Console**: https://console.cloud.google.com/
- **Supabase Dashboard**: https://kvvtfuwtmnnxasiwpqny.supabase.co
- **EAS Dashboard**: https://expo.dev/accounts/dadina/projects/fresh-expo

## 💡 Tipps

1. **Entwicklung**: Verwenden Sie `npm run tunnel` für Tests auf physischen Geräten
2. **Debugging**: Aktivieren Sie console.log für alle Auth-Schritte
3. **Testing**: Testen Sie mit verschiedenen Google-Accounts
4. **Backup**: Erstellen Sie vor großen Änderungen einen EAS Build

## 🎯 Nächste Schritte

Nach der Google Auth Implementation:
1. Testen Sie alle Auth-Methoden (Email, Apple, Google)
2. Überprüfen Sie die Provider-Erkennung
3. Erstellen Sie einen Production Build
4. Implementieren Sie OTA Updates für kleinere Fixes