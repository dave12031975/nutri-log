import React, { useState, useRef } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { View, Text, TouchableOpacity, StyleSheet, Modal, SafeAreaView, Dimensions, ActivityIndicator } from 'react-native';
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

function AuthButton({ navigationRef, onClose }) {
  const { user, signOut } = useAuth();
  
  if (user) {
    return (
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

const Tab = createBottomTabNavigator();
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
              
              <TouchableOpacity
                style={[styles.sidebarItem, activeScreen === 'Profil' && styles.activeSidebarItem]}
                onPress={() => onNavigate('Profil')}
              >
                <Ionicons name="person" size={24} color={activeScreen === 'Profil' ? '#007AFF' : '#666'} />
                <Text style={[styles.sidebarText, activeScreen === 'Profil' && styles.activeSidebarText]}>
                  Profil
                </Text>
              </TouchableOpacity>
              
              <View style={{ flex: 1 }} />
              
              <AuthButton navigationRef={navigationRef} onClose={onClose} />
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
  const { loading } = useAuth();
  const navigationRef = useRef();
  
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }
  
  return (
    <NavigationContainer ref={navigationRef}>
      <RootNavigator navigationRef={navigationRef} />
    </NavigationContainer>
  );
}

function MainTabNavigator({ navigationRef }) {
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [activeScreen, setActiveScreen] = useState('Chat');
  const tabNavigationRef = useRef();
  
  // Shared values für Echtzeit-Tracking
  const menuTranslateX = useSharedValue(-SIDEBAR_WIDTH);
  const backdropOpacity = useSharedValue(0);

  return (
      <GestureHandlerRootView style={{ flex: 1 }}>
          <EdgeSwipeHandler 
            onSwipe={(shouldOpen) => setSidebarVisible(shouldOpen !== false)}
            menuTranslateX={menuTranslateX}
            backdropOpacity={backdropOpacity}
          >
            <Tab.Navigator
              ref={tabNavigationRef}
              screenOptions={{
                tabBarStyle: { display: 'none' },
                header: ({ route }) => (
                  <CustomHeader 
                    title={route.name}
                    onMenuPress={() => setSidebarVisible(true)}
                  />
                )
              }}
              screenListeners={{
                state: (e) => {
                  const state = e.data.state;
                  if (state) {
                    const routeName = state.routes[state.index].name;
                    setActiveScreen(routeName);
                  }
                }
              }}
            >
              <Tab.Screen name="Chat" component={ChatScreen} />
              <Tab.Screen name="Profil" component={ProfileScreen} />
            </Tab.Navigator>
          </EdgeSwipeHandler>
          
          <CustomSidebar 
            visible={sidebarVisible}
            onClose={() => setSidebarVisible(false)}
            activeScreen={activeScreen}
            onNavigate={(screen) => {
              setActiveScreen(screen);
              setSidebarVisible(false);
              tabNavigationRef.current?.navigate(screen);
            }}
            translateX={menuTranslateX}
            backdropOpacity={backdropOpacity}
            navigationRef={navigationRef}
          />
      </GestureHandlerRootView>
  );
}

export default function App() {
  return (
    <KeyboardProvider>
      <AuthProvider>
        <MainApp />
      </AuthProvider>
    </KeyboardProvider>
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
});
