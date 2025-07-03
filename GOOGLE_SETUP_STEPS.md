# Google OAuth Setup für Fresh Expo - Schnellanleitung

**Projekt ID**: logg-463708

## 1. OAuth 2.0 Credentials erstellen

### Schritt 1: Navigieren Sie zu Credentials
1. Öffnen Sie [Google Cloud Console](https://console.cloud.google.com/)
2. Wählen Sie Ihr Projekt "logg-463708"
3. Gehen Sie zu **APIs & Services > Credentials**

### Schritt 2: OAuth 2.0 Client IDs erstellen

#### A) Web Client (für Supabase) - ZUERST ERSTELLEN
1. Klicken Sie auf **+ CREATE CREDENTIALS > OAuth client ID**
2. **Application type**: Web application
3. **Name**: "Fresh Expo Supabase"
4. **Authorized redirect URIs** hinzufügen:
   ```
   https://kvvtfuwtmnnxasiwpqny.supabase.co/auth/v1/callback
   ```
5. Klicken Sie auf **CREATE**
6. **WICHTIG**: Notieren Sie sich:
   - Client ID: `[WEB_CLIENT_ID].apps.googleusercontent.com`
   - Client Secret: `[WEB_CLIENT_SECRET]`

#### B) iOS Client
1. Klicken Sie erneut auf **+ CREATE CREDENTIALS > OAuth client ID**
2. **Application type**: iOS
3. **Name**: "Fresh Expo iOS"
4. **Bundle ID**: `com.freshexpo.app`
5. Klicken Sie auf **CREATE**
6. **WICHTIG**: Notieren Sie sich:
   - iOS Client ID: `[IOS_CLIENT_ID].apps.googleusercontent.com`

### Schritt 3: GoogleService-Info.plist herunterladen
1. Klicken Sie auf den iOS Client
2. Laden Sie die **GoogleService-Info.plist** herunter
3. Ersetzen Sie die Datei in: `/Users/davedinapoli/fesh-expo/fesh-expo/GoogleService-Info.plist`

## 2. Supabase konfigurieren

1. Öffnen Sie [Supabase Dashboard](https://kvvtfuwtmnnxasiwpqny.supabase.co)
2. Gehen Sie zu **Authentication > Providers**
3. Aktivieren Sie **Google**
4. Tragen Sie ein:
   - **Client ID**: Der Web Client ID aus Schritt A
   - **Client Secret**: Der Web Client Secret aus Schritt A
5. **Save**

## 3. Code aktualisieren

### utils/googleAuth.js
```javascript
// Zeile 7-8 ersetzen mit Ihren echten IDs:
export const initGoogle = () => {
  GoogleSignin.configure({
    webClientId: '[WEB_CLIENT_ID].apps.googleusercontent.com', // Web Client ID aus Schritt A
    iosClientId: '[IOS_CLIENT_ID].apps.googleusercontent.com', // iOS Client ID aus Schritt B
    offlineAccess: true,
    scopes: ['profile', 'email'],
  });
};
```

## 4. Build erstellen

```bash
# Expo Doctor prüfen
npx expo doctor

# iOS Development Build
eas build --platform ios --profile development --clear-cache
```

## 5. Testen

Nach dem Build:
1. Installieren Sie die App über den QR-Code
2. Starten Sie den Dev Server: `npx expo start`
3. Testen Sie Google Sign-In

## Troubleshooting

**"Developer Error"**:
- Prüfen Sie ob die Bundle ID korrekt ist: `com.freshexpo.app`
- Stellen Sie sicher, dass die Web Client ID in googleAuth.js eingetragen ist
- Überprüfen Sie, ob GoogleService-Info.plist korrekt ist

**"Invalid Client"**:
- Die Web Client ID muss in googleAuth.js verwendet werden (NICHT die iOS Client ID!)
- Supabase braucht die Web Client Credentials

## Wichtige Hinweise

1. **Web Client ID** wird für die Google Sign-In Library verwendet
2. **iOS Client ID** wird nur für die iOS-spezifische Konfiguration benötigt
3. **Supabase** benötigt die Web Client Credentials (ID + Secret)
4. Die `GoogleService-Info.plist` muss die korrekten Werte enthalten