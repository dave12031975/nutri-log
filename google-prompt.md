# Google Sign-In Integration für Fresh Expo

## Aufgabe: Google Authentication implementieren

Implementiere die vollständige Google Sign-In Integration für die Fresh Expo React Native App, analog zur bestehenden Apple Sign-In Implementierung.

## Aktuelle Situation

- ✅ Apple Sign-In ist vollständig implementiert und funktioniert
- ✅ Email/Password Authentication funktioniert
- ✅ Provider-Erkennung über JWT/Session funktioniert perfekt
- ❌ Google Sign-In fehlt komplett

## Technische Anforderungen

### 1. Expo/React Native Integration

**Pakete installieren:**
```bash
npx expo install @react-native-google-signin/google-signin
npx expo install expo-auth-session expo-crypto
```

**app.config.js erweitern:**
```javascript
export default {
  expo: {
    android: {
      googleServicesFile: "./google-services.json", // ← HINZUFÜGEN
    },
    ios: {
      googleServicesFile: "./GoogleService-Info.plist", // ← HINZUFÜGEN
      bundleIdentifier: "com.freshexpo.app",
    },
    plugins: [
      "expo-web-browser",
      "expo-apple-authentication",
      "@react-native-google-signin/google-signin" // ← HINZUFÜGEN
    ],
  }
};
```

### 2. Google Cloud Console Setup

