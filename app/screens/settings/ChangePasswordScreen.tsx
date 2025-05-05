import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, useWindowDimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../contexts/AuthContext';
import { TextInput, Button, ActivityIndicator } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { colors, textColors } from '../../theme';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'


const ChangePasswordScreen = () => {
  const navigation = useNavigation();
  const { changePassword, requestNewPassword, user } = useAuth();
  const { width } = useWindowDimensions();
  
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showResetOption, setShowResetOption] = useState(false);
  
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Determine if we're on a larger screen (tablet/web)
  const isLargeScreen = width > 768;

  const validatePasswords = () => {
    if (!oldPassword) {
      setErrorMessage('Please enter your current password');
      return false;
    }
    
    if (!newPassword) {
      setErrorMessage('Please enter a new password');
      return false;
    }
    
    if (newPassword.length < 8) {
      setErrorMessage('New password must be at least 8 characters long');
      return false;
    }
    
    if (newPassword !== confirmPassword) {
      setErrorMessage('New passwords do not match');
      return false;
    }
    
    setErrorMessage('');
    return true;
  };

  const handleChangePassword = async () => {
    if (!validatePasswords()) return;
    
    setIsLoading(true);
    try {
      const success = await changePassword(oldPassword, newPassword, confirmPassword);
      
      if (success) {
        Alert.alert('Success', 'Password changed successfully');
        navigation.goBack();
      } else {
        setShowResetOption(true);
      }
    } catch (error) {
      console.error('Error changing password:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRequestNewPassword = async () => {
    if (!user?.email) {
      Alert.alert('Error', 'No email associated with your account');
      return;
    }
    
    setIsLoading(true);
    try {
      const success = await requestNewPassword(user.email);
      
      if (success) {
        Alert.alert(
          'Password Reset Email Sent', 
          'Check your email for instructions to reset your password'
        );
      }
    } catch (error) {
      console.error('Error requesting password reset:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const Content = () => (
    <View style={[styles.formContainer, isLargeScreen && styles.formContainerLarge]}>
      {errorMessage ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{errorMessage}</Text>
        </View>
      ) : null}

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Current Password</Text>
        <View style={styles.passwordInputContainer}>
          <TextInput
            style={styles.input}
            autoComplete="current-password"
            placeholder="Enter current password"
            value={oldPassword}
            onChangeText={setOldPassword}
            secureTextEntry={!showOldPassword}
            right={
              <TextInput.Icon 
                icon={showOldPassword ? "eye-off" : "eye"} 
                onPress={() => setShowOldPassword(!showOldPassword)}
              />
            }
          />
        </View>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>New Password</Text>
        <View style={styles.passwordInputContainer}>
          <TextInput
            style={styles.input}
            autoComplete="new-password"
            placeholder="Enter new password"
            value={newPassword}
            onChangeText={setNewPassword}
            secureTextEntry={!showNewPassword}
            right={
              <TextInput.Icon 
                icon={showNewPassword ? "eye-off" : "eye"} 
                onPress={() => setShowNewPassword(!showNewPassword)}
              />
            }
          />
        </View>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Confirm New Password</Text>
        <View style={styles.passwordInputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Confirm new password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry={!showConfirmPassword}
            right={
              <TextInput.Icon 
                icon={showConfirmPassword ? "eye-off" : "eye"} 
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              />
            }
          />
        </View>
      </View>

      <Button
        mode="contained"
        onPress={handleChangePassword}
        style={styles.changeButton}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="#fff" size="small" />
        ) : (
          "Change Password"
        )}
      </Button>

      {showResetOption && (
        <View style={styles.resetContainer}>
          <Text style={styles.resetText}>
            Forgot your password? Request a reset link to your email:
          </Text>
          <Button
            mode="outlined"
            onPress={handleRequestNewPassword}
            style={styles.resetButton}
            disabled={isLoading}
          >
            Request New Password
          </Button>
        </View>
      )}

      <TouchableOpacity
        onPress={() => setShowResetOption(!showResetOption)}
        style={styles.toggleResetButton}
      >
        <Text style={styles.toggleResetText}>
          {showResetOption ? "Hide reset option" : "Forgot password?"}
        </Text>
      </TouchableOpacity>
    </View>
  );

  return Platform.OS === 'web' ? (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()} 
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Change Password</Text>
        <View style={{ width: 24 }} />
      </View>
      <View style={styles.webContainer}>
        <Content />
      </View>
    </View>
  ) : (
    <KeyboardAwareScrollView
      style={{ flex: 1 }}
      enableOnAndroid={true}
    >
      <ScrollView 
        style={styles.container}
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <TouchableOpacity 
            onPress={() => navigation.goBack()} 
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Change Password</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={[styles.formContainer, isLargeScreen && styles.formContainerLarge]}>
      {errorMessage ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{errorMessage}</Text>
        </View>
      ) : null}

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Current Password</Text>
        <View style={styles.passwordInputContainer}>
          <TextInput
            style={styles.input}
            autoComplete="current-password"
            placeholder="Enter current password"
            value={oldPassword}
            onChangeText={setOldPassword}
            secureTextEntry={!showOldPassword}
            right={
              <TextInput.Icon 
                icon={showOldPassword ? "eye-off" : "eye"} 
                onPress={() => setShowOldPassword(!showOldPassword)}
              />
            }
          />
        </View>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>New Password</Text>
        <View style={styles.passwordInputContainer}>
          <TextInput
            style={styles.input}
            autoComplete="new-password"
            placeholder="Enter new password"
            value={newPassword}
            onChangeText={setNewPassword}
            secureTextEntry={!showNewPassword}
            right={
              <TextInput.Icon 
                icon={showNewPassword ? "eye-off" : "eye"} 
                onPress={() => setShowNewPassword(!showNewPassword)}
              />
            }
          />
        </View>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Confirm New Password</Text>
        <View style={styles.passwordInputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Confirm new password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry={!showConfirmPassword}
            right={
              <TextInput.Icon 
                icon={showConfirmPassword ? "eye-off" : "eye"} 
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              />
            }
          />
        </View>
      </View>

      <Button
        mode="contained"
        onPress={handleChangePassword}
        style={styles.changeButton}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="#fff" size="small" />
        ) : (
          "Change Password"
        )}
      </Button>

      {showResetOption && (
        <View style={styles.resetContainer}>
          <Text style={styles.resetText}>
            Forgot your password? Request a reset link to your email:
          </Text>
          <Button
            mode="outlined"
            onPress={handleRequestNewPassword}
            style={styles.resetButton}
            disabled={isLoading}
          >
            Request New Password
          </Button>
        </View>
      )}

      <TouchableOpacity
        onPress={() => setShowResetOption(!showResetOption)}
        style={styles.toggleResetButton}
      >
        <Text style={styles.toggleResetText}>
          {showResetOption ? "Hide reset option" : "Forgot password?"}
        </Text>
      </TouchableOpacity>
    </View>
      </ScrollView>
    </KeyboardAwareScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContainer: {
    padding: 16,
    flexGrow: 1,
  },
  webContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
    paddingVertical: 8,
    color: textColors.primary,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: textColors.primary,
  },
  formContainer: {
    backgroundColor: colors.white,
    borderRadius: 10,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    width: '100%',
  },
  formContainerLarge: {
    maxWidth: 500,
    alignSelf: 'center',
  },
  errorContainer: {
    backgroundColor: '#ffebeb',
    borderRadius: 5,
    padding: 10,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.error,
  },
  errorText: {
    color: colors.error,
    fontSize: 14,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: textColors.primary,
    marginBottom: 8,
    fontWeight: '500',
  },
  passwordInputContainer: {
    position: 'relative',
  },
  input: {
    backgroundColor: colors.background,
    fontSize: 16,
    height: 50,
    paddingHorizontal: 10,
  },
  changeButton: {
    marginTop: 8,
    height: 50,
    justifyContent: 'center',
  },
  resetContainer: {
    marginTop: 24,
    padding: 16,
    backgroundColor: colors.background,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  resetText: {
    color: textColors.primary,
    fontSize: 14,
    marginBottom: 16,
  },
  resetButton: {
    backgroundColor: 'transparent',
  },
  toggleResetButton: {
    marginTop: 16,
    alignItems: 'center',
  },
  toggleResetText: {
    color: colors.primary,
    fontSize: 14,
  },
});

export default ChangePasswordScreen;

