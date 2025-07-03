import React, { useState, useRef, useEffect } from 'react';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { View, Text, TouchableOpacity, StyleSheet, Modal, SafeAreaView, Dimensions, ActivityIndicator, Image } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  withSpring,
  runOnJS,
  useAnimatedReaction 
} from 'react-native-reanimated';
import { GestureHandlerRootView, PanGestureHandler } from 'react-native-gesture-handler';
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Avatar-Funktionen für Sidebar (wiederverwenden aus ProfileScreen)
const getMostRecentIdentity = (user) => {
  if (!user?.identities?.length) return null;
  
  return user.identities.reduce((latest, current) => {
    const currentTime = new Date(current.last_sign_in_at);
    const latestTime = new Date(latest.last_sign_in_at);
    return currentTime > latestTime ? current : latest;
  });
};

const getSidebarAvatar = (user) => {
  const mostRecentIdentity = getMostRecentIdentity(user);
  
  const avatarUrl = 
    user?.user_metadata?.avatar_url ||
    user?.user_metadata?.picture ||
    mostRecentIdentity?.identity_data?.avatar_url ||
    mostRecentIdentity?.identity_data?.picture;
  
  return avatarUrl;
};

const getSidebarInitials = (user) => {
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

const getSidebarAvatarColor = (email) => {
  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
    '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'
  ];
  
  let hash = 0;
  for (let i = 0; i < (email || '').length; i++) {
    hash = email.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  return colors[Math.abs(hash) % colors.length];
};

// Sidebar Avatar Component
const SidebarAvatar = ({ user, size = 32 }) => {
  const avatarUrl = getSidebarAvatar(user);
  const initials = getSidebarInitials(user);
  
  if (avatarUrl) {
    return (
      <View style={[styles.sidebarAvatar, { width: size, height: size }]}>
        <Image 
          source={{ uri: avatarUrl }}
          style={{ width: size, height: size, borderRadius: size / 2 }}
        />
      </View>
    );
  }
  
  return (
    <View style={[
      styles.sidebarAvatarFallback, 
      { 
        width: size, 
        height: size, 
        borderRadius: size / 2,
        backgroundColor: getSidebarAvatarColor(user?.email || '')
      }
    ]}>
      <Text style={[styles.sidebarAvatarInitials, { fontSize: size * 0.4 }]}>
        {initials}
      </Text>
    </View>
  );
};

function AuthButton({ navigationRef, onClose, onNavigate }) {
  const { user, signOut } = useAuth();
  
  if (user) {
    const userName = user?.user_metadata?.full_name || 
                    user?.user_metadata?.name || 
                    user?.identities?.[0]?.identity_data?.full_name ||
                    'User';
                    
    return (
      <View style={styles.userSection}>
        {/* User Info - Klickbar für Profil */}
        <TouchableOpacity 
          style={styles.userInfo}
          onPress={() => onNavigate('Profil')}
        >
          <SidebarAvatar user={user} size={40} />
          <View style={styles.userDetails}>
            <Text style={styles.userName}>{userName}</Text>
            <Text style={styles.userEmail}>{user.email}</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#ccc" />
        </TouchableOpacity>
        
        {/* Sign Out Button */}
        <TouchableOpacity
          style={styles.sidebarItem}
          onPress={async () => {
            await signOut();
            onClose();
          }}
        >
          <Ionicons name="log-out-outline" size={24} color="#666" />
          <Text style={styles.sidebarText}>
            Sign Out
          </Text>
        </TouchableOpacity>
      </View>
    );
  }
  
  return (
    <TouchableOpacity
      style={styles.sidebarItem}
      onPress={() => {
        navigationRef.current?.navigate('Auth');
        onClose();
      }}
    >
      <Ionicons name="log-in-outline" size={24} color="#666" />
      <Text style={styles.sidebarText}>
        Sign In
      </Text>
    </TouchableOpacity>
  );
}
import ChatScreen from './screens/ChatScreen';
import ProfileScreen from './screens/ProfileScreen';
import LoginScreen from './screens/LoginScreen';
import SignupScreen from './screens/SignupScreen';
import ForgotPasswordScreen from './screens/ForgotPasswordScreen';

const Stack = createStackNavigator();

function CustomHeader({ title, onMenuPress }) {
  return (
    <View style={styles.header}>
      <TouchableOpacity onPress={onMenuPress} style={styles.menuButton}>
        <Ionicons name="menu" size={24} color="#fff" />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>{title}</Text>
      <View style={styles.placeholder} />
    </View>
  );
}

const SIDEBAR_WIDTH = 280;
const SIDEBAR_ACTUAL_WIDTH = 280 * 1.2; // 20% größer
const SIDEBAR_OFFSET = SIDEBAR_ACTUAL_WIDTH - SIDEBAR_WIDTH; // Überhang nach links
const { width: SCREEN_WIDTH } = Dimensions.get('window');

function CustomSidebar({ visible, onClose, activeScreen, onNavigate, translateX, backdropOpacity, navigationRef }) {
  React.useEffect(() => {
    if (visible) {
      translateX.value = withSpring(0, { 
        damping: 50,
        stiffness: 500,
        overshootClamping: true,
        restDisplacementThreshold: 0.01,
        restSpeedThreshold: 0.01
      });
      backdropOpacity.value = withTiming(1, { duration: 200 });
    } else {
      translateX.value = withSpring(-SIDEBAR_WIDTH, { 
        damping: 50,
        stiffness: 500,
        overshootClamping: true,
        restDisplacementThreshold: 0.01,
        restSpeedThreshold: 0.01
      });
      backdropOpacity.value = withTiming(0, { duration: 200 });
    }
  }, [visible]);

  const sidebarStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));

  const gestureHandler = (event) => {
    'worklet';
    const { translationX, velocityX, state } = event.nativeEvent;
    
    // State 4 = ACTIVE - Echtzeit-Tracking beim Schließen
    if (state === 4) {
      const newX = Math.min(0, translationX);
      translateX.value = newX;
      const progress = 1 + (newX / SIDEBAR_WIDTH);
      backdropOpacity.value = Math.max(0, progress);
    }
    
    // State 5 = END
    if (state === 5) {
      if (translationX < -SIDEBAR_WIDTH / 2 || velocityX < -500) {
        translateX.value = withSpring(-SIDEBAR_WIDTH, { 
          damping: 50,
          stiffness: 500,
          overshootClamping: true,
          restDisplacementThreshold: 0.01,
          restSpeedThreshold: 0.01
        });
        backdropOpacity.value = withTiming(0, { duration: 200 });
        runOnJS(onClose)();
      } else {
        translateX.value = withSpring(0, { 
          damping: 50,
          stiffness: 500,
          overshootClamping: true,
          restDisplacementThreshold: 0.01,
          restSpeedThreshold: 0.01
        });
        backdropOpacity.value = withTiming(1, { duration: 200 });
      }
    }
  };

  const [modalVisible, setModalVisible] = React.useState(false);
  
  // Modal zeigen wenn visible true ist oder wenn translateX sich ändert
  React.useEffect(() => {
    if (visible) {
      setModalVisible(true);
    }
  }, [visible]);
  
  // Überwache translateX Änderungen
  useAnimatedReaction(
    () => translateX.value,
    (current) => {
      if (current > -SIDEBAR_WIDTH) {
        runOnJS(setModalVisible)(true);
      } else if (current === -SIDEBAR_WIDTH && !visible) {
        runOnJS(setModalVisible)(false);
      }
    }
  );
  
  return (
    <Modal
      visible={modalVisible}
      animationType="none"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <Animated.View style={[styles.modalBackground, backdropStyle]}>
          <TouchableOpacity style={styles.modalBackgroundTouchable} onPress={onClose} />
        </Animated.View>
        <PanGestureHandler 
          onGestureEvent={gestureHandler}
          onHandlerStateChange={gestureHandler}
        >
          <Animated.View style={[styles.sidebar, sidebarStyle]}>
            <SafeAreaView style={styles.sidebarContent}>
              <View style={styles.sidebarHeader}>
                <Ionicons name="chatbubbles" size={32} color="#007AFF" />
                <Text style={styles.appName}>Fresh Expo</Text>
              </View>
              
              <TouchableOpacity
                style={[styles.sidebarItem, activeScreen === 'Chat' && styles.activeSidebarItem]}
                onPress={() => onNavigate('Chat')}
              >
                <Ionicons name="chatbubbles" size={24} color={activeScreen === 'Chat' ? '#007AFF' : '#666'} />
                <Text style={[styles.sidebarText, activeScreen === 'Chat' && styles.activeSidebarText]}>
                  Chat
                </Text>
              </TouchableOpacity>
              
              
              <View style={{ flex: 1 }} />
              
              <AuthButton navigationRef={navigationRef} onClose={onClose} onNavigate={onNavigate} />
            </SafeAreaView>
          </Animated.View>
        </PanGestureHandler>
      </View>
    </Modal>
  );
}

