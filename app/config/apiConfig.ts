import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { API_URL } from '@env';

// Determine API base URL based on platform and environment
export const getBaseUrl = (): string => {
  // Try to use API_URL from environment variables first
  if (API_URL) {
    console.log('Using API_URL from environment:', API_URL);
    return API_URL;
  }

  // Check for Expo config
  const expoConfig = Constants?.expoConfig?.extra?.backendUrl;
  if (expoConfig) {
    console.log('Using API URL from Expo config:', expoConfig);
    return expoConfig;
  }
  if (__DEV__) {
    // Platform-specific defaults
    if (Platform.OS === 'android') {
      // Special case for Android emulators - 10.0.2.2 is the host machine
      return 'http://10.0.2.2:8000';
    } else if (Platform.OS === 'ios') {
      // On iOS simulator, localhost points to the host machine
      return 'http://localhost:8000';
    } else {
    // Web or other platforms
      return API_URL || 'http://localhost:8000';
    }
  }
  else {
    return API_URL || 'http://localhost:8000';
  }
};

// Default API configuration
export const apiConfig = {
  baseURL: getBaseUrl(),
  timeout: 10000, // 10 seconds
  headers: {
    'Content-Type': 'application/json',
  },
}; 