import apiClient from './apiClient';
import { AUTH_ENDPOINT } from '@env';

/**
 * Developer login service function
 * Used for authentication during development
 * 
 * @param uuid - The developer UUID from setup process
 * @returns Promise with the access token
 */
export const developerLogin = async (uuid: string) => {
  try {
    const response = await apiClient.post(`${AUTH_ENDPOINT}`, { uuid });
    return response.data.accessToken;
  } catch (error) {
    console.error('Developer login failed:', error);
    throw error;
  }
};

// PLACEHOLDER: Add production authentication functions here when implemented
// export const userLogin = async (credentials) => { ... } 