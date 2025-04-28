import React, { createContext, useContext, useState, useEffect } from 'react';
import { Alert } from 'react-native';
import apiClient from '../services/api/apiClient';
import { 
  storeToken, 
  getToken, 
  deleteToken, 
  setBiometricEnabled, 
  isBiometricEnabled, 
  isTokenValid 
} from '../services/auth/tokenService';
import { AxiosError } from 'axios';
import * as LocalAuthentication from 'expo-local-authentication';
import { useDispatch } from 'react-redux';
import { setAuthenticated, setUnauthenticated } from '../store/slices/authSlice';

// User type for profile data
interface User {
  uuid: string;
  email: string;
  username: string;
  permissions: string[];
  group_uuid: string;
}

// Define the OTP data structure
interface OTPData {
  email: string;
  otp: string;
}

// Define the shape of our auth context
interface AuthContextType {
  isLoading: boolean;
  userToken: string | null;
  user: User | null;
  isAuthenticated: boolean;
  biometricEnabled: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  forgotPassword: (email: string) => Promise<boolean>;
  requestNewPassword: (email: string) => Promise<boolean>;
  changePassword: (old_password: string, new_password: string, confirm_new_password: string) => Promise<boolean>;
  requestOTP: (email: string) => Promise<boolean>;
  verifyOTP: (email: string, otp: string) => Promise<boolean>;
  enableBiometricLogin: (enable: boolean) => Promise<boolean>;
  authenticateWithBiometrics: () => Promise<boolean>;
}

// Create the context with a default value
const AuthContext = createContext<AuthContextType>({
  isLoading: true,
  userToken: null,
  user: null,
  isAuthenticated: false,
  biometricEnabled: false,
  login: async () => false,
  logout: async () => {},
  forgotPassword: async () => false,
  requestNewPassword: async () => false,
  changePassword: async () => false,
  requestOTP: async () => false,
  verifyOTP: async () => false,
  enableBiometricLogin: async () => false,
  authenticateWithBiometrics: async () => false,
});

// Hook to use the auth context
export const useAuth = () => useContext(AuthContext);

