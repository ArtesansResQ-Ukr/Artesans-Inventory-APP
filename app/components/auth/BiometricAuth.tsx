import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, Alert, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import { getToken } from '../../services/auth/tokenService';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigation } from '@react-navigation/native';

interface BiometricAuthProps {
  tokenKey?: string;           // SecureStore key for the JWT token (optional)
  onSuccess?: (token: string) => void;
  onFailure?: (error: Error) => void;
  promptMessage?: string;      // Message shown in authentication prompt
  cancelLabel?: string;        // Custom label for cancel button
  fallbackLabel?: string;      // Custom label for fallback button
  buttonText?: string;         // Text for the authentication button
}

const BiometricAuth: React.FC<BiometricAuthProps> = ({
  tokenKey = 'userToken',  // Default to 'userToken' if not provided
  onSuccess,
  onFailure,
  promptMessage = 'Authenticate to access your account',
  cancelLabel = 'Cancel',
  fallbackLabel = 'Use Passcode',
  buttonText = 'Authenticate with Face ID',
}) => {
  const { authenticateWithBiometrics, login } = useAuth(); // Use AuthContext for authentication
  const [isCompatible, setIsCompatible] = useState<boolean>(false);
  const [biometricType, setBiometricType] = useState<string>('');
  const [isAuthenticating, setIsAuthenticating] = useState<boolean>(false);
  const navigation = useNavigation();

  // Check if device supports biometric authentication
  useEffect(() => {
    (async () => {
      const compatible = await LocalAuthentication.hasHardwareAsync();
      setIsCompatible(compatible);

      if (compatible) {
        const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
        
        // Determine the biometric type based on the supported types
        if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
          setBiometricType('Face ID');
        } else if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
          setBiometricType('Fingerprint');
        } else {
          setBiometricType('Biometric');
        }
      }
    })();
  }, []);

  // Authenticate with biometrics
  const authenticate = useCallback(async () => {
    if (!isCompatible) {
      Alert.alert('Error', 'Your device does not support biometric authentication');
      return;
    }

    try {
      setIsAuthenticating(true);
      
      // First check if biometric is enrolled
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      if (!isEnrolled) {
        const error = new Error('Biometric authentication not set up on this device');
        console.error(error.message);
        Alert.alert(
          'Biometric Authentication Not Set Up',
          'Please set up biometric authentication in your device settings.'
        );
        if (onFailure) onFailure(error);
        setIsAuthenticating(false);
        return;
      }
      
      // Directly attempt biometric auth to get detailed error information from the device
      const directResult = await LocalAuthentication.authenticateAsync({
        promptMessage,
        cancelLabel,
        fallbackLabel,
        disableDeviceFallback: false,
      });
      
      console.log('Direct biometric result:', directResult);
      
      if (directResult.success) {
        // If direct auth successful, proceed with the context auth
        console.log('Attempting biometric authentication through AuthContext...');
        const success = await authenticateWithBiometrics();
        
        if (success) {
          console.log('Biometric authentication successful');
          const token = await getToken();
          // Call onSuccess callback if provided
          if (token && onSuccess) {
            console.log('Calling onSuccess with token');
            onSuccess(token);
          } else if (!token) {
            console.error('No token found after successful authentication');
            if (onFailure) onFailure(new Error('Authentication successful but no token found'));
          }
        } else {
          console.log('AuthContext authentication returned false even though device auth succeeded');
          
          // Handle the token validation failure case
          Alert.alert(
            'Session Expired',
            'Your session has expired. Please log in again.',
            [
              {
                text: 'OK',
                onPress: () => {
                  // @ts-ignore: Navigation typing issue
                  navigation.navigate('Login');
                }
              }
            ]
          );
          
          if (onFailure) {
            onFailure(new Error('Authentication successful on device but token validation failed'));
          }
        }
      } else {
        // Direct biometric auth failed
        const errorMessage = directResult.error 
          ? `Authentication failed: ${directResult.error}` 
          : 'Authentication failed';
        console.error(errorMessage);
        
        if (onFailure) {
          onFailure(new Error(errorMessage));
        }
      }
    } catch (error) {
      console.error('Authentication error:', error);
      if (onFailure) {
        onFailure(error instanceof Error ? error : new Error(String(error)));
      }
    } finally {
      setIsAuthenticating(false);
    }
  }, [isCompatible, promptMessage, cancelLabel, fallbackLabel, onSuccess, onFailure, authenticateWithBiometrics, navigation]);

  return (
    <View style={styles.container}>
      {isCompatible ? (
        <TouchableOpacity
          style={styles.button}
          onPress={authenticate}
          disabled={isAuthenticating}
        >
          {isAuthenticating ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : (
            <Text style={styles.buttonText}>
              {buttonText.replace('Face ID', biometricType)}
            </Text>
          )}
        </TouchableOpacity>
      ) : (
        <Text style={styles.errorText}>Biometric authentication not supported on this device</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  button: {
    backgroundColor: '#2e7d32',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    minWidth: 200,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginTop: 10,
  }
});

export default BiometricAuth; 