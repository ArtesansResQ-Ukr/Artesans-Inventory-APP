import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { jwtDecode } from 'jwt-decode';

// Keys for storage
const TOKEN_KEY = 'userToken';
const BIOMETRIC_ENABLED_KEY = 'biometricEnabled';

/**
 * Stores the authentication token securely
 */
export const storeToken = async (token: string): Promise<boolean> => {
  try {
    if (Platform.OS === 'web') {
      await AsyncStorage.setItem(TOKEN_KEY, token);
    } else {
      await SecureStore.setItemAsync(TOKEN_KEY, token);
    }
    return true;
  } catch (error) {
    console.error('Error storing token:', error);
    return false;
  }
};

/**
 * Retrieves the authentication token
 */
export const getToken = async (): Promise<string | null> => {
  try {
    if (Platform.OS === 'web') {
      return await AsyncStorage.getItem(TOKEN_KEY);
    } else {
      return await SecureStore.getItemAsync(TOKEN_KEY);
    }
  } catch (error) {
    console.error('Error retrieving token:', error);
    return null;
  }
};

/**
 * Removes the authentication token
 */
export const deleteToken = async (): Promise<boolean> => {
  try {
    if (Platform.OS === 'web') {
      await AsyncStorage.removeItem(TOKEN_KEY);
    } else {
      await SecureStore.deleteItemAsync(TOKEN_KEY);
    }
    return true;
  } catch (error) {
    console.error('Error removing token:', error);
    return false;
  }
};

/**
 * Set biometric login preference
 */
export const setBiometricEnabled = async (enabled: boolean): Promise<boolean> => {
  try {
    const value = enabled ? 'true' : 'false';
    if (Platform.OS === 'web') {
      await AsyncStorage.setItem(BIOMETRIC_ENABLED_KEY, value);
    } else {
      await SecureStore.setItemAsync(BIOMETRIC_ENABLED_KEY, value);
    }
    return true;
  } catch (error) {
    console.error('Error storing biometric preference:', error);
    return false;
  }
};

/**
 * Get biometric login preference
 */
export const isBiometricEnabled = async (): Promise<boolean> => {
  try {
    let value: string | null = null;
    if (Platform.OS === 'web') {
      value = await AsyncStorage.getItem(BIOMETRIC_ENABLED_KEY);
    } else {
      value = await SecureStore.getItemAsync(BIOMETRIC_ENABLED_KEY);
    }
    return value === 'true';
  } catch (error) {
    console.error('Error retrieving biometric preference:', error);
    return false;
  }
};

/**
 * Check if the token is valid and not expired
 */
export const isTokenValid = (token: string): boolean => {
  try {
    if (!token) return false;

    // Decode the JWT to get its payload
    const decodedToken: any = jwtDecode(token);
    
    // Get current time in seconds
    const currentTime = Math.floor(Date.now() / 1000);
    
    // Check if token is expired
    if (decodedToken.exp && decodedToken.exp < currentTime) {
      console.log('Token is expired');
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error validating token:', error);
    return false;
  }
};

export const removeSession = async (): Promise<boolean> => {
  try {
    await deleteToken();
    return true;
  } catch (error) {
    console.error('Error removing session:', error);
    return false;
  }
};
