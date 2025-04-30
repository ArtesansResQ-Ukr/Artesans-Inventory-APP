import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import BiometricAuth from '../../components/auth/BiometricAuth';
import { RootStackParamList, AuthStackParamList } from '../../navigation/types/navigation';
import { useAuth } from '../../contexts/AuthContext';

type BiometricAuthScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;
type BiometricLoginScreenNavigationProp = NativeStackNavigationProp<AuthStackParamList>;

const BiometricAuthScreen: React.FC = () => {
  const navigation = useNavigation<BiometricAuthScreenNavigationProp>();
  const LoginNavigation = useNavigation<BiometricLoginScreenNavigationProp>();
  const { authenticateWithBiometrics } = useAuth();
  const [status, setStatus] = useState<string>('');

  const handleAuthSuccess = useCallback((token: string) => {
    console.log('Authentication successful!');
    setStatus('Authentication successful! Token retrieved.');
    
    // Don't manually navigate - the AppNavigatorWrapper will handle this automatically
    // when the isAuthenticated state changes in AuthContext
  }, []);

  const handleAuthFailure = useCallback((error: Error) => {
    console.error('Authentication failed:', error.message);
    setStatus(`Authentication failed: ${error.message}`);
    
    // Show an alert with the error message
    Alert.alert(
      'Authentication Failed',
      error.message,
      [
        {
          text: 'Try Again',
          style: 'default',
        },
        {
          text: 'Back to Login',
          onPress: () => LoginNavigation.navigate('Login'),
          style: 'cancel',
        },
      ]
    );
  }, [LoginNavigation]);

  // Attempt biometric authentication as soon as the screen loads
  useEffect(() => {
    const attemptAuth = async () => {
      try {
        console.log('BiometricAuthScreen: Attempting biometric authentication');
        const success = await authenticateWithBiometrics();
        console.log('BiometricAuthScreen: Authentication result:', success);
        
        if (success) {
          handleAuthSuccess('token_retrieved');
        } else {
          // Don't show an error alert here, the component will handle it
          console.log('BiometricAuthScreen: Authentication returned false, but no error thrown');
          setStatus('Authentication failed. Please try again or use password login.');
        }
      } catch (error) {
        console.error('BiometricAuthScreen: Authentication error:', error);
        if (error instanceof Error) {
          handleAuthFailure(error);
        } else {
          handleAuthFailure(new Error('Authentication failed'));
        }
      }
    };
    
    attemptAuth();
  }, [authenticateWithBiometrics, handleAuthSuccess, handleAuthFailure]);

  // Function to retry authentication manually
  const retryAuthentication = useCallback(async () => {
    setStatus('Retrying authentication...');
    try {
      console.log('BiometricAuthScreen: Retrying biometric authentication');
      const success = await authenticateWithBiometrics();
      if (success) {
        handleAuthSuccess('token_retrieved');
      } else {
        setStatus('Authentication failed. Please try again or use password login.');
      }
    } catch (error) {
      console.error('BiometricAuthScreen: Retry authentication error:', error);
      if (error instanceof Error) {
        handleAuthFailure(error);
      } else {
        handleAuthFailure(new Error('Authentication failed'));
      }
    }
  }, [authenticateWithBiometrics, handleAuthSuccess, handleAuthFailure]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>Biometric Authentication</Text>
          <Text style={styles.subtitle}>
            Use Face ID or Touch ID to securely access your account
          </Text>
        </View>

        <View style={styles.authContainer}>
          <BiometricAuth
            tokenKey="userToken"
            onSuccess={handleAuthSuccess}
            onFailure={handleAuthFailure}
            promptMessage="Verify your identity"
            buttonText="Authenticate with Biometrics"
          />
          
          {status && status.includes('failed') && (
            <>
              {status.includes('token validation failed') && (
                <View style={styles.infoMessage}>
                  <Text style={styles.infoText}>
                    Your session appears to have expired. Please log in again with your password to refresh your session.
                  </Text>
                </View>
              )}
              
              <TouchableOpacity 
                style={styles.retryButton}
                onPress={retryAuthentication}
              >
                <Text style={styles.retryButtonText}>Retry Authentication</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.fallbackButton}
                onPress={() => LoginNavigation.navigate('Login')}
              >
                <Text style={styles.fallbackButtonText}>Use Password Login</Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        {status ? (
          <View style={[
            styles.statusContainer, 
            status.includes('failed') ? styles.errorStatus : 
            status.includes('successful') ? styles.successStatus : {}
          ]}>
            <Text style={styles.statusText}>{status}</Text>
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  scrollContainer: {
    padding: 20,
  },
  header: {
    marginBottom: 40,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  authContainer: {
    marginBottom: 30,
  },
  statusContainer: {
    backgroundColor: '#f0f0f0',
    padding: 15,
    borderRadius: 8,
    marginBottom: 30,
  },
  statusText: {
    fontSize: 14,
    color: '#333',
    textAlign: 'center',
  },
  infoContainer: {
    backgroundColor: '#e8f5e9',
    padding: 20,
    borderRadius: 8,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#2e7d32',
  },
  infoText: {
    fontSize: 14,
    color: '#555',
    marginBottom: 10,
    lineHeight: 20,
  },
  infoMessage: {
    backgroundColor: '#fff3cd',
    borderColor: '#ffeeba',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
  },
  retryButton: {
    backgroundColor: '#007bff',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  errorStatus: {
    backgroundColor: '#ffd6d6',
  },
  successStatus: {
    backgroundColor: '#d6ffd6',
  },
  fallbackButton: {
    backgroundColor: '#6c757d',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  fallbackButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
});

export default BiometricAuthScreen; 