import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Alert } from 'react-native';
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

  const handleAuthSuccess = (token: string) => {
    console.log('Authentication successful!');
    setStatus('Authentication successful! Token retrieved.');
    
    // Don't manually navigate - the AppNavigatorWrapper will handle this automatically
    // when the isAuthenticated state changes in AuthContext
  };

  const handleAuthFailure = (error: Error) => {
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
  };

  // Attempt biometric authentication as soon as the screen loads
  useEffect(() => {
    const attemptAuth = async () => {
      try {
        const success = await authenticateWithBiometrics();
        if (success) {
          handleAuthSuccess('token_retrieved');
        }
      } catch (error) {
        if (error instanceof Error) {
          handleAuthFailure(error);
        } else {
          handleAuthFailure(new Error('Authentication failed'));
        }
      }
    };
    
    attemptAuth();
  }, [authenticateWithBiometrics]);

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
        </View>

        {status ? (
          <View style={styles.statusContainer}>
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
});

export default BiometricAuthScreen; 