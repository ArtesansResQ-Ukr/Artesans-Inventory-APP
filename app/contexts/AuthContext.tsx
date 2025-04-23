import React, { createContext, useContext, useState, useEffect } from 'react';
import { Alert } from 'react-native';
import apiClient from '../services/api/apiClient';
import { storeToken, getToken, removeToken } from '../services/auth/tokenService';
import { AxiosError } from 'axios';

// Define the OTP data structure
interface OTPData {
  email: string;
  otp: string;
}

// Define the shape of our auth context
interface AuthContextType {
  isLoading: boolean;
  userToken: string | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  forgotPassword: (email: string) => Promise<boolean>;
  resetPassword: (token: string, newPassword: string) => Promise<boolean>;
  requestOTP: (email: string) => Promise<boolean>;
  verifyOTP: (email: string, otp: string) => Promise<boolean>;
}

// Create the context with a default value
const AuthContext = createContext<AuthContextType>({
  isLoading: true,
  userToken: null,
  isAuthenticated: false,
  login: async () => false,
  logout: async () => {},
  forgotPassword: async () => false,
  resetPassword: async () => false,
  requestOTP: async () => false,
  verifyOTP: async () => false,
});

// Hook to use the auth context
export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [userToken, setUserToken] = useState<string | null>(null);

  // Check if the user is authenticated (simply check if token exists)
  const isAuthenticated = userToken !== null;

  // Function to initialize the auth state
  const initialize = async () => {
    try {
      setIsLoading(true);
      console.log('AuthContext: Initializing authentication state');
      const token = await getToken();
      
      if (token) {
        console.log('AuthContext: Found existing token');
        setUserToken(token);
      } else {
        console.log('AuthContext: No token found, user is not authenticated');
        setUserToken(null);
      }
    } catch (error) {
      console.error('AuthContext: Error initializing auth:', error);
      Alert.alert('Authentication Error', 'There was a problem initializing authentication.');
    } finally {
      setIsLoading(false);
    }
  };

  // Run initialize on component mount
  useEffect(() => {
    console.log('AuthContext: Provider mounted');
    initialize();
  }, []);

  // Login function - updated to use apiClient
  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      console.log(`AuthContext: Attempting login for user: ${username}`);
      
      // Create form data for x-www-form-urlencoded request
      const formData = new URLSearchParams();
      formData.append('username', username);
      formData.append('password', password);

      console.log('AuthContext: Sending login request to backend');
      const response = await apiClient.post('/auth/token', formData.toString(), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      console.log('AuthContext: Login response received', response.status);
      if (response.status === 200) {
        const token = response.data.access_token;
        console.log('AuthContext: Login successful, token received');
        
        // Store the token
        await storeToken(token);
        setUserToken(token);
        return true;
      }
      console.log('AuthContext: Login failed, invalid response status');
      return false;
    } catch (error: unknown) {
      if (error instanceof AxiosError && error.response) {
        console.error('AuthContext: Login error with response:', error.response.status, error.response.data);
        Alert.alert('Login Failed', `Server responded with error: ${error.response.status}`);
      } else if (error instanceof AxiosError && error.request) {
        console.error('AuthContext: Login request error, no response received:', error.request);
        Alert.alert('Login Failed', 'No response from server. Please check your connection.');
      } else {
        console.error('AuthContext: Login error:', error);
        Alert.alert('Login Failed', 'An unexpected error occurred.');
      }
      return false;
    }
  };

  // Request OTP function - updated to use apiClient
  const requestOTP = async (email: string): Promise<boolean> => {
    try {
      console.log(`AuthContext: Requesting OTP for email: ${email}`);
      // Send email as a query parameter instead of in the request body
      const response = await apiClient.post(`/auth/request-otp?email=${email}`);
      console.log('AuthContext: OTP request response received', response.status);
      return response.status === 200;
    } catch (error: unknown) {
      if (error instanceof AxiosError && error.response) {
        console.error('AuthContext: OTP request error with response:', error.response.status, error.response.data);
      } else {
        console.error('AuthContext: OTP request error:', error);
      }
      return false;
    }
  };

  // Verify OTP function - updated to use apiClient
  const verifyOTP = async (email: string, otp: string): Promise<boolean> => {
    try {
      console.log(`AuthContext: Verifying OTP for email: ${email}`);
      const response = await apiClient.post(`/auth/verify-otp-endpoint?email=${email}&otp=${otp}`);
      console.log('AuthContext: OTP verification response received', response.status);

      if (response.status === 200) {
        const token = response.data.access_token;
        console.log('AuthContext: OTP verification successful, token received');
        
        // Store the token
        await storeToken(token);
        setUserToken(token);
        return true;
      }
      console.log('AuthContext: OTP verification failed, invalid response status');
      return false;
    } catch (error: unknown) {
      if (error instanceof AxiosError && error.response) {
        console.error('AuthContext: OTP verification error with response:', error.response.status, error.response.data);
      } else {
        console.error('AuthContext: OTP verification error:', error);
      }
      return false;
    }
  };

  // Logout function
  const logout = async (): Promise<void> => {
    console.log('AuthContext: Logging out user');
    await removeToken();
    setUserToken(null);
    console.log('AuthContext: User logged out successfully');
  };

  // Forgot password function - updated to use apiClient
  const forgotPassword = async (email: string): Promise<boolean> => {
    try {
      console.log(`AuthContext: Requesting password reset for email: ${email}`);
      const response = await apiClient.post(`/auth/password-reset/request`,{email});
      console.log('AuthContext: Password reset request response received', response.status);
      return response.status === 200;
    } catch (error: unknown) {
      if (error instanceof AxiosError && error.response) {
        console.error('AuthContext: Password reset error with response:', error.response.status, error.response.data);
      } else {
        console.error('AuthContext: Password reset error:', error);
      }
      return false;
    }
  };

  // Reset password function - updated to use apiClient
  const resetPassword = async (token: string, newPassword: string): Promise<boolean> => {
    try {
      console.log('AuthContext: Confirming password reset');
      const response = await apiClient.post(`/auth/password-reset/confirm`,{token, new_password: newPassword});
      console.log('AuthContext: Password reset confirmation response received', response.status);
      return response.status === 200;
    } catch (error: unknown) {
      if (error instanceof AxiosError && error.response) {
        console.error('AuthContext: Password reset confirmation error with response:', error.response.status, error.response.data);
      } else {
        console.error('AuthContext: Password reset confirmation error:', error);
      }
      return false;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isLoading,
        userToken,
        isAuthenticated,
        login,
        logout,
        forgotPassword,
        resetPassword,
        requestOTP,
        verifyOTP,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext; 