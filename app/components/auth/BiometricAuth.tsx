import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, Alert, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';

interface BiometricAuthProps {
  tokenKey?: string;           // SecureStore key for the JWT token
  onSuccess?: (token: string) => void;
  onFailure?: (error: Error) => void;
  promptMessage?: string;      // Message shown in authentication prompt
  cancelLabel?: string;        // Custom label for cancel button
  fallbackLabel?: string;      // Custom label for fallback button
  buttonText?: string;         // Text for the authentication button
}

const BiometricAuth: React.FC<BiometricAuthProps> = ({
  tokenKey = 'userToken',
  onSuccess,
  onFailure,
  promptMessage = 'Authenticate to access your account',
  cancelLabel = 'Cancel',
  fallbackLabel = 'Use Passcode',
  buttonText = 'Authenticate with Face ID',
}) => {
  const [isCompatible, setIsCompatible] = useState<boolean>(false);
  const [biometricType, setBiometricType] = useState<string>('');
  const [isAuthenticating, setIsAuthenticating] = useState<boolean>(false);

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

  // Retrieve token from SecureStore
  const getToken = useCallback(async () => {
    try {
      const token = await SecureStore.getItemAsync(tokenKey);
      
      if (token) {
        console.log('JWT Token retrieved:', token);
        onSuccess?.(token);
        return token;
      } else {
        const error = new Error('Token not found in secure storage');
        console.error(error);
        Alert.alert('Authentication Error', 'Token not found. Please log in again.');
        onFailure?.(error);
        return null;
      }
    } catch (error) {
      console.error('Error retrieving token:', error);
      Alert.alert('Authentication Error', 'Failed to retrieve secure token.');
      onFailure?.(error instanceof Error ? error : new Error(String(error)));
      return null;
    }
  }, [tokenKey, onSuccess, onFailure]);

  // Authenticate with biometrics
  const authenticate = useCallback(async () => {
    if (!isCompatible) {
      Alert.alert('Error', 'Your device does not support biometric authentication');
      return;
    }

    try {
      setIsAuthenticating(true);
      
      // Check if biometric data is enrolled
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      if (!isEnrolled) {
        Alert.alert(
          'Biometric Authentication Not Set Up',
          'Please set up biometric authentication in your device settings.'
        );
        setIsAuthenticating(false);
        return;
      }

      // Perform authentication
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage,
        cancelLabel,
        fallbackLabel,
        disableDeviceFallback: false,
      });

      if (result.success) {
        await getToken();
      } else {
        // Handle cancellation or failure
        const errorMessage = result.error === 'user_cancel' 
          ? 'Authentication cancelled'
          : 'Authentication failed';
          
        console.log(errorMessage);
        Alert.alert('Authentication', errorMessage);
        onFailure?.(new Error(errorMessage));
      }
    } catch (error) {
      console.error('Authentication error:', error);
      Alert.alert('Error', 'An error occurred during authentication');
      onFailure?.(error instanceof Error ? error : new Error(String(error)));
    } finally {
      setIsAuthenticating(false);
    }
  }, [isCompatible, promptMessage, cancelLabel, fallbackLabel, getToken, onFailure]);

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