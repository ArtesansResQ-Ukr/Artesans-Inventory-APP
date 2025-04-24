import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { 
  Text, 
  TextInput, 
  Button, 
  Headline, 
  useTheme, 
  Divider, 
  Switch, 
  HelperText,
  Chip,
  IconButton,
  List,
  Snackbar,
  Portal,
  Dialog,
  Paragraph
} from 'react-native-paper';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { AppStackParamList } from '../../navigation/types/navigation';
import { getUsers, updateUser, addPermissions, removePermissions } from '../../services/api/userApi';
import { useAuth } from '../../contexts/AuthContext';
import { getAllGroups } from '../../services/api/groupApi';
import DropDownPicker from 'react-native-dropdown-picker';

interface UserUpdate {
  username?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  arq_id?: string;
  active?: boolean;
  language_preference?: string;
}

interface User extends UserUpdate {
  uuid: string;
  permissions?: string[];
  group_name?: string[];
}

// Available permissions (should come from an API ideally)
const AVAILABLE_PERMISSIONS = [
  'create_user',
  'manage_user',
  'create_group',
  'manage_group',
  'create_role',
  'manage_role',
  'read_products',
  'manage_products',
  'read_history'
];

type UpdateUserScreenRouteProp = RouteProp<AppStackParamList, 'UpdateUser'>;

