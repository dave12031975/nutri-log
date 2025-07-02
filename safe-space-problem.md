# Safe Space Problem - React Native GiftedChat

## Problem Beschreibung

In unserer React Native App mit GiftedChat haben wir ein iOS Safe Area Problem beim Keyboard-Verhalten:

### Aktuelles Verhalten (FALSCH):
- **Eingeklappte Tastatur:** ✅ Input-Feld ist korrekt über dem Safe Area (Home-Indikator)
- **Ausgeklappte Tastatur:** ❌ Input-Feld hat unnötigen Abstand zur Tastatur durch Safe Area Padding

### Gewünschtes Verhalten (KORREKT):
- **Eingeklappte Tastatur:** ✅ Input-Feld über Safe Area (wie aktuell)
- **Ausgeklappte Tastatur:** ✅ Input-Feld direkt an der Tastatur (ohne Safe Area Abstand)

## Aktueller Code

```jsx
// ChatScreen.js
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ChatScreen() {
  const insets = useSafeAreaInsets();
  
  return (
    <View style={{ flex: 1, backgroundColor: '#fff', paddingBottom: insets.bottom }}>
      <GiftedChat
        messages={messages}
        onSend={messages => onSend(messages)}
        // ... andere Props
      />
    </View>
  );
}
```

## Das Problem

Das `paddingBottom: insets.bottom` wird **immer** angewendet - sowohl bei eingeklappter als auch ausgeklappter Tastatur. Bei ausgeklappter Tastatur sollte der Safe Area Abstand aber **entfernt** werden, damit das Input-Feld direkt an die Tastatur anschließt.

## Lösungsansätze

1. **Keyboard State Detection:** Erkenne ob Tastatur geöffnet/geschlossen ist
2. **Dynamisches Padding:** Entferne `paddingBottom` wenn Tastatur geöffnet ist
3. **Platform-spezifische Lösung:** Nur iOS betroffen

## Tech Stack Kontext

- React Native mit Expo SDK 53
- react-native-gifted-chat ^2.8.1
- react-native-safe-area-context 5.4.0
- react-native-keyboard-controller ^1.17.5 (verfügbar)
- iOS Development Build (keine Expo Go)

## Erwartete Lösung

Eine Lösung die das Safe Area Padding **dynamisch** basierend auf dem Keyboard-Status anwendet:
- Tastatur geschlossen → Safe Area Padding aktiv
- Tastatur geöffnet → Safe Area Padding entfernt