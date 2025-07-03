import * as AppleAuthentication from 'expo-apple-authentication';
import { Platform } from 'react-native';
import { supabase } from './supabase';

export const isAppleAuthAvailable = async () => {
  if (Platform.OS !== 'ios') {
    return false;
  }
  
  try {
    return await AppleAuthentication.isAvailableAsync();
  } catch (error) {
    console.warn('Apple Sign-In availability check failed:', error);
    return false;
  }
};

export const signInWithApple = async () => {
  try {
    // Check if Apple Sign-In is available
    const isAvailable = await isAppleAuthAvailable();
    if (!isAvailable) {
      throw new Error('Apple Sign-In ist auf diesem Gerät nicht verfügbar');
    }

    // Request Apple Sign-In
    const credential = await AppleAuthentication.signInAsync({
      requestedScopes: [
        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        AppleAuthentication.AppleAuthenticationScope.EMAIL,
      ],
    });

    console.log('Apple credential received:', {
      user: credential.user,
      email: credential.email,
      fullName: credential.fullName,
    });

    // Sign in with Supabase using Apple ID token
    const { data, error } = await supabase.auth.signInWithIdToken({
      provider: 'apple',
      token: credential.identityToken,
      nonce: credential.nonce,
    });

    if (error) {
      console.error('Supabase Apple Sign-In error:', error);
      throw error;
    }

    console.log('Apple Sign-In successful:', {
      user: data.user?.email,
      session: !!data.session,
    });

    return { 
      user: data.user, 
      session: data.session,
      credential: credential 
    };

  } catch (error) {
    console.error('Apple Sign-In error:', error);
    
    if (error.code === 'ERR_REQUEST_CANCELED') {
      throw new Error('Apple Sign-In wurde abgebrochen');
    } else if (error.code === 'ERR_REQUEST_FAILED') {
      throw new Error('Apple Sign-In Anfrage fehlgeschlagen');
    } else if (error.code === 'ERR_REQUEST_NOT_HANDLED') {
      throw new Error('Apple Sign-In nicht verfügbar');
    } else if (error.code === 'ERR_REQUEST_NOT_INTERACTIVE') {
      throw new Error('Apple Sign-In erfordert Benutzerinteraktion');
    } else if (error.code === 'ERR_REQUEST_UNKNOWN') {
      throw new Error('Unbekannter Apple Sign-In Fehler');
    }
    
    throw error;
  }
};

export const signOutFromApple = async () => {
  try {
    // Supabase sign out
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Supabase sign out error:', error);
      throw error;
    }
    
    console.log('Apple Sign-Out successful');
    return true;
  } catch (error) {
    console.error('Apple Sign-Out error:', error);
    throw error;
  }
};