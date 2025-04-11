import * as SecureStore from 'expo-secure-store';
import { STORAGE_PREFIX } from '@env';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const TOKEN_KEY = 'storage_api_token';

// Use SecureStore on native platforms, AsyncStorage for web
const storage = Platform.OS === 'web' ? AsyncStorage : SecureStore;

/**
 * Stores JWT token securely
 * @param token - The JWT token to store
 */
export const storeToken = async (token: string): Promise<void> => {
  await storage.setItem(TOKEN_KEY, token);
};

/**
 * Retrieves JWT token from secure storage
 * @returns The stored JWT token or null if not found
 */
export const getToken = async (): Promise<string | null> => {
  return await storage.getItem(TOKEN_KEY);
};

/**
 * Removes JWT token from storage (used for logout)
 * 
 */
export const removeToken = async (): Promise<void> => {
  if (Platform.OS === 'web') {
    await AsyncStorage.removeItem(TOKEN_KEY);
  } else {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
  }
};
