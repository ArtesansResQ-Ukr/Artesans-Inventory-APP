import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '../../contexts/AuthContext';
import { AuthStackParamList } from '../../navigation/types/navigation';

type OTPLoginScreenNavigationProp = NativeStackNavigationProp<AuthStackParamList>;

const OTPLoginScreen: React.FC = () => {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [otpRequested, setOtpRequested] = useState(false);

  const navigation = useNavigation<OTPLoginScreenNavigationProp>();
  const { requestOTP, verifyOTP } = useAuth();

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleRequestOTP = async () => {
    if (!email) {
      Alert.alert('Error', 'Please enter your email');
      return;
    }

    if (!validateEmail(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    try {
      console.log('OTPLoginScreen: Requesting OTP for email:', email);
      const success = await requestOTP(email);
      
      if (success) {
        console.log('OTPLoginScreen: OTP request successful');
        setOtpRequested(true);
        Alert.alert('Success', 'One-time passcode has been sent to your email');
      } else {
        console.log('OTPLoginScreen: OTP request failed');
        Alert.alert('Error', 'Failed to send one-time passcode');
      }
    } catch (error) {
      console.error('OTPLoginScreen: OTP request error:', error);
      Alert.alert('Error', 'An error occurred while requesting one-time passcode');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otp) {
      Alert.alert('Error', 'Please enter the one-time passcode');
      return;
    }

    setIsLoading(true);
    try {
      console.log('OTPLoginScreen: Verifying OTP for email:', email);
      const success = await verifyOTP(email, otp);
      
      if (success) {
        console.log('OTPLoginScreen: OTP verification successful');
        // Don't manually navigate - the AppNavigatorWrapper will handle this automatically
        // when the isAuthenticated state changes in AuthContext
      } else {
        console.log('OTPLoginScreen: OTP verification failed');
        Alert.alert('Error', 'Invalid one-time passcode');
      }
    } catch (error) {
      console.error('OTPLoginScreen: OTP verification error:', error);
      Alert.alert('Error', 'An error occurred while verifying one-time passcode');
    } finally {
      setIsLoading(false);
    }
  };

  const backToLogin = () => {
    navigation.goBack();
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 50 : 0}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.formContainer}>
          <Text style={styles.title}>Login with OTP</Text>
          <Text style={styles.subtitle}>
            {otpRequested 
              ? 'Enter the one-time passcode sent to your email' 
              : 'We\'ll send a one-time passcode to your email'}
          </Text>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              editable={!otpRequested} // Disable email input after OTP is requested
            />
          </View>

          {otpRequested && (
            <View style={styles.inputContainer}>
              <Text style={styles.label}>One-Time Passcode</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter the passcode"
                value={otp}
                onChangeText={setOtp}
                keyboardType="number-pad"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
          )}

          {!otpRequested ? (
            <TouchableOpacity
              onPress={handleRequestOTP}
              style={styles.otpButton}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.otpButtonText}>Send One-Time Passcode</Text>
              )}
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={handleVerifyOTP}
              style={styles.otpButton}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.otpButtonText}>Verify & Login</Text>
              )}
            </TouchableOpacity>
          )}

          {otpRequested && (
            <TouchableOpacity
              onPress={handleRequestOTP}
              style={styles.resendButton}
              disabled={isLoading}
            >
              <Text style={styles.resendButtonText}>Resend One-Time Passcode</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            onPress={backToLogin}
            style={styles.backButton}
          >
            <Text style={styles.backButtonText}>Back to Login</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  formContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  otpButton: {
    backgroundColor: '#2ecc71',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  otpButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  resendButton: {
    marginTop: 16,
    alignItems: 'center',
  },
  resendButtonText: {
    color: '#2ecc71',
    fontSize: 14,
  },
  backButton: {
    marginTop: 16,
    alignItems: 'center',
  },
  backButtonText: {
    color: '#3498db',
    fontSize: 14,
  },
});

export default OTPLoginScreen; 