import React, { useEffect, useState } from 'react';
import { DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, View, StyleSheet, Platform, TextStyle, StatusBar, Text } from 'react-native';
import { useSelector } from 'react-redux';
import { useTheme } from 'react-native-paper';
import { RootState } from '../store';
import { useAuth } from '../contexts/AuthContext';
import { RootStackParamList, AuthStackParamList } from './types/navigation';


// Import screens
import LoginScreen from '../screens/auth/LoginScreen';
import OTPLoginScreen from '../screens/auth/OTPLoginScreen';
import BiometricAuthScreen from '../screens/auth/BiometricAuthScreen';
import TabNavigator from './TabNavigator';

// Create stack navigators
const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const AppStack = createNativeStackNavigator<RootStackParamList>();

// Auth navigator (when user is not logged in)
export const AuthNavigator = () => {
  const isWeb = Platform.OS === 'web';
  
  return (
    <View style={isWeb ? styles.webAuthContainer : styles.mobileAuthContainer}>
      <AuthStack.Navigator 
        screenOptions={{ 
          headerShown: false
        }}
      >
        <AuthStack.Screen name="Login" component={LoginScreen} />
        <AuthStack.Screen name="OTPLogin" component={OTPLoginScreen} />
        <AuthStack.Screen name="BiometricAuth" component={BiometricAuthScreen} />
      </AuthStack.Navigator>
    </View>
  );
};

// App navigator (when user is logged in)
const AppNavigator: React.FC = () => {
  const isWeb = Platform.OS === 'web';
  const theme = useTheme();
  
  return (
    <View style={isWeb ? styles.webRootContainer : styles.mobileRootContainer}>
      <AppStack.Navigator
        screenOptions={{
          headerShown: false,
        }}
      >
        {/* TabNavigator contains all the screens now */}
        <AppStack.Screen
          name="MainTabs"
          component={TabNavigator}
          options={{ 
            headerShown: false,
          }}
        />
      </AppStack.Navigator>
    </View>
  );
};

// Root navigator that switches between Auth and App navigators
const RootNavigator = () => {
  const { isAuthenticated } = useSelector(
    (state: RootState) => state.auth
  );
  return (
    isAuthenticated ? <AppNavigator /> : <AuthNavigator />
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  webRootContainer: {
    flex: 1,
    width: '100%',
  },
  mobileRootContainer: {
    flex: 1,
  },
  webAuthContainer: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  mobileAuthContainer: {
    flex: 1,
  },
});

export default RootNavigator; 