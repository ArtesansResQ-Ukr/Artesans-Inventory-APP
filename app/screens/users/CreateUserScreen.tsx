import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  ScrollView, 
  StyleSheet, 
  Platform, 
  KeyboardAvoidingView, 
  Keyboard, 
  TouchableWithoutFeedback
} from 'react-native';
import { 
  Text, 
  TextInput, 
  Button, 
  HelperText, 
  useTheme, 
  Headline, 
  Divider,
  Chip,
  Portal,
  Dialog,
  Paragraph
} from 'react-native-paper';
import { createUser } from '../../services/api/userApi';
import { getAllGroups } from '../../services/api/groupApi';
import DropDownPicker from 'react-native-dropdown-picker';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring
} from 'react-native-reanimated';

interface UserCreate {
  username?: string;
  first_name: string;
  last_name: string;
  email: string;
  arq_id: string;
  language_preference?: string;
}

interface Group {
  uuid: string;
  name: string;
}

const CreateUserScreen = ({ navigation }: { navigation: any }) => {
  const theme = useTheme();
  const [userData, setUserData] = useState<UserCreate>({
    first_name: '',
    last_name: '',
    email: '',
    arq_id: '',
    language_preference: 'en'
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [successDialogVisible, setSuccessDialogVisible] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [tempPassword, setTempPassword] = useState('');
  
  // Language dropdown state
  const [openLanguage, setOpenLanguage] = useState(false);
  const [languages, setLanguages] = useState([
    { label: 'English', value: 'en' },
    { label: 'Ukrainian', value: 'uk' }
  ]);

  // Animation values
  const translateY = useSharedValue(0);
  const opacity = useSharedValue(1);

  // Animated styles
  const contentAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY.value }],
      opacity: opacity.value
    };
  });

  useEffect(() => {
    // Start entry animation
    translateY.value = withSpring(0, { damping: 15 });
    opacity.value = withSpring(1);
    
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => {
        translateY.value = withSpring(-50, { damping: 15 });
      }
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        translateY.value = withSpring(0, { damping: 15 });
      }
    );

    return () => {
      keyboardDidHideListener.remove();
      keyboardDidShowListener.remove();
    };
  }, []);

  // Update form data
  const updateField = (field: keyof UserCreate, value: string) => {
    setUserData(prevData => ({
      ...prevData,
      [field]: value
    }));
    
    // Clear error for this field if it exists
    if (errors[field]) {
      setErrors(prevErrors => {
        const newErrors = { ...prevErrors };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!userData.first_name.trim()) {
      newErrors.first_name = 'First name is required';
    }
    
    if (!userData.last_name.trim()) {
      newErrors.last_name = 'Last name is required';
    }
    
    if (!userData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(userData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!userData.arq_id.trim()) {
      newErrors.arq_id = 'ARQ ID is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle create user
  const handleCreateUser = async () => {
    if (!validateForm()) {
      return;
    }
    
    try {
      setLoading(true);
      const response = await createUser(userData);
      
      // Show success message
      setSuccessMessage(response.message || 'User created successfully');
      setTempPassword(response.temp_password || '');
      setSuccessDialogVisible(true);
      
      // Reset form
      setUserData({
        first_name: '',
        last_name: '',
        email: '',
        arq_id: '',
        language_preference: 'en'
      });
    } catch (error: any) {
      console.error('Error creating user:', error);
      if (error.response?.data?.detail) {
        setErrors({
          form: error.response.data.detail
        });
      } else {
        setErrors({
          form: 'Failed to create user. Please try again.'
        });
      }
    } finally {
      setLoading(false);
    }
  };

  // Close dialog and navigate back
  const handleCloseDialog = () => {
    setSuccessDialogVisible(false);
    // Navigate back after successful creation
    setTimeout(() => {
      navigation.goBack();
    }, 300);
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardAvoidView}
        >
          <Animated.View style={[styles.content, contentAnimatedStyle]}>
            <ScrollView 
              style={styles.scrollView}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
            >
              <Headline style={styles.headline}>Create New User</Headline>
              <Divider style={styles.divider} />

              {errors.form && (
                <HelperText type="error" visible={!!errors.form}>
                  {errors.form}
                </HelperText>
              )}

              <TextInput
                label="First Name *"
                value={userData.first_name}
                onChangeText={(text) => updateField('first_name', text)}
                style={styles.input}
                error={!!errors.first_name}
                disabled={loading}
              />
              <HelperText type="error" visible={!!errors.first_name}>
                {errors.first_name}
              </HelperText>

              <TextInput
                label="Last Name *"
                value={userData.last_name}
                onChangeText={(text) => updateField('last_name', text)}
                style={styles.input}
                error={!!errors.last_name}
                disabled={loading}
              />
              <HelperText type="error" visible={!!errors.last_name}>
                {errors.last_name}
              </HelperText>

              <TextInput
                label="Email *"
                value={userData.email}
                onChangeText={(text) => updateField('email', text)}
                style={styles.input}
                keyboardType="email-address"
                error={!!errors.email}
                disabled={loading}
              />
              <HelperText type="error" visible={!!errors.email}>
                {errors.email}
              </HelperText>

              <TextInput
                label="ARQ ID *"
                value={userData.arq_id}
                onChangeText={(text) => updateField('arq_id', text)}
                style={styles.input}
                error={!!errors.arq_id}
                disabled={loading}
              />
              <HelperText type="error" visible={!!errors.arq_id}>
                {errors.arq_id}
              </HelperText>

              <Text style={styles.dropdownLabel}>Language Preference</Text>
              <View style={styles.dropdownContainer}>
                <DropDownPicker
                  open={openLanguage}
                  value={userData.language_preference || null}
                  items={languages}
                  setOpen={setOpenLanguage}
                  setValue={(callback) => {
                    const value = callback(userData.language_preference);
                    updateField('language_preference', value);
                  }}
                  setItems={setLanguages}
                  style={styles.dropdown}
                  disabled={loading}
                  dropDownContainerStyle={styles.dropdownList}
                />
              </View>

              <View style={styles.buttonContainer}>
                <Button
                  mode="outlined"
                  onPress={() => navigation.goBack()}
                  style={styles.button}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  mode="contained"
                  onPress={handleCreateUser}
                  style={styles.button}
                  loading={loading}
                  disabled={loading}
                >
                  Create User
                </Button>
              </View>
            </ScrollView>
          </Animated.View>
        </KeyboardAvoidingView>

        {/* Success Dialog */}
        <Portal>
          <Dialog visible={successDialogVisible} onDismiss={handleCloseDialog}>
            <Dialog.Title>Success</Dialog.Title>
            <Dialog.Content>
              <Paragraph>{successMessage}</Paragraph>
              {tempPassword && (
                <View style={styles.passwordContainer}>
                  <Text style={styles.passwordLabel}>Temporary Password:</Text>
                  <Chip icon="key" style={styles.passwordChip}>{tempPassword}</Chip>
                  <Text style={styles.passwordNote}>
                    Please share this temporary password with the user.
                    They will be prompted to change it on first login.
                  </Text>
                </View>
              )}
            </Dialog.Content>
            <Dialog.Actions>
              <Button onPress={handleCloseDialog}>Done</Button>
            </Dialog.Actions>
          </Dialog>
        </Portal>
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  keyboardAvoidView: {
    flex: 1,
  },
  content: {
    flex: 1,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -3,
    },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  headline: {
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 16,
  },
  divider: {
    marginBottom: 16,
  },
  input: {
    marginBottom: 4,
    backgroundColor: 'transparent',
  },
  dropdownLabel: {
    fontSize: 12,
    marginBottom: 4,
    marginTop: 8,
    paddingHorizontal: 12,
  },
  dropdownContainer: {
    marginBottom: 24,
    zIndex: 1000,
  },
  dropdown: {
    backgroundColor: 'transparent',
    borderColor: '#ccc',
  },
  dropdownList: {
    backgroundColor: 'white',
    borderColor: '#ccc',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  button: {
    flex: 0.48,
  },
  passwordContainer: {
    marginTop: 16,
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
  },
  passwordLabel: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  passwordChip: {
    marginBottom: 8,
  },
  passwordNote: {
    fontSize: 12,
    fontStyle: 'italic',
    opacity: 0.7,
  },
});

export default CreateUserScreen; 