// Setup axios interceptor to include token in requests
const setupAuthInterceptor = (token: string) => {
  apiClient.interceptors.request.use(
    config => {
      config.headers.Authorization = `Bearer ${token}`;
      return config;
    },
    error => {
      return Promise.reject(error);
    }
  );
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [userToken, setUserToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [biometricEnabled, setBiometricEnabledState] = useState<boolean>(false);
  const dispatch = useDispatch();

  // Check if the user is authenticated (check if token exists and user data is loaded)
  const isAuthenticated = userToken !== null && user !== null;

  // Function to fetch user profile from API or decode from token
  const fetchUserProfile = async (token: string, useBiometric: boolean = false): Promise<User | null> => {
    try {
      // Setup auth interceptor with the token
      setupAuthInterceptor(token);
      
      // If using biometric login, decode from token
      if (useBiometric) {
        console.log('AuthContext: Using biometric login, decoding profile from token');
        const tokenParts = token.split('.');
        if (tokenParts.length !== 3) {
          console.error('Invalid token format');
          return null;
        }
        
        // Decode the payload part (second part) of the JWT
        const payload = JSON.parse(atob(tokenParts[1]));
        
        return {
          uuid: payload.uuid,
          email: payload.email || '',
          username: payload.sub,
          permissions: payload.permissions || [],
          group_uuid: payload.group_uuid || ''
        };
      } 
      // For regular login, fetch from API
      else {
        console.log('AuthContext: Regular login, fetching profile from API');
        const response = await apiClient.get('/users/me');
        if (response.status === 200) {
          return response.data;
        }
        return null;
      }
    } catch (error) {
      console.error('Error fetching/decoding user profile:', error);
      return null;
    }
  };

  // Function to initialize the auth state
  const initialize = async () => {
    try {
      setIsLoading(true);
      console.log('AuthContext: Initializing authentication state');
      
      // Check if biometric auth is enabled
      const bioEnabled = await isBiometricEnabled();
      setBiometricEnabledState(bioEnabled);
      console.log('AuthContext: Biometric authentication enabled:', bioEnabled);
      
      // Get the saved token for our local state
      const token = await getToken();
      
      if (token) {
        console.log('AuthContext: Found existing token');
        
        // Check if token is valid (not expired)
        if (isTokenValid(token)) {
          console.log('AuthContext: Token is valid');
          
          // Setup auth interceptor
          setupAuthInterceptor(token);
          
          // Fetch user profile
          const userProfile = await fetchUserProfile(token);
          if (userProfile) {
            // Set user data and token
            setUserToken(token);
            setUser(userProfile);
            
            // Update Redux state
            dispatch(setAuthenticated({ token, user: userProfile }));
            
            console.log('AuthContext: User profile loaded');
          } else {
            // Token valid but couldn't fetch profile
            console.log('AuthContext: Could not fetch user profile, logging out');
            await deleteToken();
            setUserToken(null);
            setUser(null);
            
            // Update Redux state
            dispatch(setUnauthenticated());
          }
        } else {
          console.log('AuthContext: Token is expired, removing it');
          await deleteToken();
          setUserToken(null);
          setUser(null);
          
          // Update Redux state
          dispatch(setUnauthenticated());
        }
      } else {
        console.log('AuthContext: No token found, user is not authenticated');
        setUserToken(null);
        setUser(null);
        
        // Update Redux state
        dispatch(setUnauthenticated());
      }
    } catch (error) {
      console.error('AuthContext: Error initializing auth:', error);
      Alert.alert('Authentication Error', 'There was a problem initializing authentication.');
      setUserToken(null);
      setUser(null);
      
      // Update Redux state
      dispatch(setUnauthenticated());
    } finally {
      setIsLoading(false);
    }
  };

  // Run initialize on component mount
  useEffect(() => {
    console.log('AuthContext: Provider mounted');
    initialize();
  }, []);

  // Login function - updated to fetch user profile after login
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
        
        // Setup auth interceptor
        setupAuthInterceptor(token);
        
        // Fetch user profile
        const userProfile = await fetchUserProfile(token);
        if (userProfile) {
          // Set user data and token
          setUserToken(token);
          setUser(userProfile);
          
          // Update Redux state
          dispatch(setAuthenticated({ token, user: userProfile }));
          
          console.log('AuthContext: User profile loaded');
          return true;
        } else {
          console.log('AuthContext: Could not fetch user profile');
          Alert.alert('Login Error', 'Could not fetch user profile');
          return false;
        }
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

  // Verify OTP function - updated to fetch user profile
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
        
        // Setup auth interceptor
        setupAuthInterceptor(token);
        
        // Fetch user profile
        const userProfile = await fetchUserProfile(token);
        if (userProfile) {
          // Set user data and token
          setUserToken(token);
          setUser(userProfile);
          
          // Update Redux state
          dispatch(setAuthenticated({ token, user: userProfile }));
          
          console.log('AuthContext: User profile loaded');
          return true;
        } else {
          console.log('AuthContext: Could not fetch user profile');
          Alert.alert('Authentication Error', 'Could not fetch user profile');
          return false;
        }
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

  // Authenticate with biometrics
  const authenticateWithBiometrics = async (): Promise<boolean> => {
    try {
      console.log('AuthContext: Authenticating with biometrics');
      
      // Check if biometric auth is enabled in app settings
      if (!biometricEnabled) {
        console.log('AuthContext: Biometric authentication is not enabled');
        return false;
      }
      
      // Check if device supports biometrics
      const compatible = await LocalAuthentication.hasHardwareAsync();
      if (!compatible) {
        console.log('AuthContext: Device does not support biometric authentication');
        return false;
      }
      
      // Check if biometric data is enrolled
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      if (!isEnrolled) {
        console.log('AuthContext: No biometric data enrolled on device');
        return false;
      }
      
      // Attempt authentication
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Authenticate to access your account',
        disableDeviceFallback: true,
      });
      
      if (result.success) {
        console.log('AuthContext: Biometric authentication successful');
        
        // Get the token and validate it
        const token = await getToken();
        if (token && isTokenValid(token)) {
          console.log('AuthContext: Token is valid, setting user as authenticated');
          
          // Setup auth interceptor
          setupAuthInterceptor(token);
          
          // Fetch user profile
          const userProfile = await fetchUserProfile(token, true);
          if (userProfile) {
            // Set user data and token
            setUserToken(token);
            setUser(userProfile);
            
            // Update Redux state
            dispatch(setAuthenticated({ token, user: userProfile }));
            
            console.log('AuthContext: User profile loaded');
            return true;
          } else {
            console.log('AuthContext: Could not fetch user profile');
            await deleteToken();
            setUserToken(null);
            setUser(null);
            
            // Update Redux state
            dispatch(setUnauthenticated());
            return false;
          }
        } else {
          console.log('AuthContext: Token is expired or invalid');
          await deleteToken();
          setUserToken(null);
          setUser(null);
          
          // Update Redux state
          dispatch(setUnauthenticated());
          return false;
        }
      } else {
        console.log('AuthContext: Biometric authentication failed');
        return false;
      }
    } catch (error) {
      console.error('AuthContext: Error during biometric authentication:', error);
      return false;
    }
  };

  // Logout function - updated to clear user data
  const logout = async (): Promise<void> => {
    console.log('AuthContext: Logging out user');
    
    // Only delete the token if biometric login is not enabled
    if (!biometricEnabled) {
      console.log('AuthContext: Biometric login not enabled, deleting token');
      await deleteToken();
    } else {
      console.log('AuthContext: Biometric login enabled, preserving token');
    }
    
    // Always clear the user data and token from state to log the user out
    setUserToken(null);
    setUser(null);
    
    // Update Redux state
    dispatch(setUnauthenticated());
    
    console.log('AuthContext: User logged out successfully');
  };

  // Enable or disable biometric login
  const enableBiometricLogin = async (enable: boolean): Promise<boolean> => {
    try {
      console.log(`AuthContext: ${enable ? 'Enabling' : 'Disabling'} biometric login`);
      
      // Check if device supports biometrics
      if (enable) {
        const compatible = await LocalAuthentication.hasHardwareAsync();
        if (!compatible) {
          console.log('AuthContext: Device does not support biometric authentication');
          Alert.alert(
            'Biometric Authentication Not Supported',
            'Your device does not support biometric authentication.'
          );
          return false;
        }

        // Check if biometric data is enrolled
        const isEnrolled = await LocalAuthentication.isEnrolledAsync();
        if (!isEnrolled) {
          console.log('AuthContext: No biometric data enrolled on device');
          Alert.alert(
            'Biometric Authentication Not Set Up',
            'Please set up biometric authentication in your device settings.'
          );
          return false;
        }
      }
      
      // Update biometric login preference
      const success = await setBiometricEnabled(enable);
      if (success) {
        setBiometricEnabledState(enable);
        return true;
      }
      return false;
    } catch (error) {
      console.error('AuthContext: Error updating biometric login preference:', error);
      Alert.alert('Error', 'Failed to update biometric login preference');
      return false;
    }
  };

  // Request OTP function - no changes needed
  const requestOTP = async (email: string): Promise<boolean> => {
    try {
      console.log(`AuthContext: Requesting OTP for email: ${email}`);
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
  
   // Request new password function
   const requestNewPassword = async (email: string): Promise<boolean> => {
    try {
      console.log('AuthContext: Requesting new password');
      const response = await apiClient.post(`/auth/request-new-password?email=${email}`);
      console.log('AuthContext: New password request response received', response.status);
      return true;
    } catch (error: unknown) {
      if (error instanceof AxiosError && error.response) {
        console.error('AuthContext: New password request error with response:', error.response.status, error.response.data);
        const backendMessage = error.response.data?.detail || 'An unknown error occurred';
        Alert.alert('New Password Request Error', backendMessage);
      } else {
        console.error('AuthContext: New password request error:', error);
        Alert.alert('New Password Request Error', 'An unexpected error occurred');
      }
      return false;
    }
  };



  // Forgot password function - no changes needed
  const changePassword = async (
    old_password: string,
    new_password: string,
    confirm_new_password: string
  ): Promise<boolean> => {
    try {
      const response = await apiClient.post('/auth/password-change', {
        old_password,
        new_password,
        confirm_new_password});
  
      console.log('Password changed successfully', response.data);
      return true;
  
    } catch (error: unknown) {
      if (error instanceof AxiosError && error.response) {
        console.error('Change Password error:', error.response.status, error.response.data);
  
        // Show backend error detail nicely
        const backendMessage = error.response.data?.detail || 'An unknown error occurred';
  
        Alert.alert('Password Change Error', backendMessage);
      } else {
        console.error('Unexpected Password Change error:', error);
        Alert.alert('Password Change Error', 'An unexpected error occurred');
      }
      return false;
    }
  };

 
  return (
    <AuthContext.Provider
      value={{
        isLoading,
        userToken,
        user,
        isAuthenticated,
        biometricEnabled,
        login,
        logout,
        forgotPassword: requestNewPassword,
        requestNewPassword,
        changePassword,
        requestOTP,
        verifyOTP,
        enableBiometricLogin,
        authenticateWithBiometrics,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext; 