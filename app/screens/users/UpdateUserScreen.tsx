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
  Menu,
} from 'react-native-paper';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { UserManagementStackParamList } from '../../navigation/types/navigation';
import { getUsersByUuid, updateUser, getGroupUserIn, getUserPermissions } from '../../services/api/userApi';
import { addUserToGroup, removeUserFromGroup, searchGroup } from '../../services/api/groupApi';
import { useAuth } from '../../contexts/AuthContext';
import { getAllGroups } from '../../services/api/groupApi';
import DropDownPicker from 'react-native-dropdown-picker';
import { MaterialIcons } from '@expo/vector-icons';
import { colors, colorVariations, textColors } from '../../theme/colors';
import { addPermissions, removePermissions, getAllPermissions } from '../../services/api/permissionApi';


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

interface UserGroups {
  user_uuid: string;
  groups: {
    group_uuid: string;
    group_name: string;
  }[];
}

interface Permission {
  uuid: string;
  name: string;
}



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

  
  // Group state
  const [userGroups, setUserGroups] = useState<Group[]>([]);
  const [groupLoading, setGroupLoading] = useState(false);
  const [groupError, setGroupError] = useState<string | null>(null);
  
  // Language dropdown state
  const [openLanguage, setOpenLanguage] = useState(false);
  const [languages, setLanguages] = useState([
    { label: 'English', value: 'en' },
    { label: 'Ukrainian', value: 'uk' }
  ]);
  
  // Permission dropdown state
  const [selectedPermission, setSelectedPermission] = useState<Permission | null>(null);
  const [menuVisible, setMenuVisible] = useState(false);
  const [availablePermissions, setAvailablePermissions] = useState<Permission[]>([]);

  // State for groups dropdown
  const [groupMenuVisible, setGroupMenuVisible] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<{uuid: string, name: string} | null>(null);
  const [availableGroups, setAvailableGroups] = useState<{uuid: string, name: string}[]>([]);


  // Add state variable to store current permissions
  const [currentPermissionsList, setCurrentPermissionsList] = useState<Permission[]>([]);

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
          setUserGroups([]);
        } else {
          setGroupError(result.error.message);
        }
        return;
      }
      
      if (result && result.data && result.data.groups && result.data.user_uuid) {
        // Map groups to the userGroups array
        const groups = result.data.groups.map((group: any) => ({
          user_uuid: result.data?.user_uuid as string,
          group_uuid: group.group_uuid,
          group_name: group.group_name
        }));
        setUserGroups(groups);
      } else {
        setUserGroups([]);
      }
    } catch (error) {
      console.error('Error fetching user group:', error);
      setGroupError('An unexpected error occurred fetching group information.');
    } finally {
      setGroupLoading(false);
    }
  };
  
  const fetchAvailableGroups = async () => {
    try {
      setGroupLoading(true);
      setGroupError(null);
      
      // First, get the user's current groups
      const userGroupsResult = await getGroupUserIn(userId);
      const userGroupIds: string[] = [];
      
      if (userGroupsResult.data && userGroupsResult.data.groups) {
        userGroupsResult.data.groups.forEach(group => {
          userGroupIds.push(group.group_uuid);
        });
      }
      
      // Then get all available groups
      const result = await getAllGroups();
      if (result.error) {
        setGroupError(result.error.message);
        return;
      }
      
      if (result.data) {
        // Filter out all groups the user is already in
        const groups = result.data.filter(g => !userGroupIds.includes(g.uuid));
        setAvailableGroups(groups.map(g => ({ uuid: g.uuid, name: g.name })));
      }
    } catch (error) {
      console.error('Error fetching available groups:', error);
      setGroupError('An error occurred while fetching available groups.');
    } finally {
      setGroupLoading(false);
    }
  };

  // Update the handleAddUserToGroup function
  const handleAddUserToGroup = () => {
    if (!selectedGroup || !userId) return;
    
    // Check if user is already in this group
    if (userGroups.some(g => g.group_uuid === selectedGroup.uuid)) {
      setSnackbarMessage('User is already in this group');
      setSnackbarVisible(true);
      return;
    }
    
    // Set up confirmation dialog
    setConfirmDialogTitle('Add to Group');
    setConfirmDialogMessage(`Are you sure you want to add this user to the group? ${selectedGroup.name}`);
    setConfirmDialogAction(() => async () => {
      try {
        setSaving(true);
        const result = await addUserToGroup(selectedGroup.uuid, userId);
        if (result.error) {
          setSnackbarMessage(result.error.message);
          setSnackbarVisible(true);
          setConfirmDialogVisible(false);
          setSaving(false);
          return;
        }
        
        // Reset selection and refresh group data
        setSelectedGroup(null);
        await fetchUserGroup(userId);
        await fetchAvailableGroups();
        
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

  // Add handleRemoveUserFromGroup back
  const handleRemoveUserFromGroup = (groupUuid: string, groupName: string) => {
    // Set up confirmation dialog
    setConfirmDialogTitle('Remove from Group');
    setConfirmDialogMessage(`Are you sure you want to remove this user from the group "${groupName}"?`);
    setConfirmDialogAction(() => async () => {
      try {
        setSaving(true);
        
        const result = await removeUserFromGroup(groupUuid, userId);
        if (result.error) {
          setSnackbarMessage(result.error.message);
          setSnackbarVisible(true);
          setConfirmDialogVisible(false);
          setSaving(false);
          return;
        }
        
        // Refresh group data
        await fetchUserGroup(userId);
        await fetchAvailableGroups();
        
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
      
    } catch (error) {
      console.error('Error updating user:', error);
      setSnackbarMessage('An unexpected error occurred. Please try again.');
      setSnackbarVisible(true);
    } finally {
      setSaving(false);
    }
  };

  // Add permission
  const handleAddPermission = async (permission_uuid: string, user_uuid: string) => {
    if (!selectedPermission) {
      setSnackbarMessage('Please select a permission');
      setSnackbarVisible(true);
      return;
    }
    console.log(permission_uuid, user_uuid);
    const result = await addPermissions(permission_uuid, user_uuid);
    if (result.error) {
      setSnackbarMessage(`Error adding permission: ${result.error.message}`);
      setSnackbarVisible(true);
    } else {
      setSnackbarMessage('Permission added successfully');
      setSnackbarVisible(true);
      setCurrentPermissionsList(prev => [...prev, selectedPermission]);
    }
  };

  // Remove permission
  const handleRemovePermission = async (permission_uuid: string, user_uuid: string) => {
    // Set up confirmation dialog
    setConfirmDialogTitle('Remove Permission');
    setConfirmDialogMessage('Are you sure you want to remove this permission?');
    setConfirmDialogAction(() => async () => {
      // Check if permission is in the added list
      const response = await removePermissions(permission_uuid, user_uuid);
      if (response.error) {
        setSnackbarMessage(response.error.message);
        setSnackbarVisible(true);
      } else {
        setSnackbarMessage('Permission removed successfully');
        setSnackbarVisible(true);
        setCurrentPermissionsList(prev => prev.filter(p => p.uuid !== permission_uuid));
      }
      setConfirmDialogVisible(false);
    });
    setConfirmDialogVisible(true);
  };

  // Get current permissions (original + added - removed)
  const getCurrentPermissions = async (): Promise<Permission[]> => {
    const response = await getUserPermissions(userId);
    let originalPermissions: Permission[] = [];
    
    if (response?.data) {
      // Handle the permissions array based on the API response format
      if (Array.isArray(response.data)) {
        originalPermissions = response.data.map((p: {uuid: string, name: string}) => ({ 
          uuid: p.uuid, 
          name: p.name 
        }));
      } else if (response.data.permissions) {
        // Handle case where permissions might be strings or objects
        originalPermissions = response.data.permissions.map((p: any) => {
          if (typeof p === 'string') {
            // This is just a fallback in case we get string permissions
            return { uuid: p, name: p };
          } else {
            return { uuid: p.uuid, name: p.name };
          }
        });
      }
    }
    
    setCurrentPermissionsList(originalPermissions);
    
    return originalPermissions;
  };

  // Update permissions list when needed
  useEffect(() => {
    const updatePermissions = async () => {
      const permissions = await getCurrentPermissions();
      setCurrentPermissionsList(permissions);
      
      // Also fetch available permissions
      const allPermissions = await getAvailablePermissions();
      setAvailablePermissions(allPermissions);
    };
    
    updatePermissions();
  }, [userId]);

  // Get available permissions to add (those not already assigned)
  const getAvailablePermissions = async (): Promise<any> => {
    const result = await getAllPermissions();
    if (result.error) {
      setSnackbarMessage(result.error.message);
      setSnackbarVisible(true);
    }
    return result?.data || [];
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
          
          {(
            <View style={styles.groupSection}>
              <Headline style={styles.sectionTitle}>Groups</Headline>
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
                  {/* Current Groups */}
                  {userGroups.length > 0 ? (
                    <Card style={styles.currentGroupCard}>
                      <Card.Content>
                        <Text style={styles.subheading}>Current Groups</Text>
                        <View style={styles.groupsContainer}>
                          {userGroups.map((group) => (
                            <View key={group.group_uuid} style={styles.groupChipContainer}>
                              <Chip 
                                style={styles.groupChip}
                                icon="account-group"
                                selectedColor={colors.white}
                                textStyle={styles.groupChipText}
                              >
                                {group.group_name}
                              </Chip>
                              <Button 
                                mode="outlined" 
                                icon="account-remove" 
                                onPress={() => handleRemoveUserFromGroup(group.group_uuid, group.group_name)}
                                disabled={saving}
                                style={styles.removeGroupButton}
                                color={colors.error}
                                compact={true}
                              >
                                Remove
                              </Button>
                            </View>
                          ))}
                        </View>
                      </Card.Content>
                    </Card>
                  ) : (
                    <Card style={styles.currentGroupCard}>
                      <Card.Content>
                        <Text style={styles.subheading}>Current Groups</Text>
                        <Text style={{ fontStyle: 'italic', opacity: 0.7 }}>
                          Not assigned to any group
                        </Text>
                      </Card.Content>
                    </Card>
                  )}
                  
                  {/* Group Dropdown */}
                  <Card style={styles.card}>
                    <Card.Title title="Add to Group" />
                    <Card.Content>
                      {groupError && (
                        <HelperText type="error">{groupError}</HelperText>
                      )}
                      
                      <Menu
                        visible={groupMenuVisible}
                        onDismiss={() => setGroupMenuVisible(false)}
                        anchor={
                          <TouchableOpacity 
                            style={styles.dropdownButton} 
                            onPress={() => {
                              fetchAvailableGroups();
                              setGroupMenuVisible(true);
                            }}
                          >
                            <Text style={styles.dropdownButtonText}>
                              {selectedGroup ? selectedGroup.name : 'Select a group'}
                            </Text>
                            <MaterialIcons name="arrow-drop-down" size={24} color="#000" />
                          </TouchableOpacity>
                        }
                      >
                        {availableGroups.map((group) => (
                          <Menu.Item
                            key={group.uuid}
                            onPress={() => {
                              setSelectedGroup(group);
                              setGroupMenuVisible(false);
                            }}
                            title={group.name}
                          />
                        ))}
                        {availableGroups.length === 0 && (
                          <Menu.Item title="No groups available" disabled />
                        )}
                      </Menu>

                      <Button 
                        mode="contained"
                        onPress={() => selectedGroup && handleAddUserToGroup()}
                        disabled={!selectedGroup}
                        style={styles.actionButton}
                      >
                        Add to Group
                      </Button>
                    </Card.Content>
                  </Card>
                </>
              )}
            </View>
          )}
          
          {(
            <View style={styles.permissionsSection}>
              <Headline style={styles.sectionTitle}>Permissions</Headline>
              <Divider style={styles.divider} />
              
              <View style={styles.currentPermissions}>
                <Text style={styles.subheading}>Current Permissions</Text>
                <FlatList
                  horizontal
                  data={currentPermissionsList}
                  keyExtractor={(item, index) => `${item.uuid}-${index}`}
                  renderItem={({ item }) => (
                    <Chip
                      style={styles.permissionChip}
                      onClose={() => handleRemovePermission(item.uuid, userId)}
                      icon="key-variant"
                      selectedColor={colors.white}
                      textStyle={styles.permissionChipText}
                    >
                      {item.name}
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
                    disabled={saving || availablePermissions.length === 0}>
              {selectedPermission?.name || 'Select permission'}
              </Button>
            }>
            {availablePermissions.map((perm: Permission) => (
          <Menu.Item key={perm.uuid} onPress={() => {
            setSelectedPermission({ uuid: perm.uuid, name: perm.name });
            setMenuVisible(false);
          }} title={perm.name} />
        ))}
      </Menu>

          <Button mode="contained" onPress={() => {
            if (selectedPermission && userId) {
              handleAddPermission(selectedPermission.uuid, userId)
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
    backgroundColor: colors.white,
    borderColor: colorVariations.backgroundDarker,
  },
  dropdownList: {
    backgroundColor: colors.white,
    borderColor: colorVariations.backgroundDarker,
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
    backgroundColor: colorVariations.primaryLight,
  },
  permissionChipText: {
    color: colors.white,
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
    padding: 4,
    backgroundColor: colors.white,
  },
  groupItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  groupsContainer: {
    marginTop: 8,
  },
  groupChipContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    backgroundColor: colors.background,
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
    elevation: 1,
  },
  groupChip: {
    backgroundColor: colorVariations.secondaryLight,
  },
  groupChipText: {
    color: colors.white,
    fontWeight: '500',
  },
  removeGroupButton: {
    marginLeft: 12,
    borderColor: colorVariations.secondaryLight,
  },
  centered: {
    alignItems: 'center',
    marginVertical: 16,
  },
  card: {
    marginBottom: 12,
  },
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  dropdownButtonText: {
    marginRight: 8,
  },
  actionButton: {
    marginTop: 8,
  },
});

export default UpdateUserScreen;