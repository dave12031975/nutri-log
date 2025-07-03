-- ================================
-- AUTHENTICATION SCHEMA FOR FRESH EXPO
-- ================================

-- 1. User Profiles Tabelle (erweitert auth.users)
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  first_name TEXT,
  last_name TEXT,
  address TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 2. Messages Tabelle (aktualisiert für Auth)
DROP TABLE IF EXISTS messages;
CREATE TABLE messages (
  id TEXT PRIMARY KEY,
  text TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  user_name TEXT NOT NULL,
  user_avatar TEXT,
  is_ai_message BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 3. Indizes für Performance
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_user_id ON messages(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- ================================
-- RLS POLICIES
-- ================================

-- User Profiles Policies
CREATE POLICY "Users can view their own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Messages Policies
-- Öffentlicher Lesezugriff (Chat bleibt öffentlich)
CREATE POLICY "Enable read access for all users" ON messages
  FOR SELECT USING (true);

-- Angemeldete Nutzer können Nachrichten senden
CREATE POLICY "Authenticated users can insert messages" ON messages
  FOR INSERT WITH CHECK (
    auth.role() = 'authenticated' AND 
    auth.uid() = user_id
  );

-- Anonyme Nutzer können auch Nachrichten senden (optional)
CREATE POLICY "Anonymous users can insert messages" ON messages
  FOR INSERT WITH CHECK (
    auth.role() = 'anon' OR 
    auth.role() = 'authenticated'
  );

-- Nutzer können ihre eigenen Nachrichten löschen
CREATE POLICY "Users can delete their own messages" ON messages
  FOR DELETE USING (auth.uid() = user_id);

-- ================================
-- FUNCTIONS & TRIGGERS
-- ================================

-- Function: Auto-create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, full_name, first_name, last_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: Create profile on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function: Update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Auto-update updated_at for user_profiles
DROP TRIGGER IF EXISTS user_profiles_updated_at ON user_profiles;
CREATE TRIGGER user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ================================
-- ENABLE REALTIME
-- ================================

-- Enable Realtime für Tables
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
ALTER PUBLICATION supabase_realtime ADD TABLE user_profiles;

-- ================================
-- SAMPLE DATA (Optional)
-- ================================

-- AI Welcome Message
INSERT INTO messages (id, text, user_name, user_avatar, is_ai_message, created_at)
VALUES (
  'welcome_ai_message',
  'Welcome to Fresh Expo! I''m your AI assistant. How can I help you today?',
  'AI Assistant',
  'https://example.com/ai-avatar.png',
  true,
  NOW()
) ON CONFLICT (id) DO NOTHING;