import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Stores the authentication token securely
 */
export const storeToken = async (token: string): Promise<boolean> => {
  try {
    if (Platform.OS === 'web') {
      await AsyncStorage.setItem('userToken', token);
    } else {
      await SecureStore.setItemAsync('userToken', token);
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
      return await AsyncStorage.getItem('userToken');
    } else {
      return await SecureStore.getItemAsync('userToken');
    }
  } catch (error) {
    console.error('Error retrieving token:', error);
    return null;
  }
};

/**
 * Removes the authentication token
 */
export const removeToken = async (): Promise<boolean> => {
  try {
    if (Platform.OS === 'web') {
      await AsyncStorage.removeItem('userToken');
    } else {
      await SecureStore.deleteItemAsync('userToken');
    }
    return true;
  } catch (error) {
    console.error('Error removing token:', error);
    return false;
  }
};
