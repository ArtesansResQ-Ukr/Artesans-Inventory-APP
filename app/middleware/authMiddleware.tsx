import React, { useEffect } from 'react';
import { Alert } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import jwtDecode from 'jwt-decode';
import { RootState, AppDispatch } from '../store';
import { logout } from '../store/slices/authSlice';

interface JWTPayload {
  exp: number;
}

/**
 * AuthMiddleware component checks for token expiration on mount
 * and during navigation. It uses Redux for state management.
 */
export const AuthMiddleware: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { token, isAuthenticated } = useSelector((state: RootState) => state.auth);

  // Function to check if token is expired
  const checkTokenExpiration = () => {
    if (!token || !isAuthenticated) return;

    try {
      // Decode the token to get expiration time
      const decoded = jwtDecode<JWTPayload>(token);
      const currentTime = Math.floor(Date.now() / 1000);

      // If token is about to expire in the next 5 minutes, show a warning
      if (decoded.exp - currentTime < 300) {
        Alert.alert(
          'Session Expiring Soon',
          'Your session will expire soon. Please save your work and log in again.',
          [
            { text: 'OK', onPress: () => {} },
            { 
              text: 'Logout Now', 
              onPress: () => dispatch(logout()),
              style: 'destructive'
            }
          ]
        );
      }

      // If token is expired, log out automatically
      if (decoded.exp < currentTime) {
        Alert.alert(
          'Session Expired',
          'Your session has expired. Please log in again.',
          [{ text: 'OK', onPress: () => dispatch(logout()) }]
        );
      }
    } catch (error) {
      console.error('Error checking token expiration:', error);
      // If there's an error decoding the token, log out as a precaution
      dispatch(logout());
    }
  };

  // Check token expiration on component mount and when token changes
  useEffect(() => {
    if (isAuthenticated) {
      checkTokenExpiration();

      // Set up a timer to check for token expiration periodically (every minute)
      const interval = setInterval(checkTokenExpiration, 60000);
      return () => clearInterval(interval);
    }
  }, [token, isAuthenticated]);

  return <>{children}</>;
};

export default AuthMiddleware; 