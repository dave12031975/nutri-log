import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../utils/authService';
import { Alert } from 'react-native';

const AuthContext = createContext({
  user: null,
  session: null,
  loading: true,
  signIn: async () => {},
  signUp: async () => {},
  signOut: async () => {},
  resetPassword: async () => {},
  updateProfile: async () => {},
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkCurrentSession();
    
    const { data: authListener } = authService.onAuthStateChange((event, session) => {
      setSession(session);
      setUser(session?.user || null);
      setLoading(false);
    });

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  const checkCurrentSession = async () => {
    try {
      const currentSession = await authService.getSession();
      setSession(currentSession);
      setUser(currentSession?.user || null);
    } catch (error) {
      console.error('Error checking session:', error);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email, password) => {
    try {
      const result = await authService.signIn(email, password);
      if (!result.success) throw new Error(result.error);
      
      const { user, session } = result.data;
      setUser(user);
      setSession(session);
      return { user, session };
    } catch (error) {
      Alert.alert('Login Error', error.message);
      throw error;
    }
  };

  const signUp = async (email, password, fullName) => {
    try {
      const result = await authService.signUp(email, password, fullName);
      if (!result.success) throw new Error(result.error);
      
      // Correctly destructure the Supabase response
      const { user, session } = result.data;
      
      setUser(user);
      setSession(session);
      Alert.alert('Success', 'Account created successfully! Please check your email to verify your account.');
      return { user, session };
    } catch (error) {
      Alert.alert('Sign Up Error', error.message);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      const result = await authService.signOut();
      if (!result.success) throw new Error(result.error);
      
      setUser(null);
      setSession(null);
    } catch (error) {
      Alert.alert('Sign Out Error', error.message);
      throw error;
    }
  };

  const resetPassword = async (email) => {
    try {
      const result = await authService.resetPassword(email);
      if (!result.success) throw new Error(result.error);
      
      Alert.alert('Success', 'Password reset email sent! Please check your inbox.');
    } catch (error) {
      Alert.alert('Reset Password Error', error.message);
      throw error;
    }
  };

  const updateProfile = async (updates) => {
    try {
      const result = await authService.updateProfile(updates);
      if (!result.success) throw new Error(result.error);
      
      const { user: updatedUser } = result.data;
      setUser(updatedUser);
      Alert.alert('Success', 'Profile updated successfully!');
      return updatedUser;
    } catch (error) {
      Alert.alert('Update Profile Error', error.message);
      throw error;
    }
  };

  const value = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};