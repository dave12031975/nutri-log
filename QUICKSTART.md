# Fresh Expo - Schnellstart Guide

## ✅ Alles ist bereit!

Dein Projekt ist vollständig konfiguriert:
- ✅ EAS Projekt erstellt
- ✅ iOS Dev Client wird gebaut
- ✅ Tunnel-Testing konfiguriert
- ✅ OTA-Updates eingerichtet
- ✅ Git Repository gepusht

## 🚀 Dev Client verwenden

1. **Build Status prüfen:**
   ```bash
   eas build:list
   ```

2. **Sobald der Build fertig ist:**
   - Lade die App auf dein iPhone (Link wird in der Console angezeigt)
   - Installiere die App

3. **App lokal testen:**
   ```bash
   npm run dev
   ```

4. **Unterwegs testen (mit Tunnel):**
   ```bash
   npm run tunnel
   ```

## 📱 OTA Updates

**Update veröffentlichen:**
```bash
npm run update -- --message "Deine Update-Nachricht"
```

Oder manuell:
```bash
eas update --branch production --message "Initial Chat Demo"
```

## 🔗 Links

- **EAS Dashboard:** https://expo.dev/accounts/dadina/projects/fresh-expo
- **GitHub:** https://github.com/dave12031975/Fresh-expo
- **Build Status:** https://expo.dev/accounts/dadina/projects/fresh-expo/builds/2ca7843f-0567-4403-8863-4ea8a0be5897

## 📝 Supabase Setup

Nicht vergessen: Führe das SQL-Schema in deinem Supabase Dashboard aus!
```sql
-- Datei: supabase/schema.sql
```

## 🏃‍♂️ Nächste Schritte

1. Warte bis der iOS Build fertig ist
2. Installiere die App auf deinem Gerät
3. Starte mit `npm run tunnel` für Remote-Testing
4. Teste OTA-Updates mit `npm run update`