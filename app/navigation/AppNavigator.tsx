import React, { useEffect, useState } from 'react';
import { DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, View, StyleSheet, Platform, TextStyle, StatusBar, Text } from 'react-native';
import { useSelector } from 'react-redux';
import { useTheme } from 'react-native-paper';
import { RootState } from '../store';
import { useAuth } from '../contexts/AuthContext';
import { RootStackParamList } from './types/navigation';

// Import screens
import LoginScreen from '../screens/auth/LoginScreen';
import OTPLoginScreen from '../screens/auth/OTPLoginScreen';
import BiometricAuthScreen from '../screens/auth/BiometricAuthScreen';
import ProductTypeSelection from '../screens/products/ProductTypeSelection';
import CameraScreen from '../screens/camera/CameraScreen';
import NewProductReviewScreen from '../screens/products/NewProductReviewScreen';
import ExistingProductMatchScreen from '../screens/products/ExistingProductMatchScreen';
import ProductListScreen from '../screens/products/ProductListScreen';
import ProductHistoryScreen from '../screens/products/ProductHistoryScreen';
import TabNavigator from './TabNavigator';
import UserManagementScreen from '../screens/users/UserManagementScreen';
import { MyAccountScreen } from '../screens/users/MyAccoutScreen';
import HomeScreen from '../screens/home/HomeScreen';
import SecuritySettingsScreen from '../screens/settings/SecuritySettingsScreen';
import ViewAllUsers from '../screens/users/ViewAllUsers';
import CreateUserScreen from '../screens/users/CreateUserScreen';
import UpdateUserScreen from '../screens/users/UpdateUserScreen';
import ProfileScreen from '../screens/users/ProfileScreen';

// Define stack navigator types
export type AuthStackParamList = {
  Login: undefined;
  OTPLogin: undefined;
  BiometricAuth: undefined;
  ForgotPassword: undefined;
};

export type AppStackParamList = {
  // Main screens
  Home: undefined;
  MainTabs: undefined;
  
  // Product-related screens
  ProductTypeSelection: undefined;
  Camera: undefined;
  NewProductReview: {
    ocrResults?: any[];
    ocrText?: string;
  };
  ExistingProductMatch: {
    ocrResults?: any[];
    ocrText?: string;
  };
  
  // Product viewing screens
  ProductList: {
    userId?: string;
  };
  ProductHistory: {
    userId?: string;
  };

  // User management screens
  UserManagement: undefined;
  MyAccount: undefined;

  // Additional screens
  SecuritySettings: undefined;
  ChangePassword: undefined;

  // New screens
  Dashboard: undefined;
  Inventory: undefined;

  // User Management Screens
  ViewAllUsers: undefined;
  CreateUser: undefined;
  UpdateUser: undefined;
  ProfileScreen: undefined;
};

// Create stack navigators
const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const AppStack = createNativeStackNavigator<AppStackParamList>();

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
  
  // Common screen options with web adjustments
  const screenOptions = {
    headerStyle: {
      backgroundColor: theme.colors.surface,
    },
    headerTintColor: theme.colors.onSurface,
    headerTitleStyle: {
      fontWeight: '600' as TextStyle['fontWeight'],
    }
  };
  
  return (
    <View style={isWeb ? styles.webRootContainer : styles.mobileRootContainer}>
      <AppStack.Navigator
        screenOptions={{
          headerShown: false,
        }}
      >
        {/* Main Tab Navigator as the first screen for authenticated users */}
        <AppStack.Screen
          name="MainTabs"
          component={TabNavigator}
          options={{ 
            headerShown: false,
          }}
        />
        
        {/* Other app screens with shared layout */}
        
        <AppStack.Screen name="Inventory" component={ProductTypeSelection} />
        <AppStack.Screen name="Home" component={HomeScreen} />
        <AppStack.Screen name="UserManagement" component={UserManagementScreen} />
        <AppStack.Screen name="MyAccount" component={MyAccountScreen} />
        
        {/* User Management Screens */}
        <AppStack.Screen
          name="ViewAllUsers"
          component={ViewAllUsers}
          options={{
            headerShown: true,
            title: 'All Users',
          }}
        />
        <AppStack.Screen
          name="CreateUser"
          component={CreateUserScreen}
          options={{
            headerShown: true,
            title: 'Create User',
          }}
        />
        <AppStack.Screen
          name="UpdateUser"
          component={UpdateUserScreen}
          options={{
            headerShown: true,
            title: 'Update User',
          }}
        />
        <AppStack.Screen
          name="ProfileScreen"
          component={ProfileScreen}
          options={{
            headerShown: true,
            title: 'User Profile',
          }}
        />
        
        {/* Security Settings Screen */}
        <AppStack.Screen
          name="SecuritySettings"
          component={SecuritySettingsScreen}
          options={{
            headerShown: true,
            title: 'Security',
            headerTitleStyle: {
              fontWeight: '600',
            },
          }}
        />

        {/* Product management screens */}
        <AppStack.Screen 
          name="ProductTypeSelection" 
          component={ProductTypeSelection} 
          options={{ 
            title: 'Select Action',
            ...screenOptions
          }}
        />
        <AppStack.Screen 
          name="Camera" 
          component={CameraScreen}
          options={{ 
            title: 'Scan Product',
            ...screenOptions
          }}
        />
        <AppStack.Screen
          name="NewProductReview"
          component={NewProductReviewScreen}
          options={{ 
            title: 'New Product',
            ...screenOptions
          }}
        />
        <AppStack.Screen
          name="ExistingProductMatch"
          component={ExistingProductMatchScreen}
          options={{ 
            title: 'Match Product',
            ...screenOptions
          }}
        />
        <AppStack.Screen
          name="ProductList"
          component={ProductListScreen}
          options={{ 
            title: 'Product Inventory',
            ...screenOptions
          }}
        />
        <AppStack.Screen
          name="ProductHistory"
          component={ProductHistoryScreen}
          options={{ 
            title: 'Product History',
            ...screenOptions
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