import React, { useState, useRef } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { View, Text, TouchableOpacity, StyleSheet, Modal, SafeAreaView, Dimensions } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  withSpring,
  runOnJS 
} from 'react-native-reanimated';
import { GestureHandlerRootView, PanGestureHandler } from 'react-native-gesture-handler';
import ChatScreen from './screens/ChatScreen';
import ProfileScreen from './screens/ProfileScreen';

const Tab = createBottomTabNavigator();

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
const { width: SCREEN_WIDTH } = Dimensions.get('window');

function CustomSidebar({ visible, onClose, activeScreen, onNavigate }) {
  const translateX = useSharedValue(-SIDEBAR_WIDTH);
  const backdropOpacity = useSharedValue(0);

  React.useEffect(() => {
    if (visible) {
      translateX.value = withSpring(0, { damping: 20, stiffness: 300 });
      backdropOpacity.value = withTiming(1, { duration: 300 });
    } else {
      translateX.value = withSpring(-SIDEBAR_WIDTH, { damping: 20, stiffness: 300 });
      backdropOpacity.value = withTiming(0, { duration: 300 });
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
    const { translationX, velocityX } = event.nativeEvent;
    
    if (translationX < -50 || velocityX < -500) {
      translateX.value = withSpring(-SIDEBAR_WIDTH, { damping: 20, stiffness: 300 });
      backdropOpacity.value = withTiming(0, { duration: 300 });
      runOnJS(onClose)();
    } else {
      translateX.value = withSpring(0, { damping: 20, stiffness: 300 });
      backdropOpacity.value = withTiming(1, { duration: 300 });
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="none"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <PanGestureHandler onGestureEvent={gestureHandler}>
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
            </SafeAreaView>
          </Animated.View>
        </PanGestureHandler>
        <Animated.View style={[styles.modalBackground, backdropStyle]}>
          <TouchableOpacity style={styles.modalBackgroundTouchable} onPress={onClose} />
        </Animated.View>
      </View>
    </Modal>
  );
}

function EdgeSwipeHandler({ onSwipe, children }) {
  const edgeSwipeHandler = (event) => {
    'worklet';
    const { translationX, velocityX, absoluteX } = event.nativeEvent;
    
    // Nur reagieren wenn Swipe vom linken Rand startet (erste 20px)
    if (absoluteX < 20 && translationX > 50 && velocityX > 300) {
      runOnJS(onSwipe)();
    }
  };

  return (
    <PanGestureHandler onGestureEvent={edgeSwipeHandler}>
      <Animated.View style={{ flex: 1 }}>
        {children}
      </Animated.View>
    </PanGestureHandler>
  );
}

export default function App() {
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [activeScreen, setActiveScreen] = useState('Chat');
  const navigationRef = useRef();

  return (
    <KeyboardProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <NavigationContainer ref={navigationRef}>
          <EdgeSwipeHandler onSwipe={() => setSidebarVisible(true)}>
            <Tab.Navigator
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
              navigationRef.current?.navigate(screen);
            }}
          />
        </NavigationContainer>
      </GestureHandlerRootView>
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
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  sidebar: {
    width: SIDEBAR_WIDTH,
    backgroundColor: '#fff',
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  sidebarContent: {
    flex: 1,
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
