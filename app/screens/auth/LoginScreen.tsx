import React, { useState, useEffect } from 'react';
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
import { Ionicons } from '@expo/vector-icons';

type LoginScreenNavigationProp = NativeStackNavigationProp<AuthStackParamList>;

const LoginScreen: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [tokenExpiredMessage, setTokenExpiredMessage] = useState<string | null>(null);

  const navigation = useNavigation<LoginScreenNavigationProp>();
  const { login, requestNewPassword } = useAuth();

  // Check for token expiration error in navigation params
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      // Clear any existing messages when screen is focused
      setTokenExpiredMessage(null);
      
      // Check if we have token expiration error in navigation state
      const routes = navigation.getState().routes;
      const loginRoute = routes.find(r => r.name === 'Login');
      if (loginRoute && loginRoute.params && 'tokenExpired' in loginRoute.params) {
        if ((loginRoute.params as any).tokenExpired === true) {
          setTokenExpiredMessage('Your session has expired. Please sign in again with your password or use a One-Time Passcode.');
        }
      }
    });

    return unsubscribe;
  }, [navigation]);

  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert('Error', 'Please enter both username and password');
      return;
    }

    setIsLoading(true);
    try {
      console.log('LoginScreen: Attempting login with username:', username);
      const success = await login(username, password);
      
      if (success) {
        console.log('LoginScreen: Login successful');
        // Clear any token expired message
        setTokenExpiredMessage(null);
        // Don't manually navigate - the AppNavigatorWrapper will handle this automatically
        // when the isAuthenticated state changes in AuthContext
      } else {
        console.log('LoginScreen: Login failed');
        // Error message will be handled by the catch block
      }
    } catch (error: any) {
      console.error('LoginScreen: Login error:', error);
      if (error.response?.data?.detail) {
        if (error.response.data.detail === "Incorrect username") {
          Alert.alert('Error', 'The username you entered does not exist');
        } else if (error.response.data.detail === "Incorrect password") {
          Alert.alert('Error', 'The password you entered is incorrect');
        } else {
          Alert.alert('Error', error.response.data.detail);
        }
      } else {
        Alert.alert('Error', 'An error occurred while logging in');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const HandleNewPasswordRequest = async () => {
    if (!forgotPasswordEmail) {
      Alert.alert('Error', 'Please enter your email address');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(forgotPasswordEmail)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    try {
      const success = await requestNewPassword(forgotPasswordEmail);
      
      if (success) {
        Alert.alert('Success', 'Please check your email for your new password');
        setShowForgotPassword(false);
      } else {
        Alert.alert('Error', 'Failed to send password reset email');
      }
    } catch (error) {
      Alert.alert('Error', 'An error occurred while sending password reset email');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const navigateToOTPLogin = () => {
    navigation.navigate('OTPLogin');
  };

  const navigateToBiometricAuth = () => {
    navigation.navigate('BiometricAuth');
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 50 : 0}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.formContainer}>
          <Text style={styles.title}>Inventory App</Text>
          <Text style={styles.subtitle}>Sign in to your account</Text>

          {tokenExpiredMessage && (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle" size={20} color="#e74c3c" style={styles.errorIcon} />
              <Text style={styles.errorText}>{tokenExpiredMessage}</Text>
            </View>
          )}

          {!showForgotPassword ? (
            <>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Username</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your username"
                  value={username}
                  onChangeText={setUsername}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Password</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your password"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                />
              </View>

              <TouchableOpacity
                onPress={handleLogin}
                style={styles.loginButton}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.loginButtonText}>Login</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                onPress={navigateToOTPLogin}
                style={styles.otpLoginButton}
              >
                <Text style={styles.otpLoginButtonText}>Login with One-Time Passcode</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={navigateToBiometricAuth}
                style={styles.biometricButton}
              >
                <Ionicons name="finger-print" size={18} color="#fff" style={styles.biometricIcon}></Ionicons>
                <Text style={styles.biometricButtonText}>Login with Biometrics</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setShowForgotPassword(true)}
                style={styles.forgotPasswordButton}
              >
                <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Email</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your email"
                  value={forgotPasswordEmail}
                  onChangeText={setForgotPasswordEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>

              <TouchableOpacity
                onPress={HandleNewPasswordRequest}
                style={styles.loginButton}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.loginButtonText}>Reset Password</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setShowForgotPassword(false)}
                style={styles.forgotPasswordButton}
              >
                <Text style={styles.forgotPasswordText}>Back to Login</Text>
              </TouchableOpacity>
            </>
          )}
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
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffebeb',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#ffd0d0',
  },
  errorIcon: {
    marginRight: 8,
  },
  errorText: {
    color: '#e74c3c',
    fontSize: 14,
    flex: 1,
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
  loginButton: {
    backgroundColor: '#3498db',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  otpLoginButton: {
    backgroundColor: '#2ecc71',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
    marginTop: 12,
  },
  otpLoginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  biometricButton: {
    backgroundColor: '#9b59b6',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
    marginTop: 12,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  biometricButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  biometricIcon: {
    marginRight: 8,
  },
  forgotPasswordButton: {
    marginTop: 16,
    alignItems: 'center',
  },
  forgotPasswordText: {
    color: '#3498db',
    fontSize: 14,
  },
});

export default LoginScreen; 