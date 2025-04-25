import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, ActivityIndicator, TouchableOpacity, FlatList, KeyboardAvoidingView } from 'react-native';
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
  Paragraph,
  Card,
  Searchbar,
  Menu,
  DividerProps,
} from 'react-native-paper';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { UserManagementStackParamList } from '../../navigation/types/navigation';
import { getUsersByUuid, updateUser, addPermissions, removePermissions, getGroupUserIn } from '../../services/api/userApi';
import { addUserToGroup, removeUserFromGroup, searchGroup } from '../../services/api/groupApi';
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

interface Group {
  user_uuid: string;
  group_uuid: string;
  group_name: string;
}

interface SearchGroupResult {
  uuid: string;
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

type UpdateUserScreenRouteProp = RouteProp<UserManagementStackParamList, 'UpdateUser'>;

const UpdateUserScreen = () => {
  const theme = useTheme();
  const navigation = useNavigation<StackNavigationProp<UserManagementStackParamList>>();
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
  const [confirmDialogAction, setConfirmDialogAction] = useState<() => void>(() => {});
  const [confirmDialogTitle, setConfirmDialogTitle] = useState('');
  const [confirmDialogMessage, setConfirmDialogMessage] = useState('');
  const [permissionsChanged, setPermissionsChanged] = useState<{
    added: string[];
    removed: string[];
  }>({ added: [], removed: [] });
  
  // Group state
  const [userGroup, setUserGroup] = useState<Group | null>(null);
  const [groupLoading, setGroupLoading] = useState(false);
  const [groupSearchQuery, setGroupSearchQuery] = useState('');
  const [groupSearchResult, setGroupSearchResult] = useState<SearchGroupResult | null>(null);
  const [searchingGroup, setSearchingGroup] = useState(false);
  const [groupError, setGroupError] = useState<string | null>(null);
  
  // Language dropdown state
  const [openLanguage, setOpenLanguage] = useState(false);
  const [languages, setLanguages] = useState([
    { label: 'English', value: 'en' },
    { label: 'Ukrainian', value: 'uk' }
  ]);
  
  // Permission dropdown state
  const [openPermissions, setOpenPermissions] = useState(false);
  const [permissionsToAdd, setPermissionsToAdd] = useState<string | null>(null);
  const [selectedPermission, setSelectedPermission] = useState<string | null>(null);
  const [menuVisible, setMenuVisible] = useState(false);
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
      
      const result = await getUsersByUuid(userId);
      if (result.error) {
        if (result.error.status === 403) {
          setPermissionDenied(true);
        }
        setError(result.error.message);
        return;
      }
      
      if (!result.data) {
        setError('No user data received from server');
        return;
      }
      
      setOriginalUser(result.data);
      
      // Initialize form with user data
      setUserData({
        username: result.data.username,
        first_name: result.data.first_name,
        last_name: result.data.last_name,
        email: result.data.email,
        arq_id: result.data.arq_id,
        active: result.data.active,
        language_preference: result.data.language_preference
      });
      
      // Fetch user's group
      fetchUserGroup(userId);
    } catch (error) {
      console.error('Error fetching user data:', error);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const fetchUserGroup = async (userId: string) => {
    try {
      setGroupLoading(true);
      setGroupError(null);
      
      const result = await getGroupUserIn(userId);
      if (result.error) {
        // 404 error means user is not in any group - this is a valid state
        if (result.error.status === 404) {
          setUserGroup(null);
        } else {
          setGroupError(result.error.message);
        }
        return;
      }
      
      if (result.data) {
        setUserGroup(result.data);
      } else {
        setUserGroup(null);
      }
    } catch (error) {
      console.error('Error fetching user group:', error);
      setGroupError('An unexpected error occurred fetching group information.');
    } finally {
      setGroupLoading(false);
    }
  };
  
  const searchForGroup = async () => {
    if (!groupSearchQuery.trim()) {
      setSnackbarMessage('Please enter a group name to search');
      setSnackbarVisible(true);
      return;
    }
    
    try {
      setSearchingGroup(true);
      setGroupError(null);
      setGroupSearchResult(null);
      
      const result = await searchGroup(groupSearchQuery);
      if (result.error) {
        setGroupError(result.error.message);
        return;
      }
      
      if (result.data) {
        setGroupSearchResult(result.data);
      } else {
        setGroupError('No group found with that name');
      }
    } catch (error) {
      console.error('Error searching for group:', error);
      setGroupError('An unexpected error occurred searching for group.');
    } finally {
      setSearchingGroup(false);
    }
  };
  
  const handleAddUserToGroup = () => {
    if (!groupSearchResult || !userId) return;
    
    // Check if user is already in this group
    if (userGroup && userGroup.group_uuid === groupSearchResult.uuid) {
      setSnackbarMessage('User is already in this group');
      setSnackbarVisible(true);
      return;
    }
    
    // Set up confirmation dialog
    setConfirmDialogTitle('Add to Group');
    setConfirmDialogMessage(`Are you sure you want to add this user to the group? ${userGroup ? 'This will remove the user from their current group.' : ''}`);
    setConfirmDialogAction(() => async () => {
      try {
        setSaving(true);
        
        const result = await addUserToGroup(groupSearchResult.uuid, userId);
        if (result.error) {
          setSnackbarMessage(result.error.message);
          setSnackbarVisible(true);
          setConfirmDialogVisible(false);
          setSaving(false);
          return;
        }
        
        // Reset search and refresh group data
        setGroupSearchQuery('');
        setGroupSearchResult(null);
        await fetchUserGroup(userId);
        
        setSnackbarMessage('User added to group successfully');
        setSnackbarVisible(true);
      } catch (error) {
        console.error('Error adding user to group:', error);
        setSnackbarMessage('An unexpected error occurred adding user to group.');
        setSnackbarVisible(true);
      } finally {
        setSaving(false);
        setConfirmDialogVisible(false);
      }
    });
    
    setConfirmDialogVisible(true);
  };
  
  const handleRemoveUserFromGroup = () => {
    if (!userGroup) return;
    
    // Set up confirmation dialog
    setConfirmDialogTitle('Remove from Group');
    setConfirmDialogMessage('Are you sure you want to remove this user from their current group?');
    setConfirmDialogAction(() => async () => {
      try {
        setSaving(true);
        
        const result = await removeUserFromGroup(userGroup.group_uuid, userId);
        if (result.error) {
          setSnackbarMessage(result.error.message);
          setSnackbarVisible(true);
          setConfirmDialogVisible(false);
          setSaving(false);
          return;
        }
        
        // Refresh group data
        setUserGroup(null);
        
        setSnackbarMessage('User removed from group successfully');
        setSnackbarVisible(true);
      } catch (error) {
        console.error('Error removing user from group:', error);
        setSnackbarMessage('An unexpected error occurred removing user from group.');
        setSnackbarVisible(true);
      } finally {
        setSaving(false);
        setConfirmDialogVisible(false);
      }
    });
    
    setConfirmDialogVisible(true);
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
      
      // Update user if there are changed fields
      if (Object.keys(changedData).length > 0) {
        const updateResult = await updateUser(userId, changedData);
        if (updateResult.error) {
          setSnackbarMessage(updateResult.error.message);
          setSnackbarVisible(true);
          setSaving(false);
          return;
        }
      }
      
      // Apply permission changes
      let permissionError = false;
      
      for (const permission of permissionsChanged.added) {
        const addResult = await addPermissions(permission, userId);
        if (addResult.error) {
          setSnackbarMessage(`Error adding permission: ${addResult.error.message}`);
          setSnackbarVisible(true);
          permissionError = true;
          break;
        }
      }
      
      if (!permissionError) {
        for (const permission of permissionsChanged.removed) {
          const removeResult = await removePermissions(permission, userId);
          if (removeResult.error) {
            setSnackbarMessage(`Error removing permission: ${removeResult.error.message}`);
            setSnackbarVisible(true);
            permissionError = true;
            break;
          }
        }
      }
      
      if (!permissionError) {
        setSnackbarMessage('User updated successfully');
        setSnackbarVisible(true);
        
        // Reset permission changes
        setPermissionsChanged({ added: [], removed: [] });
        
        // Refresh user data
        await fetchUser();
      }
    } catch (error) {
      console.error('Error updating user:', error);
      setSnackbarMessage('An unexpected error occurred. Please try again.');
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
    // Set up confirmation dialog
    setConfirmDialogTitle('Remove Permission');
    setConfirmDialogMessage('Are you sure you want to remove this permission?');
    setConfirmDialogAction(() => () => {
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
      setConfirmDialogVisible(false);
    });
    
    setConfirmDialogVisible(true);
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
            <View style={styles.groupSection}>
              <Headline style={styles.sectionTitle}>Group Membership</Headline>
              <Divider style={styles.divider} />
              
              {groupLoading ? (
                <View style={styles.centered}>
                  <ActivityIndicator size="small" color={theme.colors.primary} />
                  <Text style={{ marginTop: 8 }}>Loading group information...</Text>
                </View>
              ) : groupError ? (
                <Text style={{ color: theme.colors.error, textAlign: 'center', marginVertical: 12 }}>
                  {groupError}
                </Text>
              ) : (
                <>
                  {/* Current Group */}
                  {userGroup ? (
                    <Card style={styles.currentGroupCard}>
                      <Card.Content>
                        <View style={styles.groupItem}>
                          <View style={{ flex: 1 }}>
                            <Text style={styles.subheading}>Current Group</Text>
                            <Text>{userGroup.group_name}</Text>
                          </View>
                          <Button 
                            mode="outlined" 
                            icon="account-remove" 
                            onPress={handleRemoveUserFromGroup}
                            disabled={saving}
                            style={{ marginLeft: 8 }}
                          >
                            Remove
                          </Button>
                        </View>
                      </Card.Content>
                    </Card>
                  ) : (
                    <Card style={styles.currentGroupCard}>
                      <Card.Content>
                        <Text style={styles.subheading}>Current Group</Text>
                        <Text style={{ fontStyle: 'italic', opacity: 0.7 }}>
                          Not assigned to any group
                        </Text>
                      </Card.Content>
                    </Card>
                  )}
                  
                  {/* Search for Group */}
                  <Text style={[styles.subheading, { marginTop: 16 }]}>
                    Search for Group
                  </Text>
                  <View style={styles.groupSearchContainer}>
                    <Searchbar
                      placeholder="Search by group name"
                      onChangeText={setGroupSearchQuery}
                      value={groupSearchQuery}
                      style={[styles.searchBar, (saving || searchingGroup) ? { opacity: 0.5 } : {}]}
                      editable={!(saving || searchingGroup)}
                    />
                    
                    <Button
                      mode="contained"
                      onPress={searchForGroup}
                      loading={searchingGroup}
                      disabled={saving || searchingGroup || !groupSearchQuery.trim()}
                      style={styles.searchButton}
                    >
                      Search
                    </Button>
                  </View>
                  
                  
                  {/* Search Results */}
                  {groupSearchResult && (
                    <Card style={styles.searchResultCard}>
                      <Card.Content>
                        <View style={styles.groupItem}>
                          <View style={{ flex: 1 }}>
                            <Text style={styles.subheading}>Found Group</Text>
                            <Text>
                              Group ID: {groupSearchResult.uuid}
                            </Text>
                          </View>
                          <Button 
                            mode="contained" 
                            icon="account-plus" 
                            onPress={handleAddUserToGroup}
                            disabled={saving}
                            style={{ marginLeft: 8 }}
                          >
                            Add
                          </Button>
                        </View>
                      </Card.Content>
                    </Card>
                  )}
                </>
              )}
            </View>
          )}
          
