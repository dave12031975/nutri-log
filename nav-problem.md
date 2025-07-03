# Navigation Problem - Fresh Expo App

## Problem Description

The Fresh Expo React Native app has a critical navigation issue in the custom sidebar navigation system. When users try to navigate from Chat to Profile (or vice versa) via the sidebar menu, the app crashes completely.

## Technical Setup

- **Framework**: React Native with Expo SDK 53
- **Navigation**: React Navigation v6 with Bottom Tab Navigator (hidden tabs)
- **Custom UI**: Custom sidebar overlay with gesture handling
- **Architecture**: AuthProvider + conditional navigation based on login status

## Current Architecture

```javascript
function MainApp() {
  const { user, loading } = useAuth();
  
  return (
    <NavigationContainer>
      {user ? (
        <MainTabNavigator navigationRef={navigationRef} />
      ) : (
        <AuthStack />
      )}
    </NavigationContainer>
  );
}

function MainTabNavigator({ navigationRef }) {
  const [activeScreen, setActiveScreen] = useState('Chat');
  const tabNavigationRef = useRef();
  
  return (
    <Tab.Navigator ref={tabNavigationRef}>
      <Tab.Screen name="Chat" component={ChatScreen} />
      <Tab.Screen name="Profil" component={ProfileScreen} />
    </Tab.Navigator>
  );
}
```

## Navigation Flow

1. User opens custom sidebar (gesture or menu button)
2. User clicks "Profil" or "Chat" in sidebar
3. `handleNavigate(screen)` is called
4. **App crashes here**

## Approaches Attempted

### Attempt 1: Direct ref.navigate()
```javascript
tabNavigationRef.current?.navigate(screen);
```
**Result**: `tabNavigationRef.current` was always `null`

### Attempt 2: State-based navigation with key prop
```javascript
const [targetScreen, setTargetScreen] = useState('Chat');

<Tab.Navigator 
  key={targetScreen}
  initialRouteName={targetScreen}
>
```
**Result**: Navigation worked one-way (to Profile) but not back to Chat

### Attempt 3: setTimeout + navigate
```javascript
setTimeout(() => {
  if (tabNavigationRef.current) {
    tabNavigationRef.current.navigate(screen);
  }
}, 100);
```
**Result**: Still `tabNavigationRef.current` was `null`

### Attempt 4: React Navigation reset()
```javascript
tabNavigationRef.current.reset({
  index: screen === 'Chat' ? 0 : 1,
  routes: [
    { name: 'Chat' },
    { name: 'Profil' }
  ],
});
```
**Result**: App crashed completely

### Attempt 5: jumpTo() method
```javascript
tabNavigationRef.current.jumpTo(screen);
```
**Result**: Still crashes, same as reset()

## Current Error Pattern

```
LOG  Navigating to: Profil
Running "main" with {"rootTag":1,"initialProps":null,"fabric":true}
App.js:356 Navigating to: Profil
Welcome to React Native DevTools
Debugger integration: ios Bridgeless (RCTHost)
[App crashes - no error message, just restarts]
```

## Theories

1. **Ref Timing Issue**: `tabNavigationRef` is not properly attached to the Tab.Navigator
2. **React Navigation Version Conflict**: Potential incompatibility with Expo SDK 53
3. **Custom Gesture Handler Interference**: The EdgeSwipeHandler might be interfering
4. **Modal Overlay Conflict**: The custom sidebar uses Modal which might conflict with navigation
5. **State Management Issue**: Race condition between `setActiveScreen` and navigation

## Current Code Structure

- **Custom Sidebar**: Modal overlay with gesture handling
- **Hidden Tab Bar**: `tabBarStyle: { display: 'none' }`
- **Custom Header**: Manual header implementation
- **Animated Sidebar**: Uses `react-native-reanimated` for smooth animations

## Desired Behavior

- User clicks sidebar menu item
- Sidebar closes smoothly
- Tab Navigator switches to the correct screen
- No crashes, bidirectional navigation works

## Additional Context

- Apple Sign-In authentication works perfectly
- Email/password login has separate issues
- Profile screen displays correctly when accessible
- Chat screen works fine as default screen
- App only crashes during navigation, not during other operations

## Request

Need a robust solution for reliable tab navigation from custom sidebar that:
1. Doesn't crash the app
2. Works bidirectionally (Chat ↔ Profile)  
3. Maintains the current custom UI/UX
4. Is compatible with the existing gesture system and auth flow