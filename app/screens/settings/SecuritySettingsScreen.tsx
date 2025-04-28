import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  TouchableOpacity,
  ScrollView,
  Alert,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AccountStackParamList } from '../../navigation/types/navigation';
import { useAuth } from '../../contexts/AuthContext';
import * as LocalAuthentication from 'expo-local-authentication';
import { Ionicons } from '@expo/vector-icons';

type SecuritySettingsScreenNavigationProp = NativeStackNavigationProp<AccountStackParamList>;

const SecuritySettingsScreen: React.FC = () => {
  const navigation = useNavigation<SecuritySettingsScreenNavigationProp>();
  const { biometricEnabled, enableBiometricLogin } = useAuth();
  
  const [isBiometricSupported, setIsBiometricSupported] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [localBiometricEnabled, setLocalBiometricEnabled] = useState<boolean>(biometricEnabled);
  const [biometricType, setBiometricType] = useState<string>('Biometric');

  // Check if biometric authentication is supported on this device
  useEffect(() => {
    const checkBiometricSupport = async () => {
      try {
        // Check if hardware supports biometrics
        const compatible = await LocalAuthentication.hasHardwareAsync();
        setIsBiometricSupported(compatible);

        if (compatible) {
          // Check what types of biometric authentication are available
          const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
          
          if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
            setBiometricType('Face ID');
          } else if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
            setBiometricType('Fingerprint');
          }
          
          // Check if biometric is enrolled
          const enrolled = await LocalAuthentication.isEnrolledAsync();
          if (!enrolled) {
            console.log('No biometric enrolled on this device');
          }
        }
      } catch (error) {
        console.error('Error checking biometric support:', error);
      }
    };

    checkBiometricSupport();
  }, []);

  // Toggle biometric authentication
  const toggleBiometricAuth = async (value: boolean) => {
    setIsLoading(true);
    try {
      if (value && !isBiometricSupported) {
        Alert.alert(
          'Not Supported',
          'Biometric authentication is not supported on this device.'
        );
        return;
      }

      // If enabling, prompt the user to authenticate first
      if (value) {
        const result = await LocalAuthentication.authenticateAsync({
          promptMessage: 'Authenticate to enable biometric login',
          fallbackLabel: 'Use Passcode',
        });

        if (!result.success) {
          console.log('Authentication failed');
          return;
        }
      }

      const success = await enableBiometricLogin(value);
      if (success) {
        setLocalBiometricEnabled(value);
        Alert.alert(
          'Success',
          `Biometric login has been ${value ? 'enabled' : 'disabled'}.`
        );
      } else {
        Alert.alert(
          'Error',
          `Failed to ${value ? 'enable' : 'disable'} biometric login.`
        );
      }
    } catch (error) {
      console.error('Error toggling biometric auth:', error);
      Alert.alert('Error', 'An error occurred while updating settings.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>Security Settings</Text>
          <Text style={styles.subtitle}>
            Configure your security preferences for the application
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Authentication</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingTextContainer}>
              <View style={styles.iconContainer}>
                <Ionicons 
                  name={biometricType === 'Face ID' ? 'eye-outline' : 'finger-print'} 
                  size={24} 
                  color="#3498db" 
                />
              </View>
              <View>
                <Text style={styles.settingTitle}>
                  {biometricType} Login
                </Text>
                <Text style={styles.settingDescription}>
                  {isBiometricSupported 
                    ? `Use ${biometricType} to login to your account`
                    : 'Biometric authentication is not available on this device'}
                </Text>
              </View>
            </View>
            {isLoading ? (
              <ActivityIndicator size="small" color="#3498db" />
            ) : (
              <Switch
                value={localBiometricEnabled}
                onValueChange={toggleBiometricAuth}
                disabled={!isBiometricSupported}
                trackColor={{ false: '#767577', true: '#bde0fe' }}
                thumbColor={localBiometricEnabled ? '#3498db' : '#f4f3f4'}
                style={{ marginLeft: 10 }}
              />
            )}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Password</Text>
          
          <TouchableOpacity 
            style={styles.settingButton}
            // Placeholder for password change functionality
            onPress={() => navigation.navigate('ChangePassword')}
          >
            <View style={styles.settingTextContainer}>
              <View style={styles.iconContainer}>
                <Ionicons name="key-outline" size={24} color="#3498db" />
              </View>
              <View>
                <Text style={styles.settingTitle}>Change Password</Text>
                <Text style={styles.settingDescription}>
                  Update your account password
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>
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
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    lineHeight: 22,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    color: '#333',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  settingButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  settingTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f7fd',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  settingDescription: {
    flex: 1,
    fontSize: 12,
    color: '#666',
    flexShrink: 1,
    paddingRight: 10,
  },
});

export default SecuritySettingsScreen; 