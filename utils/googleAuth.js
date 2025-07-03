import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import { supabase } from './supabase';

// Google Sign-In konfigurieren
export const initGoogle = () => {
  GoogleSignin.configure({
    webClientId: '19781117641-4fjg9s3td5qn41tn7800f0ej3bvntco2.apps.googleusercontent.com', // Web Client ID
    iosClientId: '19781117641-ds4qspmrbtovet444882f89h6jshf1ie.apps.googleusercontent.com', // iOS Client ID
    offlineAccess: true,
    scopes: ['profile', 'email'],
  });
};

// Überprüfe ob Google Play Services verfügbar sind
export const checkGooglePlayServices = async () => {
  try {
    await GoogleSignin.hasPlayServices({
      showPlayServicesUpdateDialog: true,
    });
    return true;
  } catch (error) {
    console.error('Google Play Services not available:', error);
    return false;
  }
};

// Google Sign-In
export const signInWithGoogle = async () => {
  try {
    console.log('Starting Google Sign-In...');
    
    // Überprüfe Google Play Services
    const hasPlayServices = await checkGooglePlayServices();
    if (!hasPlayServices) {
      throw new Error('Google Play Services not available');
    }
    
    // Google Sign-In
    const userInfo = await GoogleSignin.signIn();
    console.log('Google userInfo:', userInfo);
    
    if (!userInfo.idToken) {
      throw new Error('Google ID Token not received');
    }
    
    // Mit Supabase authentifizieren
    const { data, error } = await supabase.auth.signInWithIdToken({
      provider: 'google',
      token: userInfo.idToken,
    });
    
    if (error) {
      console.error('Supabase Google sign-in error:', error);
      throw error;
    }
    
    console.log('Google sign-in successful:', data);
    return { 
      success: true, 
      user: data.user, 
      session: data.session 
    };
    
  } catch (error) {
    console.error('Google sign-in error:', error);
    
    // Spezifische Fehlerbehandlung
    if (error.code === statusCodes.SIGN_IN_CANCELLED) {
      return { success: false, error: 'Sign-in cancelled by user' };
    } else if (error.code === statusCodes.IN_PROGRESS) {
      return { success: false, error: 'Sign-in already in progress' };
    } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
      return { success: false, error: 'Google Play Services not available' };
    } else {
      return { success: false, error: error.message || 'Google sign-in failed' };
    }
  }
};

// Google Sign-Out
export const signOutGoogle = async () => {
  try {
    const isSignedIn = await GoogleSignin.isSignedIn();
    if (isSignedIn) {
      await GoogleSignin.signOut();
      console.log('Google sign-out successful');
    }
    return { success: true };
  } catch (error) {
    console.error('Google sign-out error:', error);
    return { success: false, error: error.message };
  }
};

// Aktuelle Google User Info
export const getCurrentGoogleUser = async () => {
  try {
    const isSignedIn = await GoogleSignin.isSignedIn();
    if (isSignedIn) {
      const userInfo = await GoogleSignin.signInSilently();
      return userInfo;
    }
    return null;
  } catch (error) {
    console.error('Get current Google user error:', error);
    return null;
  }
};

// Google verfügbar prüfen
export const isGoogleAuthAvailable = async () => {
  try {
    const hasPlayServices = await checkGooglePlayServices();
    return hasPlayServices;
  } catch (error) {
    console.error('Google auth availability check error:', error);
    return false;
  }
};