const UpdateUserScreen = () => {
  const theme = useTheme();
  const navigation = useNavigation<StackNavigationProp<AppStackParamList>>();
  const route = useRoute<UpdateUserScreenRouteProp>();
  const { user: currentUser } = useAuth();
  const { userId } = route.params;
  
  const [originalUser, setOriginalUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserUpdate>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [confirmDialogVisible, setConfirmDialogVisible] = useState(false);
  const [permissionsChanged, setPermissionsChanged] = useState<{
    added: string[];
    removed: string[];
  }>({ added: [], removed: [] });
  
  // Language dropdown state
  const [openLanguage, setOpenLanguage] = useState(false);
  const [languages, setLanguages] = useState([
    { label: 'English', value: 'en' },
    { label: 'Ukrainian', value: 'uk' }
  ]);
  
  // Permission dropdown state
  const [openPermissions, setOpenPermissions] = useState(false);
  const [permissionsToAdd, setPermissionsToAdd] = useState<string | null>(null);
  const [permissionDropdownItems, setPermissionDropdownItems] = useState(
    AVAILABLE_PERMISSIONS.map(perm => ({ label: perm, value: perm }))
  );
  
  // Check if user has permission to manage users
  const hasManagePermission = currentUser?.uuid === userId || 
    (currentUser?.permissions?.includes('manage_user') ?? false);

  useEffect(() => {
    fetchUser();
  }, [userId]);

  const fetchUser = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const userData = await getUsers(userId);
      setOriginalUser(userData);
      
      // Initialize form with user data
      setUserData({
        username: userData.username,
        first_name: userData.first_name,
        last_name: userData.last_name,
        email: userData.email,
        arq_id: userData.arq_id,
        active: userData.active,
        language_preference: userData.language_preference
      });
    } catch (error) {
      console.error('Error fetching user data:', error);
      
      // Check if error is permission denied (403)
      if (error instanceof Error && 'response' in error && 
          typeof error.response === 'object' && 
          error.response !== null && 
          'status' in error.response && 
          error.response.status === 403) {
        setPermissionDenied(true);
      } else {
        setError('Failed to load user data. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Update form field
  const updateField = (field: keyof UserUpdate, value: any) => {
    setUserData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (userData.email && !/\S+@\S+\.\S+/.test(userData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };


  // Handle save user data
  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }
    
    try {
      setSaving(true);
      
      // Only include fields that have been changed
      const changedData: Record<string, any> = {};
      Object.keys(userData).forEach(key => {
        const field = key as keyof UserUpdate;
        if (userData[field] !== originalUser?.[field]) {
          changedData[field] = userData[field];
        }
      });
      
      if (Object.keys(changedData).length > 0) {
        await updateUser(userId, changedData);
      }
      
      // Apply permission changes
      for (const permission of permissionsChanged.added) {
        await addPermissions(permission, userId);
      }
      
      for (const permission of permissionsChanged.removed) {
        await removePermissions(permission, userId);
      }
      
      setSnackbarMessage('User updated successfully');
      setSnackbarVisible(true);
      
      // Reset permission changes
      setPermissionsChanged({ added: [], removed: [] });
      
      // Refresh user data
      await fetchUser();
    } catch (error) {
      console.error('Error updating user:', error);
      setSnackbarMessage('Failed to update user. Please try again.');
      setSnackbarVisible(true);
    } finally {
      setSaving(false);
    }
  };

  // Add permission
  const addPermission = (permission: string) => {
    // Don't add if user already has this permission
    if (originalUser?.permissions?.includes(permission)) {
      return;
    }
    
    // Check if we previously removed this permission
    if (permissionsChanged.removed.includes(permission)) {
      setPermissionsChanged(prev => ({
        ...prev,
        removed: prev.removed.filter(p => p !== permission)
      }));
    } else {
      setPermissionsChanged(prev => ({
        ...prev,
        added: [...prev.added, permission]
      }));
    }
    
    // Clear the selection
    setPermissionsToAdd(null);
  };

  // Remove permission
  const removePermission = (permission: string) => {
    setConfirmDialogVisible(true);
    
    // Check if permission is in the added list
    if (permissionsChanged.added.includes(permission)) {
      setPermissionsChanged(prev => ({
        ...prev,
        added: prev.added.filter(p => p !== permission)
      }));
    } 
    // If it's an original permission, add to removed list
    else if (originalUser?.permissions?.includes(permission)) {
      setPermissionsChanged(prev => ({
        ...prev,
        removed: [...prev.removed, permission]
      }));
    }
  };

  // Get current permissions (original + added - removed)
  const getCurrentPermissions = (): string[] => {
    const originalPermissions = originalUser?.permissions || [];
    const added = permissionsChanged.added || [];
    const removed = permissionsChanged.removed || [];
    
    // Start with original permissions
    const currentPermissions = [...originalPermissions];
    
    // Add new permissions
    added.forEach(permission => {
      if (!currentPermissions.includes(permission)) {
        currentPermissions.push(permission);
      }
    });
    
    // Remove permissions
    const filteredPermissions = currentPermissions.filter(
      permission => !removed.includes(permission)
    );
    
    return filteredPermissions;
  };

  // Get available permissions to add (those not already assigned)
  const getAvailablePermissions = (): string[] => {
    const currentPermissions = getCurrentPermissions();
    return AVAILABLE_PERMISSIONS.filter(
      permission => !currentPermissions.includes(permission)
    );
  };

  // If loading, show loading indicator
  if (loading) {
    return (
      <View style={styles.centeredContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={{ marginTop: 16 }}>Loading user data...</Text>
      </View>
    );
  }

  // If permission denied, show message
  if (permissionDenied) {
    return (
      <View style={styles.centeredContainer}>
        <Text style={{ color: theme.colors.error, textAlign: 'center' }}>
          You do not have permission to edit this user.
          You can only update your own information or users you manage.
        </Text>
        <Button 
          mode="contained" 
          onPress={() => navigation.goBack()} 
          style={{ marginTop: 16 }}
        >
          Go Back
        </Button>
      </View>
    );
  }

  // If error, show error message
  if (error) {
    return (
      <View style={styles.centeredContainer}>
        <Text style={{ color: theme.colors.error, textAlign: 'center' }}>{error}</Text>
        <Button 
          mode="contained" 
          onPress={fetchUser} 
          style={{ marginTop: 16 }}
        >
          Retry
        </Button>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          <Headline style={styles.headline}>Update User</Headline>
          <Divider style={styles.divider} />
          
          <TextInput
            label="Username"
            value={userData.username}
            onChangeText={(text) => updateField('username', text)}
            disabled={true} // Username cannot be changed
            style={styles.input}
          />
          
          <TextInput
            label="First Name"
            value={userData.first_name}
            onChangeText={(text) => updateField('first_name', text)}
            style={styles.input}
            error={!!errors.first_name}
            disabled={saving}
          />
          <HelperText type="error" visible={!!errors.first_name}>
            {errors.first_name}
          </HelperText>
          
          <TextInput
            label="Last Name"
            value={userData.last_name}
            onChangeText={(text) => updateField('last_name', text)}
            style={styles.input}
            error={!!errors.last_name}
            disabled={saving}
          />
          <HelperText type="error" visible={!!errors.last_name}>
            {errors.last_name}
          </HelperText>
          
          <TextInput
            label="Email"
            value={userData.email}
            onChangeText={(text) => updateField('email', text)}
            style={styles.input}
            keyboardType="email-address"
            error={!!errors.email}
            disabled={saving}
          />
          <HelperText type="error" visible={!!errors.email}>
            {errors.email}
          </HelperText>
          
          <TextInput
            label="ARQ ID"
            value={userData.arq_id}
            onChangeText={(text) => updateField('arq_id', text)}
            style={styles.input}
            error={!!errors.arq_id}
            disabled={saving}
          />
          <HelperText type="error" visible={!!errors.arq_id}>
            {errors.arq_id}
          </HelperText>
          
          <View style={styles.switchContainer}>
            <Text>Active</Text>
            <Switch
              value={userData.active || false}
              onValueChange={(value) => updateField('active', value)}
              disabled={saving}
            />
          </View>
          
          <Text style={styles.dropdownLabel}>Language Preference</Text>
          <View style={styles.dropdownContainer}>
            <DropDownPicker
              open={openLanguage}
              value={userData.language_preference || 'en'}
              items={languages}
              setOpen={setOpenLanguage}
              setValue={(callback) => {
                const value = callback(userData.language_preference || 'en');
                updateField('language_preference', value);
              }}
              setItems={setLanguages}
              style={styles.dropdown}
              disabled={saving}
              dropDownContainerStyle={styles.dropdownList}
            />
          </View>
          
          {hasManagePermission && (
            <View style={styles.permissionsSection}>
              <Headline style={styles.sectionTitle}>Permissions</Headline>
              <Divider style={styles.divider} />
              
              <View style={styles.currentPermissions}>
                <Text style={styles.subheading}>Current Permissions</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsContainer}>
                  {getCurrentPermissions().length > 0 ? (
                    getCurrentPermissions().map((permission, index) => (
                      <Chip
                        key={index}
                        style={styles.permissionChip}
                        onClose={() => removePermission(permission)}
                        icon="key-variant"
                      >
                        {permission}
                      </Chip>
                    ))
                  ) : (
                    <Text style={styles.noPermissionsText}>No permissions assigned</Text>
                  )}
                </ScrollView>
              </View>
              
              <View style={styles.addPermissionSection}>
                <Text style={styles.subheading}>Add Permission</Text>
                <View style={styles.permissionDropdownContainer}>
                  <DropDownPicker
                    open={openPermissions}
                    value={permissionsToAdd}
                    items={getAvailablePermissions().map(perm => ({ label: perm, value: perm }))}
                    setOpen={setOpenPermissions}
                    setValue={setPermissionsToAdd}
                    setItems={setPermissionDropdownItems}
                    style={styles.dropdown}
                    multiple={false}
                    disabled={saving || getAvailablePermissions().length === 0}
                    placeholder="Select permission to add"
                    dropDownContainerStyle={styles.dropdownList}
                    zIndex={1000}
                  />
                  <Button 
                    mode="contained" 
                    onPress={() => {
                      if (permissionsToAdd) {
                        addPermission(permissionsToAdd);
                      }
                    }}
                    style={styles.addButton}
                    disabled={!permissionsToAdd || saving}
                    icon="plus"
                  >
                    Add
                  </Button>
                </View>
              </View>
            </View>
          )}
          
          <View style={styles.buttonContainer}>
            <Button
              mode="outlined"
              onPress={() => navigation.goBack()}
              style={styles.button}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button
              mode="contained"
              onPress={handleSave}
              style={styles.button}
              loading={saving}
              disabled={saving}
            >
              Save Changes
            </Button>
          </View>
        </View>
      </ScrollView>
      
      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        action={{
          label: 'OK',
          onPress: () => setSnackbarVisible(false),
        }}
      >
        {snackbarMessage}
      </Snackbar>
      
      <Portal>
        <Dialog visible={confirmDialogVisible} onDismiss={() => setConfirmDialogVisible(false)}>
          <Dialog.Title>Remove Permission</Dialog.Title>
          <Dialog.Content>
            <Paragraph>Are you sure you want to remove this permission?</Paragraph>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setConfirmDialogVisible(false)}>Cancel</Button>
            <Button onPress={() => setConfirmDialogVisible(false)}>Confirm</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  headline: {
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 24,
    marginBottom: 8,
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
    marginBottom: 16,
    zIndex: 3000,
  },
  dropdown: {
    backgroundColor: 'transparent',
    borderColor: '#ccc',
  },
  dropdownList: {
    backgroundColor: 'white',
    borderColor: '#ccc',
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 16,
    paddingHorizontal: 12,
  },
  permissionsSection: {
    marginTop: 8,
  },
  currentPermissions: {
    marginBottom: 24,
  },
  subheading: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'nowrap',
  },
  permissionChip: {
    margin: 4,
  },
  noPermissionsText: {
    fontStyle: 'italic',
    opacity: 0.7,
    padding: 8,
  },
  addPermissionSection: {
    marginBottom: 16,
    zIndex: 1000,
  },
  permissionDropdownContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addButton: {
    marginLeft: 8,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
  },
  button: {
    flex: 0.48,
  },
});

export default UpdateUserScreen;