function EdgeSwipeHandler({ onSwipe, children, menuTranslateX, backdropOpacity }) {
  const startX = useSharedValue(0);
  const isTracking = useSharedValue(false);
  
  const gestureHandler = (event) => {
    'worklet';
    const { translationX, velocityX, absoluteX, state } = event.nativeEvent;
    
    // State 2 = BEGAN
    if (state === 2) {
      startX.value = absoluteX;
      // Nur vom linken Rand tracken
      if (absoluteX < 30) {
        isTracking.value = true;
      }
    }
    
    // State 4 = ACTIVE
    if (state === 4 && isTracking.value) {
      const progress = Math.min(1, Math.max(0, translationX / SIDEBAR_WIDTH));
      menuTranslateX.value = -SIDEBAR_WIDTH + (translationX);
      backdropOpacity.value = progress;
    }
    
    // State 5 = END
    if (state === 5 && isTracking.value) {
      isTracking.value = false;
      
      // Entscheiden ob öffnen oder schließen basierend auf Position und Geschwindigkeit
      if (translationX > SIDEBAR_WIDTH / 2 || velocityX > 500) {
        menuTranslateX.value = withSpring(0, { 
          damping: 50,
          stiffness: 500,
          overshootClamping: true
        });
        backdropOpacity.value = withTiming(1, { duration: 200 });
        runOnJS(onSwipe)(true);
      } else {
        menuTranslateX.value = withSpring(-SIDEBAR_WIDTH, { 
          damping: 50,
          stiffness: 500,
          overshootClamping: true
        });
        backdropOpacity.value = withTiming(0, { duration: 200 });
        runOnJS(onSwipe)(false);
      }
    }
    
    // State 3 = CANCELLED / FAILED
    if ((state === 3 || state === 1) && isTracking.value) {
      isTracking.value = false;
      menuTranslateX.value = withSpring(-SIDEBAR_WIDTH, { 
        damping: 50,
        stiffness: 500,
        overshootClamping: true
      });
      backdropOpacity.value = withTiming(0, { duration: 200 });
    }
  };

  return (
    <PanGestureHandler 
      onHandlerStateChange={gestureHandler}
      onGestureEvent={gestureHandler}
      shouldCancelWhenOutside={false}
      activeOffsetX={5}
      failOffsetY={[-30, 30]}
    >
      <Animated.View style={{ flex: 1 }}>
        {children}
      </Animated.View>
    </PanGestureHandler>
  );
}

