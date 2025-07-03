import { Alert } from 'react-native';

// Temporäre Social Auth Implementation
// Diese Funktionen sind Platzhalter bis expo-web-browser installiert ist

export const signInWithApple = async () => {
  Alert.alert(
    'Apple Sign-In', 
    'Apple Sign-In ist noch nicht vollständig konfiguriert. Bitte verwende Email/Passwort Login.'
  );
  throw new Error('Apple Sign-In not configured yet');
};

export const signInWithGoogle = async () => {
  Alert.alert(
    'Google Sign-In', 
    'Google Sign-In ist noch nicht vollständig konfiguriert. Bitte verwende Email/Passwort Login.'
  );
  throw new Error('Google Sign-In not configured yet');
};

export const signInWithProvider = async (provider) => {
  switch (provider) {
    case 'apple':
      return await signInWithApple();
    case 'google':
      return await signInWithGoogle();
    default:
      throw new Error(`Provider ${provider} not supported`);
  }
};