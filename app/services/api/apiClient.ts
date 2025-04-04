import axios from 'axios';
import { getToken } from '../auth/tokenService';
import { API_URL } from '@env';

//This communicates with the backend

// Create API client with base URL from environment
const apiClient = axios.create({
  baseURL: API_URL,
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