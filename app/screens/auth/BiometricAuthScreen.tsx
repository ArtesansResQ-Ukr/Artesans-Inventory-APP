import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import BiometricAuth from '../../components/auth/BiometricAuth';
import { RootStackParamList } from '../../navigation/types/navigation';

type BiometricAuthScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

const BiometricAuthScreen: React.FC = () => {
  const navigation = useNavigation<BiometricAuthScreenNavigationProp>();
  const [status, setStatus] = useState<string>('');

  const handleAuthSuccess = (token: string) => {
    console.log('Authentication successful!');
    setStatus('Authentication successful! Token retrieved.');
    
    // In a real app, you might navigate to the main app here
    // navigation.navigate('MainTabs');
    
    // Or you might set up your API client with the token
    // apiClient.setAuthToken(token);
  };

  const handleAuthFailure = (error: Error) => {
    console.error('Authentication failed:', error.message);
    setStatus(`Authentication failed: ${error.message}`);
    
    // You could implement fallback authentication here
  };

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

        <View style={styles.infoContainer}>
          <Text style={styles.infoTitle}>How it works:</Text>
          <Text style={styles.infoText}>
            1. The app checks if your device supports biometric authentication
          </Text>
          <Text style={styles.infoText}>
            2. When you tap the button, you'll be prompted to authenticate
          </Text>
          <Text style={styles.infoText}>
            3. After successful authentication, your secure token will be retrieved
          </Text>
          <Text style={styles.infoText}>
            4. In a real app, you would then be granted access to protected features
          </Text>
        </View>
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