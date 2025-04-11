import axios from 'axios';
import { getToken } from '../auth/tokenService';
import { API_URL } from '@env';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

//This communicates with the backend

// Determine host based on platform
const getBaseUrl = () => {
  const defaultUrl = Constants?.expoConfig?.extra?.backendUrl;

  if (Platform.OS === 'android') {
    // Special case for Android emulators
    return 'http://10.0.2.2:8000';
  }

  return API_URL ?? 'http://localhost:8000';
};

// Create API client with base URL from environment
const apiClient = axios.create({
  baseURL: getBaseUrl(),
});


// Add request interceptor to attach JWT token and region to all requests
apiClient.interceptors.request.use(
  async (config) => {
    const token = await getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle common errors
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Handle 403 errors (expired token) by redirecting to login
    if (error.response && error.response.status === 403) {
      // TODO: Implement redirect to login
      console.error('Authentication error: Token expired or invalid');
    }
    return Promise.reject(error);
  }
);

export default apiClient; 