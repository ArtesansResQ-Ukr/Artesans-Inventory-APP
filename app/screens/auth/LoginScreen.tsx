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
import { colors, textColors, colorVariations } from '../../theme';

type LoginScreenNavigationProp = NativeStackNavigationProp<AuthStackParamList>;

const LoginScreen: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [forgotPasswordError, setForgotPasswordError] = useState<string | null>(null);
  const [tokenExpiredMessage, setTokenExpiredMessage] = useState<string | null>(null);
  const [resetPasswordSuccess, setResetPasswordSuccess] = useState<string | null>(null);

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
      setLoginError('Please enter both username and password');
      return;
    }

    setIsLoading(true);
    setLoginError(null); // Clear any previous errors
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
          setLoginError('The username you entered does not exist');
        } else if (error.response.data.detail === "Incorrect password") {
          setLoginError('The password you entered is incorrect');
        } else {
          setLoginError(error.response.data.detail);
        }
      } else if (error.message === "Token expired or invalid") {
        setLoginError('Your session has expired. Please sign in again.');
      } else {
        setLoginError('An error occurred while logging in');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const HandleNewPasswordRequest = async () => {
    if (!forgotPasswordEmail) {
      setForgotPasswordError('Please enter your email address');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(forgotPasswordEmail)) {
      setForgotPasswordError('Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    setForgotPasswordError(null);
    try {
      const success = await requestNewPassword(forgotPasswordEmail);
      
      if (success) {
        setResetPasswordSuccess('Please check your email for your new password');
        // Clear error after 5 seconds and return to login
        setTimeout(() => {
          setResetPasswordSuccess(null);
          setShowForgotPassword(false);
        }, 5000);
      } else {
        setForgotPasswordError('Failed to send password reset email');
      }
    } catch (error: any) {
      console.error('Password reset error:', error);
      if (error.response?.data?.detail) {
        setForgotPasswordError(error.response.data.detail);
      } else {
        setForgotPasswordError('An error occurred while sending password reset email');
      }
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

  // Clear errors when switching between login and forgot password
  useEffect(() => {
    setLoginError(null);
    setForgotPasswordError(null);
    setResetPasswordSuccess(null);
  }, [showForgotPassword]);

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
              <Ionicons name="alert-circle" size={20} color={colors.error} style={styles.errorIcon} />
              <Text style={styles.errorText}>{tokenExpiredMessage}</Text>
            </View>
          )}

          {!showForgotPassword ? (
            <>
              {loginError && (
                <View style={styles.errorContainer}>
                  <Ionicons name="alert-circle" size={20} color={colors.error} style={styles.errorIcon} />
                  <Text style={styles.errorText}>{loginError}</Text>
                </View>
              )}
              
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Username</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your username"
                  placeholderTextColor={textColors.secondary}
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
                  placeholderTextColor={textColors.secondary}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  autoComplete='password'
                />
              </View>

              <TouchableOpacity
                onPress={handleLogin}
                style={styles.loginButton}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color={colors.white} />
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
                <Ionicons name="finger-print" size={18} color={colors.white} style={styles.biometricIcon}></Ionicons>
                <Text style={styles.biometricButtonText}>Login with Biometrics</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setShowForgotPassword(true)}
                style={styles.forgotPasswordLink}
              >
                <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              {forgotPasswordError && (
                <View style={styles.errorContainer}>
                  <Ionicons name="alert-circle" size={20} color={colors.error} style={styles.errorIcon} />
                  <Text style={styles.errorText}>{forgotPasswordError}</Text>
                </View>
              )}
              
              {resetPasswordSuccess && (
                <View style={styles.successContainer}>
                  <Ionicons name="checkmark-circle" size={20} color={colors.success} style={styles.successIcon} />
                  <Text style={styles.successText}>{resetPasswordSuccess}</Text>
                </View>
              )}

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
                  <ActivityIndicator color={colors.white} />
                ) : (
                  <Text style={styles.loginButtonText}>Reset Password</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setShowForgotPassword(false)}
                style={styles.backToLoginLink}
              >
                <Text style={styles.backToLoginText}>Back to Login</Text>
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
    backgroundColor: colors.primary,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: colors.primary,
  },
  formContainer: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: colors.white,
    borderRadius: 10,
    padding: 20,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.primary,
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: textColors.secondary,
    textAlign: 'center',
    marginBottom: 20,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fdecea',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorIcon: {
    marginRight: 8,
  },
  errorText: {
    flex: 1,
    color: colors.error,
    fontSize: 14,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: textColors.primary,
    marginBottom: 8,
  },
  input: {
    backgroundColor: colors.background,
    height: 50,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colorVariations.backgroundDarker,
    paddingHorizontal: 16,
    fontSize: 16,
    color: textColors.primary,
  },
  loginButton: {
    backgroundColor: colors.primary,
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  loginButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  otpLoginButton: {
    backgroundColor: colors.secondary,
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  otpLoginButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  biometricButton: {
    backgroundColor: '#4a4a4a',
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
    flexDirection: 'row',
  },
  biometricIcon: {
    marginRight: 8,
  },
  biometricButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  forgotPasswordLink: {
    alignSelf: 'center',
    marginTop: 20,
  },
  forgotPasswordText: {
    color: colors.secondary,
    fontSize: 14,
  },
  backToLoginLink: {
    alignSelf: 'center',
    marginTop: 20,
  },
  backToLoginText: {
    color: colors.secondary,
    fontSize: 14,
  },
  successContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e6f9e6',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  successIcon: {
    marginRight: 8,
  },
  successText: {
    flex: 1,
    color: colors.success,
    fontSize: 14,
  },
});

export default LoginScreen; 