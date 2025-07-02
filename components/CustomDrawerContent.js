import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { DrawerContentScrollView } from '@react-navigation/drawer';

export default function CustomDrawerContent(props) {
  const { navigation, state } = props;
  
  return (
    <SafeAreaView style={styles.container}>
      <DrawerContentScrollView {...props} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Ionicons name="chatbubbles" size={32} color="#007AFF" />
            <Text style={styles.appName}>Fresh Expo</Text>
          </View>
        </View>
        
        <View style={styles.menuSection}>
          <TouchableOpacity
            style={[
              styles.menuItem,
              state.index === 0 && styles.activeMenuItem
            ]}
            onPress={() => navigation.navigate('Chat')}
          >
            <Ionicons 
              name={state.index === 0 ? 'chatbubbles' : 'chatbubbles-outline'} 
              size={24} 
              color={state.index === 0 ? '#007AFF' : '#666'} 
            />
            <Text style={[
              styles.menuText,
              state.index === 0 && styles.activeMenuText
            ]}>
              Chat
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.menuItem,
              state.index === 1 && styles.activeMenuItem
            ]}
            onPress={() => navigation.navigate('Profil')}
          >
            <Ionicons 
              name={state.index === 1 ? 'person' : 'person-outline'} 
              size={24} 
              color={state.index === 1 ? '#007AFF' : '#666'} 
            />
            <Text style={[
              styles.menuText,
              state.index === 1 && styles.activeMenuText
            ]}>
              Profil
            </Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.footer}>
          <Text style={styles.version}>Version 1.0.0</Text>
        </View>
      </DrawerContentScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    flex: 1,
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  appName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
    marginLeft: 12,
  },
  menuSection: {
    flex: 1,
    paddingTop: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    marginHorizontal: 10,
    borderRadius: 12,
  },
  activeMenuItem: {
    backgroundColor: '#f0f8ff',
  },
  menuText: {
    fontSize: 16,
    marginLeft: 15,
    color: '#666',
    fontWeight: '500',
  },
  activeMenuText: {
    color: '#007AFF',
    fontWeight: '600',
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    alignItems: 'center',
  },
  version: {
    fontSize: 12,
    color: '#999',
  },
});