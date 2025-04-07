import * as SecureStore from 'expo-secure-store';
import { STORAGE_PREFIX } from '@env';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const TOKEN_KEY = 'storage_api_token';
const TOKEN_ADMIN_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1dWlkIjoiMjA5MzBkMmEtOTI5Mi00YzA1LWJmYWItZTAwZDY5OGIzZjI0IiwicGVybWlzc2lvbnMiOlsiY3JlYXRlX3VzZXIiLCJtYW5hZ2VfdXNlciIsImNyZWF0ZV9ncm91cCIsIm1hbmFnZV9ncm91cCIsImNyZWF0ZV9yb2xlIiwibWFuYWdlX3JvbGUiLCJyZWFkX3Byb2R1Y3RzIiwibWFuYWdlX3Byb2R1Y3RzIiwicmVhZF9oaXN0b3J5Il0sImdyb3VwX3V1aWQiOiI1M2U4NDYxMS1lOGU1LTRkYTctYTYzNi1kN2NmYTFhNGUxNzgiLCJleHAiOjE3NDQ2MTkwNDZ9.7DRLz4chJO5Gi3e8hhxU2cvwyvpbZv-rcj91IIeH0eo';
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
 * export const removeToken = async (): Promise<void> => {
  await storage.removeItem(TOKEN_KEY);
}; 
 */

