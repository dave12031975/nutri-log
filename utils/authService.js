import { supabase } from './supabase';

export const authService = {
  // Registrierung
  async signUp(email, password, name) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name,
          }
        }
      });

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('SignUp error:', error);
      return { success: false, error: error.message };
    }
  },

  // Anmeldung
  async signIn(email, password) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('SignIn error:', error);
      return { success: false, error: error.message };
    }
  },

  // Abmeldung
  async signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('SignOut error:', error);
      return { success: false, error: error.message };
    }
  },

  // Aktueller Benutzer
  async getCurrentUser() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    } catch (error) {
      console.error('GetUser error:', error);
      return null;
    }
  },

  // Session prüfen
  async getSession() {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      return session;
    } catch (error) {
      console.error('GetSession error:', error);
      return null;
    }
  },

  // Auth State Listener
  onAuthStateChange(callback) {
    return supabase.auth.onAuthStateChange((event, session) => {
      callback(event, session);
    });
  },

  // Passwort zurücksetzen
  async resetPassword(email) {
    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('ResetPassword error:', error);
      return { success: false, error: error.message };
    }
  },

  // Profil aktualisieren
  async updateProfile(updates) {
    try {
      const { data, error } = await supabase.auth.updateUser({
        data: updates
      });
      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('UpdateProfile error:', error);
      return { success: false, error: error.message };
    }
  },
};