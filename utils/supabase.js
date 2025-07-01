import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const supabaseUrl = 'https://kvvtfuwtmnnxasiwpqny.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt2dnRmdXd0bW5ueGFzaXdwcW55Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk3MTkwOTksImV4cCI6MjA2NTI5NTA5OX0.WFeJpdQANkdDbJfEPsqKL7CfD8Rh4k_LpcB_HzRvcdw';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});