#### Schritt 1: Projekt erstellen/auswählen
1. **Öffne Google Cloud Console** (https://console.cloud.google.com/)
2. **Erstelle ein neues Projekt** oder wähle existierendes
3. **Projekt Name**: "Fresh Expo"
4. **Notiere dir die Project ID**

#### Schritt 2: Google Sign-In API aktivieren
1. **Gehe zu APIs & Services > Library**
2. **Suche "Google Sign-In API"**
3. **Aktiviere die API**

#### Schritt 3: OAuth 2.0 Client IDs erstellen
1. **Gehe zu APIs & Services > Credentials**
2. **Klicke "Create Credentials" > "OAuth 2.0 Client ID"**

**Für iOS:**
- **Application type**: iOS
- **Name**: "Fresh Expo iOS"
- **Bundle ID**: `com.freshexpo.app`
- **App Store ID**: (falls vorhanden, sonst leer lassen)

**Für Android:**
- **Application type**: Android
- **Name**: "Fresh Expo Android"
- **Package name**: `com.freshexpo.app`
- **SHA-1 certificate fingerprint**: 
  ```bash
  # Development fingerprint von Expo
  keytool -keystore ~/.android/debug.keystore -list -v
  # Passwort: android
  ```

**Für Web (Supabase):**
- **Application type**: Web application
- **Name**: "Fresh Expo Web (Supabase)"
- **Authorized redirect URIs**: 
  ```
  https://kvvtfuwtmnnxasiwpqny.supabase.co/auth/v1/callback
  ```

#### Schritt 4: Konfigurationsdateien herunterladen
1. **iOS**: Download `GoogleService-Info.plist` → in Expo Root kopieren
2. **Android**: Download `google-services.json` → in Expo Root kopieren

### 3. Supabase Google Provider Setup

1. **Supabase Dashboard** → Authentication → Providers
2. **Google aktivieren:**
   ```
   Client ID: [Web Client ID aus Google Console]
   Client Secret: [Web Client Secret aus Google Console]
   ```
3. **Redirect URL ist automatisch:** 
   ```
   https://kvvtfuwtmnnxasiwpqny.supabase.co/auth/v1/callback
   ```

### 4. Code Implementation

#### AuthService erweitern (`utils/authService.js`)

```javascript
// Google Sign-In Funktion hinzufügen
import { GoogleSignin } from '@react-native-google-signin/google-signin';

// Google konfigurieren (in initGoogle Funktion)
const initGoogle = () => {
  GoogleSignin.configure({
    webClientId: 'DEINE_WEB_CLIENT_ID.apps.googleusercontent.com',
    iosClientId: 'DEINE_IOS_CLIENT_ID.apps.googleusercontent.com', // optional
    offlineAccess: true,
  });
};

// Google Sign-In implementieren
const signInWithGoogle = async () => {
  try {
    await GoogleSignin.hasPlayServices();
    const userInfo = await GoogleSignin.signIn();
    
    // Mit Supabase verbinden
    const { data, error } = await supabase.auth.signInWithIdToken({
      provider: 'google',
      token: userInfo.idToken,
    });
    
    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};
```

#### LoginScreen erweitern (`screens/LoginScreen.js`)

```javascript
// Google Sign-In Button hinzufügen
<TouchableOpacity
  style={[styles.socialButton, styles.googleButton]}
  onPress={handleGoogleSignIn}
>
  <Ionicons name="logo-google" size={24} color="#fff" />
  <Text style={styles.socialButtonText}>Continue with Google</Text>
</TouchableOpacity>

// Handler implementieren
const handleGoogleSignIn = async () => {
  setLoading(true);
  try {
    const result = await authService.signInWithGoogle();
    if (result.success) {
      // Navigation wird automatisch durch AuthContext gehandelt
    } else {
      Alert.alert('Google Sign-In Error', result.error);
    }
  } catch (error) {
    Alert.alert('Google Sign-In Error', error.message);
  } finally {
    setLoading(false);
  }
};
```

#### Provider-Erkennung erweitern

Die bestehende JWT-basierte Provider-Erkennung in `ProfileScreen.js` sollte automatisch funktionieren:
```javascript
// Bereits implementiert - sollte "google" erkennen
const getSessionProvider = (session) => {
  // OAuth mit app_metadata.provider = "google"
  if (authMethod === 'oauth') {
    return session?.user?.app_metadata?.provider || 'email';
  }
};

const getProviderIcon = (provider) => {
  switch (provider) {
    case 'google': return 'logo-google'; // ← Bereits vorhanden
    case 'apple': return 'logo-apple';
    // ...
  }
};
```

### 5. Styling

#### Google Button Styles hinzufügen
```javascript
googleButton: {
  backgroundColor: '#4285F4', // Google Blue
},
```

### 6. Testing & Verification

#### Pre-Build Checklist
- [ ] `google-services.json` in Root-Verzeichnis
- [ ] `GoogleService-Info.plist` in Root-Verzeichnis  
- [ ] Web Client ID in `authService.js` konfiguriert
- [ ] Supabase Google Provider aktiviert
- [ ] `app.config.js` aktualisiert

#### Test Cases
1. **Google Sign-In Button** erscheint auf Login Screen
2. **Google OAuth Flow** öffnet korrekt
3. **Erfolgreiche Anmeldung** navigiert zu Chat
4. **Provider-Erkennung** zeigt "Signed in with Google"
5. **Google Avatar** wird geladen (falls verfügbar)
6. **Bidirektionale Navigation** Chat ↔ Profile funktioniert
7. **Sign Out** funktioniert korrekt

### 7. Build & Deployment

#### Development Build
```bash
# Vor Build: Prüfen dass Config-Dateien vorhanden sind
ls GoogleService-Info.plist google-services.json

# iOS Development Build
eas build --platform ios --profile development --clear-cache

# Android Development Build (später)
eas build --platform android --profile development --clear-cache
```

#### Troubleshooting

**Häufige Probleme:**
1. **"Developer Error"**: Falsche Client ID oder Bundle ID
2. **"Sign in cancelled"**: Normale User-Aktion
3. **"Network Error"**: Google Services nicht erreichbar
4. **"Invalid Client"**: Client ID stimmt nicht mit Bundle ID überein

**Debug Logs aktivieren:**
```javascript
// In authService.js für debugging
console.log('Google userInfo:', userInfo);
console.log('Supabase response:', data);
```

## Deliverables

1. **Vollständig funktionierendes Google Sign-In**
2. **Detaillierte Setup-Dokumentation** (wie bei Apple)
3. **Provider-Erkennung** funktioniert für alle drei Methoden (Email, Apple, Google)
4. **Konsistente UI/UX** mit bestehenden Login-Optionen
5. **Fehlerbehandlung** und User-Feedback
6. **Testing-Protokoll** mit allen Test Cases

## Zeitschätzung

- **Google Console Setup**: 30-45 Minuten
- **Code Implementation**: 60-90 Minuten  
- **Testing & Debugging**: 30-60 Minuten
- **Dokumentation**: 45-60 Minuten

**Total**: 2.5-4 Stunden

## Priorität: HOCH

Google Sign-In ist ein Standard-Feature für moderne Apps und vervollständigt das OAuth-Portfolio (Email + Apple + Google = alle wichtigen Anmeldemethoden abgedeckt).