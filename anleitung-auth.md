# Supabase Authentication Setup

## 1. Database Schema einrichten

1. **Gehe zu deinem Supabase Dashboard**: https://kvvtfuwtmnnxasiwpqny.supabase.co
2. **SQL Editor öffnen** (links in der Sidebar)
3. **Neuer Query**: Klicke auf "New query"
4. **Schema ausführen**: 
   - Kopiere den Inhalt von `supabase/auth-schema.sql`
   - Füge ihn in den SQL Editor ein
   - Klicke "Run" (oder Cmd/Ctrl + Enter)

## 2. Authentication Provider konfigurieren

### A. Email Authentication (bereits aktiv)
- Gehe zu **Authentication > Settings**
- **Enable email confirmations**: ✅ (empfohlen)
- **Enable email change confirmations**: ✅ (empfohlen)

### B. Apple Sign-In einrichten

1. **Apple Developer Account benötigt**
2. **Gehe zu Authentication > Providers**
3. **Apple aktivieren**:
   ```
   Services ID: com.yourcompany.freshexpo
   Team ID: [Dein Apple Team ID]
   Key ID: [Dein Apple Key ID]  
   Secret Key: [Private Key von Apple]
   ```

### C. Google Sign-In einrichten

1. **Google Cloud Console**: https://console.cloud.google.com
2. **Neues Projekt erstellen** oder existierendes wählen
3. **APIs & Services > Credentials**
4. **OAuth 2.0 Client IDs erstellen**:
   - **Application type**: Web application
   - **Name**: Fresh Expo Web
   - **Authorized redirect URIs**: 
     ```
     https://kvvtfuwtmnnxasiwpqny.supabase.co/auth/v1/callback
     ```
5. **In Supabase**: Authentication > Providers > Google
   ```
   Client ID: [Deine Google Client ID]
   Client Secret: [Dein Google Client Secret]
   ```

## 3. URL Configuration

### Redirect URLs konfigurieren:
- **Site URL**: `exp://localhost:8081` (für Development)
- **Redirect URLs** hinzufügen:
  ```
  exp://localhost:8081
  com.yourcompany.freshexpo://
  https://auth.expo.io/@your-username/fresh-expo
  ```

## 4. Environment Variables prüfen

Stelle sicher, dass deine `.env` Datei korrekt ist:

```env
EXPO_PUBLIC_SUPABASE_URL=https://kvvtfuwtmnnxasiwpqny.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=[Dein Anon Key]
OPENAI_API_KEY=[Dein OpenAI Key - optional]
```

## 5. Testing

### Test-Accounts erstellen:
1. **Direkt in der App registrieren**
2. **Oder via Supabase Dashboard**:
   - Authentication > Users
   - "Add user" klicken
   - Email + Passwort eingeben

### Funktionen testen:
- ✅ Registrierung mit Email/Passwort
- ✅ Login mit Email/Passwort  
- ✅ Passwort zurücksetzen
- ✅ Automatische Profilerstellung
- ✅ Chat-Nachrichten mit User-Zuordnung
- ⏳ Apple Sign-In (nach Setup)
- ⏳ Google Sign-In (nach Setup)

## 6. Row Level Security (RLS) Verifizieren

Gehe zu **Database > Tables** und prüfe:

### user_profiles:
- ✅ RLS aktiviert
- ✅ Policies für SELECT, INSERT, UPDATE

### messages:  
- ✅ RLS aktiviert
- ✅ Policy für öffentlichen READ-Zugriff
- ✅ Policy für authenticated INSERT

## 7. Realtime aktivieren

Stelle sicher, dass Realtime für folgende Tables aktiviert ist:
- ✅ `messages`
- ✅ `user_profiles`

**Zu finden unter**: Database > Replication

## Troubleshooting

### Häufige Probleme:

1. **"Invalid login credentials"**
   - Email-Bestätigung erforderlich?
   - Passwort korrekt?
   - User in Supabase Dashboard vorhanden?

2. **Social Login funktioniert nicht**
   - Redirect URLs korrekt konfiguriert?
   - Client IDs/Secrets richtig?
   - Expo AuthSession konfiguriert?

3. **RLS blockiert Zugriff**
   - Policies überprüfen
   - User authentifiziert?
   - JWT Token gültig?

4. **Realtime funktioniert nicht**
   - Tabellen in Replication hinzugefügt?
   - WebSocket-Verbindung aktiv?
   - Subscription korrekt implementiert?