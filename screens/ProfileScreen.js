import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { useNavigation } from '@react-navigation/native';

// Hilfsfunktionen für User-Informationen
const getAuthProvider = (user) => {
  // Strategie 1: Verwende app_metadata.provider als primäre Quelle
  if (user?.app_metadata?.provider) {
    console.log('Provider from app_metadata:', user.app_metadata.provider);
    return user.app_metadata.provider;
  }
  
  // Strategie 2: Fallback - Identity mit neuesten last_sign_in_at
  if (!user?.identities?.length) {
    return 'email';
  }
  
  const mostRecentIdentity = user.identities.reduce((latest, current) => {
    const currentTime = new Date(current.last_sign_in_at);
    const latestTime = new Date(latest.last_sign_in_at);
    return currentTime > latestTime ? current : latest;
  });
  
  console.log('Provider from most recent identity:', mostRecentIdentity.provider);
  return mostRecentIdentity.provider;
};

const getProviderIcon = (provider) => {
  switch (provider) {
    case 'google': return 'logo-google';
    case 'apple': return 'logo-apple';
    case 'facebook': return 'logo-facebook';
    case 'github': return 'logo-github';
    default: return 'mail-outline';
  }
};

const getProviderName = (provider) => {
  switch (provider) {
    case 'google': return 'Google';
    case 'apple': return 'Apple';
    case 'facebook': return 'Facebook';
    case 'github': return 'GitHub';
    case 'email': return 'Email';
    default: return 'Email';
  }
};

const getMostRecentIdentity = (user) => {
  if (!user?.identities?.length) return null;
  
  return user.identities.reduce((latest, current) => {
    const currentTime = new Date(current.last_sign_in_at);
    const latestTime = new Date(latest.last_sign_in_at);
    return currentTime > latestTime ? current : latest;
  });
};

const getUserAvatar = (user) => {
  const mostRecentIdentity = getMostRecentIdentity(user);
  
  // Versuche Avatar-URL aus verschiedenen Quellen zu bekommen
  const avatarUrl = 
    user?.user_metadata?.avatar_url ||
    user?.user_metadata?.picture ||
    mostRecentIdentity?.identity_data?.avatar_url ||
    mostRecentIdentity?.identity_data?.picture;
  
  return avatarUrl;
};

const getInitials = (user) => {
  const mostRecentIdentity = getMostRecentIdentity(user);
  
  const name = user?.user_metadata?.full_name || 
               user?.user_metadata?.name || 
               mostRecentIdentity?.identity_data?.full_name ||
               user?.email;
  
  if (!name) return 'U';
  
  return name
    .split(' ')
    .map(part => part.charAt(0).toUpperCase())
    .slice(0, 2)
    .join('');
};

// Avatar Komponente
const UserAvatar = ({ user, size = 100 }) => {
  const avatarUrl = getUserAvatar(user);
  const initials = getInitials(user);
  
  if (avatarUrl) {
    return (
      <Image 
        source={{ uri: avatarUrl }}
        style={[styles.avatar, { width: size, height: size, borderRadius: size / 2 }]}
      />
    );
  }
  
  // Fallback: Initials in colored circle
  return (
    <View style={[
      styles.avatarFallback, 
      { 
        width: size, 
        height: size, 
        borderRadius: size / 2,
        backgroundColor: getAvatarColor(user?.email || '')
      }
    ]}>
      <Text style={[styles.avatarInitials, { fontSize: size * 0.4 }]}>
        {initials}
      </Text>
    </View>
  );
};

// Konsistente Farbe basierend auf Email generieren
const getAvatarColor = (email) => {
  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
    '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'
  ];
  
  let hash = 0;
  for (let i = 0; i < email.length; i++) {
    hash = email.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  return colors[Math.abs(hash) % colors.length];
};

// Funktion um Provider aus Session zu erkennen
const getSessionProvider = (session) => {
  // Dekodiere JWT Token um AMR (Authentication Method Reference) zu erhalten
  if (session?.access_token) {
    try {
      const payload = JSON.parse(atob(session.access_token.split('.')[1]));
      console.log('JWT payload:', payload);
      
      // Prüfe AMR (Authentication Method Reference) 
      const authMethod = payload.amr?.[0];
      console.log('Auth method from JWT:', authMethod);
      
      // OAuth provider sind in app_metadata.provider gespeichert
      if (authMethod === 'oauth') {
        const provider = session?.user?.app_metadata?.provider;
        console.log('OAuth provider from app_metadata:', provider);
        return provider || 'email';
      }
      
      // Password = Email Login
      if (authMethod === 'password') {
        return 'email';
      }
    } catch (error) {
      console.warn('Error decoding JWT:', error);
    }
  }
  
  // Fallback zu app_metadata.provider
  const fallbackProvider = session?.user?.app_metadata?.provider || 'email';
  console.log('Fallback provider:', fallbackProvider);
  return fallbackProvider;
};