          {hasManagePermission && (
            <View style={styles.permissionsSection}>
              <Headline style={styles.sectionTitle}>Permissions</Headline>
              <Divider style={styles.divider} />
              
              <View style={styles.currentPermissions}>
                <Text style={styles.subheading}>Current Permissions</Text>
                <FlatList
                  horizontal
                  data={getCurrentPermissions()}
                  keyExtractor={(item, index) => `${item}-${index}`}
                  renderItem={({ item }) => (
                  <Chip
                      style={styles.permissionChip}
                      onClose={() => removePermission(item)}
                      icon="key-variant" >
                      {item}
                     </Chip>
                      )}
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.chipsContainer}
                />
              </View>
              
              <View style={styles.addPermissionSection}>
              <Text style={styles.subheading}>Add Permission</Text>
              <View style={styles.permissionDropdownContainer}>
              <Menu
                visible={menuVisible}
                onDismiss={() => setMenuVisible(false)}
                anchor={
              <Button
                    mode="outlined"
                    onPress={() => setMenuVisible(true)}
                    disabled={saving || getAvailablePermissions().length === 0}>
              {selectedPermission || 'Select permission'}
              </Button>
            }>
            {getAvailablePermissions().map((perm) => (
          <Menu.Item key={perm} onPress={() => {
            setSelectedPermission(perm);
            setMenuVisible(false);
          }} title={perm} />
        ))}
      </Menu>

          <Button mode="contained" onPress={async () => {
            if (selectedPermission) {
              try {
                const result = await addPermissions(selectedPermission, userId);
                if (result.error) {
                  setSnackbarMessage(`Error adding permission: ${result.error.message}`);
                  setSnackbarVisible(true);
                } else {
                  addPermission(selectedPermission);
                  setSnackbarMessage('Permission added successfully');
                  setSnackbarVisible(true);
                }
              } catch (error) {
                console.error('Error adding permission:', error);
                setSnackbarMessage('An unexpected error occurred while adding permission.');
                setSnackbarVisible(true);
              }
            }
          }} style={styles.addButton} disabled={!selectedPermission || saving}>
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
          <Dialog.Title>{confirmDialogTitle}</Dialog.Title>
          <Dialog.Content>
            <Paragraph>{confirmDialogMessage}</Paragraph>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setConfirmDialogVisible(false)}>Cancel</Button>
            <Button onPress={confirmDialogAction}>Confirm</Button>
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
  groupSection: {
    marginTop: 8,
    zIndex: 2000,
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
  // Group styles
  currentGroupCard: {
    marginBottom: 12,
  },
  searchResultCard: {
    marginTop: 12,
    marginBottom: 12,
    backgroundColor: '#f0f8ff',
  },
  groupItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  groupSearchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  searchBar: {
    flex: 1,
    marginRight: 8,
    height: 40,
  },
  searchButton: {
    height: 40,
    justifyContent: 'center',
  },
  centered: {
    alignItems: 'center',
    marginVertical: 16,
  },
});

export default UpdateUserScreen;