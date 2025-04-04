import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { getToken } from '../services/auth/tokenService';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

//Navigation: Controls screen flow

// Import screens
import { LoginScreen } from '../screens/LoginScreen';
import ProductTypeSelection from '../screens/products/ProductTypeSelection';
import camera_screen from '../screens/camera/CameraScreen';
import TestCameraScreen from '../screens/camera/TestCameraScreen';
import NewProductReviewScreen from '../screens/products/NewProductReviewScreen';
import ExistingProductMatchScreen from '../screens/products/ExistingProductMatchScreen';

const Stack = createStackNavigator();
const NativeStack = createNativeStackNavigator();

/**
 * Main application navigator
 * Handles authentication state and navigation structure
 */
export const AppNavigator = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [userToken, setUserToken] = useState<string | null>(null);

  useEffect(() => {
    // Check for stored token on app start
    const checkToken = async () => {
      try {
        const token = await getToken();
        console.log('Token found:', token ? 'Yes' : 'No'); // Debug log
        setUserToken(token);
      } catch (error) {
        console.error('Error checking token:', error);
        setUserToken(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkToken();
  }, []);

  if (isLoading) {
    return null;
  }

  console.log('Current auth state:', userToken ? 'Authenticated' : 'Not authenticated'); // Debug log

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: true }}>
        {!userToken ? (
          // Auth screens
          <Stack.Screen 
            name="Login" 
            component={LoginScreen} 
            options={{ 
              headerShown: false
            }}
          />
        ) : (
          // App screens
          <>
            <Stack.Screen 
              name="ProductTypeSelection" 
              component={ProductTypeSelection} 
              options={{ title: 'Select Action' }}
            />
            <Stack.Screen 
              name="Camera" 
              component={CameraScreen}
              options={{ title: 'Scan Product' }}
            />
            <Stack.Screen 
              name="TestCamera" 
              component={TestCameraScreen}
              options={{ title: 'Camera & OCR Test' }}
            />
            <Stack.Screen
              name="NewProductReview"
              component={NewProductReviewScreen}
              options={{ title: 'New Product' }}
            />
            <Stack.Screen
              name="ExistingProductMatch"
              component={ExistingProductMatchScreen}
              options={{ title: 'Match Product' }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}; 