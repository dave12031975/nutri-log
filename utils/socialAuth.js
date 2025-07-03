import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import * as Crypto from 'expo-crypto';
import { supabase } from './supabase';
import { Alert } from 'react-native';

// Complete WebBrowser auth sessions on mobile
WebBrowser.maybeCompleteAuthSession();

// Apple Sign-In
export const signInWithApple = async () => {
  try {
    const redirectUrl = AuthSession.makeRedirectUri({
      useProxy: true,
    });

    const authUrl = `${process.env.EXPO_PUBLIC_SUPABASE_URL}/auth/v1/authorize?provider=apple&redirect_to=${encodeURIComponent(redirectUrl)}`;

    const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUrl);

    if (result.type === 'success') {
      const { url } = result;
      const urlParams = new URLSearchParams(url.split('#')[1] || url.split('?')[1]);
      
      const access_token = urlParams.get('access_token');
      const refresh_token = urlParams.get('refresh_token');

      if (access_token) {
        const { data, error } = await supabase.auth.setSession({
          access_token,
          refresh_token,
        });

        if (error) throw error;
        return { user: data.user, session: data.session };
      }
    }
    
    throw new Error('Authentication was cancelled or failed');
  } catch (error) {
    console.error('Apple Sign-In error:', error);
    Alert.alert('Apple Sign-In Error', error.message);
    throw error;
  }
};

// Google Sign-In
export const signInWithGoogle = async () => {
  try {
    const redirectUrl = AuthSession.makeRedirectUri({
      useProxy: true,
    });

    const authUrl = `${process.env.EXPO_PUBLIC_SUPABASE_URL}/auth/v1/authorize?provider=google&redirect_to=${encodeURIComponent(redirectUrl)}`;

    const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUrl);

    if (result.type === 'success') {
      const { url } = result;
      const urlParams = new URLSearchParams(url.split('#')[1] || url.split('?')[1]);
      
      const access_token = urlParams.get('access_token');
      const refresh_token = urlParams.get('refresh_token');

      if (access_token) {
        const { data, error } = await supabase.auth.setSession({
          access_token,
          refresh_token,
        });

        if (error) throw error;
        return { user: data.user, session: data.session };
      }
    }
    
    throw new Error('Authentication was cancelled or failed');
  } catch (error) {
    console.error('Google Sign-In error:', error);
    Alert.alert('Google Sign-In Error', error.message);
    throw error;
  }
};

// Generic OAuth sign-in function
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