function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Signup" component={SignupScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
    </Stack.Navigator>
  );
}

function RootNavigator({ navigationRef }) {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Main">
        {(props) => <MainTabNavigator {...props} navigationRef={navigationRef} />}
      </Stack.Screen>
      <Stack.Screen 
        name="Auth" 
        component={AuthStack}
        options={{ presentation: 'modal' }}
      />
    </Stack.Navigator>
  );
}

function MainApp() {
  const { user, loading } = useAuth();
  const navigationRef = useRef();
  const [navigationReady, setNavigationReady] = useState(false);
  
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }
  
  return (
    <NavigationContainer 
      ref={navigationRef}
      onReady={() => {
        console.log('Navigation container ready');
        setNavigationReady(true);
      }}
    >
      {user ? (
        <MainTabNavigator navigationRef={navigationRef} navigationReady={navigationReady} />
      ) : (
        <AuthStack />
      )}
    </NavigationContainer>
  );
}

// Screen Wrapper für bedingte Anzeige
function ConditionalScreen({ activeScreen, targetScreen, children }) {
  if (activeScreen === targetScreen) {
    return children;
  }
  return null;
}

function MainTabNavigator({ navigationRef, navigationReady }) {
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [activeScreen, setActiveScreen] = useState('Chat');
  
  // Shared values für Echtzeit-Tracking
  const menuTranslateX = useSharedValue(-SIDEBAR_WIDTH);
  const backdropOpacity = useSharedValue(0);

  // Einfacher Navigation Handler
  const handleNavigate = (screen) => {
    console.log('Navigating to:', screen, 'from:', activeScreen);
    setSidebarVisible(false);
    setActiveScreen(screen);
  };

  return (
      <GestureHandlerRootView style={{ flex: 1 }}>
          <EdgeSwipeHandler 
            onSwipe={(shouldOpen) => setSidebarVisible(shouldOpen !== false)}
            menuTranslateX={menuTranslateX}
            backdropOpacity={backdropOpacity}
          >
            <View style={{ flex: 1 }}>
              {/* Custom Header */}
              <CustomHeader 
                title={activeScreen}
                onMenuPress={() => setSidebarVisible(true)}
              />
              
              {/* Conditional Screen Rendering */}
              <ConditionalScreen activeScreen={activeScreen} targetScreen="Chat">
                <ChatScreen />
              </ConditionalScreen>
              
              <ConditionalScreen activeScreen={activeScreen} targetScreen="Profil">
                <ProfileScreen />
              </ConditionalScreen>
            </View>
          </EdgeSwipeHandler>
          
          <CustomSidebar 
            visible={sidebarVisible}
            onClose={() => setSidebarVisible(false)}
            activeScreen={activeScreen}
            onNavigate={handleNavigate}
            translateX={menuTranslateX}
            backdropOpacity={backdropOpacity}
            navigationRef={navigationRef}
          />
      </GestureHandlerRootView>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <KeyboardProvider>
        <AuthProvider>
          <MainApp />
        </AuthProvider>
      </KeyboardProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    paddingHorizontal: 15,
    paddingVertical: 15,
    paddingTop: 50,
  },
  menuButton: {
    padding: 5,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  placeholder: {
    width: 34,
  },
  modalOverlay: {
    flex: 1,
    flexDirection: 'row',
  },
  modalBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  sidebar: {
    width: SIDEBAR_ACTUAL_WIDTH,
    backgroundColor: '#fff',
    position: 'absolute',
    left: -SIDEBAR_OFFSET,
    top: 0,
    bottom: 0,
    zIndex: 10,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  sidebarContent: {
    flex: 1,
    marginLeft: SIDEBAR_OFFSET, // Inhalt nur im sichtbaren Bereich
  },
  modalBackgroundTouchable: {
    flex: 1,
  },
  sidebarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  appName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
    marginLeft: 12,
  },
  sidebarItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    marginHorizontal: 10,
    borderRadius: 12,
    marginTop: 10,
  },
  activeSidebarItem: {
    backgroundColor: '#f0f8ff',
  },
  sidebarText: {
    fontSize: 16,
    marginLeft: 15,
    color: '#666',
    fontWeight: '500',
  },
  activeSidebarText: {
    color: '#007AFF',
    fontWeight: '600',
  },
  disabledSidebarItem: {
    opacity: 0.5,
  },
  disabledSidebarText: {
    color: '#ccc',
  },
  userSection: {
    paddingVertical: 10,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    marginBottom: 10,
  },
  userDetails: {
    flex: 1,
    marginLeft: 12,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
  },
  sidebarAvatar: {
    borderWidth: 2,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  sidebarAvatarFallback: {
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  sidebarAvatarInitials: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