export default function ProfileScreen() {
  const { user, session, signOut } = useAuth();
  const navigation = useNavigation();
  
  // Verwende Session für Provider-Information
  const sessionProvider = getSessionProvider(session);
  console.log('Detected session provider:', sessionProvider);
  
  const providerName = getProviderName(sessionProvider);
  const providerIcon = getProviderIcon(sessionProvider);
  
  const handleSignOut = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Sign Out', 
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut();
            } catch (error) {
              console.error('Sign out error:', error);
            }
          }
        }
      ]
    );
  };
  
  if (!user) {
    return (
      <View style={styles.notAuthenticatedContainer}>
        <Ionicons name="person-circle-outline" size={80} color="#ccc" />
        <Text style={styles.notAuthenticatedTitle}>Not Signed In</Text>
        <Text style={styles.notAuthenticatedText}>
          Sign in to access your profile and personalized features
        </Text>
        <TouchableOpacity 
          style={styles.signInButton}
          onPress={() => navigation.navigate('Auth')}
        >
          <Text style={styles.signInButtonText}>Sign In</Text>
        </TouchableOpacity>
      </View>
    );
  }
  
  return (
    <ScrollView style={styles.container}>
      <View style={styles.profileHeader}>
        <UserAvatar user={user} size={100} />
        <Text style={styles.userName}>
          {user.user_metadata?.full_name || user.user_metadata?.name || user.identities?.[0]?.identity_data?.full_name || 'User'}
        </Text>
        <Text style={styles.userEmail}>{user.email}</Text>
        
        {/* Provider Information */}
        <View style={styles.providerInfo}>
          <Ionicons name={providerIcon} size={16} color="#666" />
          <Text style={styles.providerText}>Signed in with {providerName}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <TouchableOpacity style={styles.menuItem}>
          <Ionicons name="person-outline" size={24} color="#007AFF" />
          <Text style={styles.menuText}>Edit Profile</Text>
          <Ionicons name="chevron-forward" size={24} color="#ccc" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <Ionicons name={providerIcon} size={24} color="#007AFF" />
          <View style={styles.accountInfo}>
            <Text style={styles.menuText}>Account</Text>
            <Text style={styles.accountSubtext}>Connected via {providerName}</Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#ccc" />
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <TouchableOpacity style={styles.menuItem}>
          <Ionicons name="notifications-outline" size={24} color="#007AFF" />
          <Text style={styles.menuText}>Notifications</Text>
          <Ionicons name="chevron-forward" size={24} color="#ccc" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <Ionicons name="shield-checkmark-outline" size={24} color="#007AFF" />
          <Text style={styles.menuText}>Privacy</Text>
          <Ionicons name="chevron-forward" size={24} color="#ccc" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <Ionicons name="help-circle-outline" size={24} color="#007AFF" />
          <Text style={styles.menuText}>Help & Support</Text>
          <Ionicons name="chevron-forward" size={24} color="#ccc" />
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <TouchableOpacity style={styles.menuItem} onPress={handleSignOut}>
          <Ionicons name="log-out-outline" size={24} color="#ff3b30" />
          <Text style={[styles.menuText, { color: '#ff3b30' }]}>Sign Out</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.version}>Version 1.0.0</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  profileHeader: {
    alignItems: 'center',
    paddingVertical: 30,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 15,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  userEmail: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  providerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  providerText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 6,
  },
  avatarFallback: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  avatarInitials: {
    color: '#fff',
    fontWeight: 'bold',
  },
  accountInfo: {
    flex: 1,
    marginLeft: 15,
  },
  accountSubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 2,
  },
  section: {
    backgroundColor: '#fff',
    marginVertical: 10,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#e0e0e0',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  menuText: {
    flex: 1,
    fontSize: 16,
    marginLeft: 15,
    color: '#333',
  },
  version: {
    textAlign: 'center',
    color: '#999',
    fontSize: 14,
    marginVertical: 20,
  },
  notAuthenticatedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f8f8f8',
  },
  notAuthenticatedTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 20,
    marginBottom: 10,
  },
  notAuthenticatedText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
    paddingHorizontal: 40,
  },
  signInButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 25,
  },
  signInButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});