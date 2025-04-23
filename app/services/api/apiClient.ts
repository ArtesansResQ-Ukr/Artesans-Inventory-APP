import axios from 'axios';
import { getToken } from '../auth/tokenService';
import { apiConfig } from '../../config/apiConfig';
import { Platform } from 'react-native';

//This communicates with the backend

// Create API client with base URL from environment
const apiClient = axios.create(apiConfig);

console.log('API Client initialized with baseURL:', apiClient.defaults.baseURL);

// Add request interceptor to attach JWT token and region to all requests
apiClient.interceptors.request.use(
  async (config) => {
    const token = await getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Log the request for debugging (only in development)
    if (__DEV__) {
      console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`, 
        config.data ? config.data : '');
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle common errors
apiClient.interceptors.response.use(
  (response) => {
    // Log the response for debugging (only in development)
    if (__DEV__) {
      console.log(`API Response: ${response.status}`, response.data);
    }
    return response;
  },
  async (error) => {
    // Log the error for debugging
    if (__DEV__) {
      if (error.response) {
        console.error(`API Error ${error.response.status}:`, error.response.data);
      } else if (error.request) {
        console.error('API Error: No response received', error.request);
      } else {
        console.error('API Error:', error.message);
      }
    }
    
    // Handle 403 errors (expired token) by redirecting to login
    if (error.response && error.response.status === 403) {
      console.error('Authentication error: Token expired or invalid');
    }
    
    return Promise.reject(error);
  }
);

export default apiClient; 