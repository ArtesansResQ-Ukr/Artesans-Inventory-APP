import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, ActivityIndicator, FlatList } from 'react-native';
import { Text, Card, Button, Divider, TextInput, IconButton, Chip, Snackbar } from 'react-native-paper';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { UserManagementStackParamList } from '../../navigation/types/navigation';
import { 
  getAllUsersInGroup, 
  removeUserFromGroup, 
  addUserToGroup,
  getRolesInGroup
} from '../../services/api/groupApi';
import { searchUsers } from '../../services/api/userApi';
type UpdateGroupNavigationProp = StackNavigationProp<UserManagementStackParamList, 'UpdateGroup'>;
type UpdateGroupRouteProp = RouteProp<UserManagementStackParamList, 'UpdateGroup'>;

interface User {
  uuid: string;
  username: string;
  first_name: string;
  last_name: string;
}

interface Role {
  uuid: string;
  name: string;
  permissions: string[];
}

const UpdateGroupScreen = () => {
  const navigation = useNavigation<UpdateGroupNavigationProp>();
  const route = useRoute<UpdateGroupRouteProp>();
  const { groupId, groupName } = route.params;

  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newUserUuid, setNewUserUuid] = useState('');
  const [searchUsername, setSearchUsername] = useState('');
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [permissionError, setPermissionError] = useState(false);

  useEffect(() => {
    fetchGroupData();
  }, [groupId]);

  const fetchGroupData = async () => {
    setLoading(true);
    setError(null);
    setPermissionError(false);
    
    try {
      // Fetch users in group
      const usersResponse = await getAllUsersInGroup(groupId);
      if (usersResponse.data) {
        setUsers(usersResponse.data.users);
      } else if (usersResponse.error) {
        if (usersResponse.error.status === 403) {
          setPermissionError(true);
        } else {
          setError(usersResponse.error.message);
        }
      }

      // Fetch roles in group
      const rolesResponse = await getRolesInGroup(groupId);
      if (rolesResponse.data) {
        setRoles(rolesResponse.data.roles);
      } else if (rolesResponse.error && rolesResponse.error.status !== 404) {
        // Ignore 404 errors for roles (might not have any)
        if (rolesResponse.error.status === 403 && !permissionError) {
          setPermissionError(true);
        } else if (rolesResponse.error.status !== 404) {
          setError(rolesResponse.error.message);
        }
      }
    } catch (error) {
      console.error('Error fetching group data:', error);
      setError('Failed to load group data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  

  const handleRemoveUser = async (userId: string) => {
    try {
      const response = await removeUserFromGroup(groupId, userId);
      if (response.data) {
        setUsers(users.filter(user => user.uuid !== userId));
        showSnackbar('User removed successfully');
      } else if (response.error) {
        showSnackbar(response.error.message);
      }
    } catch (error) {
      console.error('Error removing user:', error);
      showSnackbar('Failed to remove user');
    }
  };

  const handleAddUser = async () => {
    if (!searchUsername.trim()) {
      showSnackbar('Please enter a valid username');
      return;
    }

    try {
      // First search for user by username
      const searchResponse = await searchUsers({
        username: searchUsername,
        first_name: '',
        last_name: '',
        email: '',
        arq_id: ''
      });

      if (!searchResponse.data || searchResponse.data.length === 0) {
        showSnackbar('No user found with that username');
        return;
      }

      if (searchResponse.data.length > 1) {
        showSnackbar('Multiple users found. Please provide a more specific username');
        return;
      }

      // Get the user's data from search results
      const userData = searchResponse.data[0];
      const userUuid = userData.uuid;
      
      // Now add the user to the group using their UUID
      const response = await addUserToGroup(groupId, userUuid);
      if (response.data) {
        // Since the API response might have empty user data, use the data we got from search
        const newUser = {
          uuid: userData.uuid,
          username: userData.username,
          first_name: userData.first_name || '',
          last_name: userData.last_name || ''
        };
        
        // Check if user is already in the list to avoid duplicates
        if (!users.some(user => user.uuid === newUser.uuid)) {
          setUsers([...users, newUser]);
        }
        
        setSearchUsername('');
        showSnackbar('User added successfully');
      } else if (response.error) {
        showSnackbar(response.error.message);
      }
    } catch (error) {
      console.error('Error adding user:', error);
      showSnackbar('Failed to add user');
    }
  };

  const showSnackbar = (message: string) => {
    setSnackbarMessage(message);
    setSnackbarVisible(true);
  };

  const hideSnackbar = () => {
    setSnackbarVisible(false);
  };

  const renderUserItem = ({ item }: { item: User }) => (
    <Card style={styles.userCard}>
      <Card.Content style={styles.userCardContent}>
        <View>
          <Text style={styles.userName}>{item.first_name} {item.last_name}</Text>
          <Text style={styles.userUsername}>{item.username}</Text>
        </View>
        <IconButton
          icon="close"
          size={20}
          onPress={() => handleRemoveUser(item.uuid)}
        />
      </Card.Content>
    </Card>
  );

  const renderRoleItem = ({ item }: { item: Role }) => (
    <Chip
      style={styles.roleChip}
      onClose={() => {}}
      disabled
    >
      {item.name}
    </Chip>
  );

  if (permissionError) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>
          You do not have permission to view or edit this group.
        </Text>
        <Button 
          mode="contained" 
          onPress={() => navigation.goBack()} 
          style={styles.backButton}
        >
          Go Back
        </Button>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Loading group data...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <Button 
          mode="contained" 
          onPress={fetchGroupData} 
          style={styles.retryButton}
        >
          Retry
        </Button>
        <Button 
          mode="outlined" 
          onPress={() => navigation.goBack()} 
          style={styles.backButton}
        >
          Go Back
        </Button>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.title}>Manage Group: {groupName}</Text>
        <Text style={styles.subtitle}>ID: {groupId}</Text>
      </View>

      <Card style={styles.sectionCard}>
        <Card.Title title="Group Members" titleStyle={styles.sectionTitle} />
        <Card.Content>
          {users.length === 0 ? (
            <Text style={styles.emptyText}>No users in this group</Text>
          ) : (
            <FlatList
              data={users}
              renderItem={renderUserItem}
              keyExtractor={(item) => item.uuid}
              scrollEnabled={false}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
            />
          )}

          <Divider style={styles.divider} />
          
          <View style={styles.addUserSection}>
            <TextInput
              label="Add User (Username)"
              value={searchUsername}
              onChangeText={setSearchUsername}
              style={styles.input}
              placeholder="Enter username to search"
            />
            <Button 
              mode="contained" 
              onPress={handleAddUser} 
              style={styles.addButton}
            >
              Add User
            </Button>
          </View>
        </Card.Content>
      </Card>

      <Card style={styles.sectionCard}>
        <Card.Title title="Group Roles" titleStyle={styles.sectionTitle} />
        <Card.Content>
          {roles.length === 0 ? (
            <Text style={styles.emptyText}>No roles defined for this group</Text>
          ) : (
            <View style={styles.rolesContainer}>
              {roles.map(role => (
                <Chip
                  key={role.uuid}
                  style={styles.roleChip}
                  onClose={() => {}}
                  disabled
                >
                  {role.name}
                </Chip>
              ))}
            </View>
          )}
          
          <Button 
            mode="contained" 
            onPress={() => {}} 
            style={styles.addButton}
            disabled
          >
            Manage Roles (Coming Soon)
          </Button>
        </Card.Content>
      </Card>

      <Button 
        mode="outlined" 
        onPress={() => navigation.goBack()} 
        style={styles.backButton}
      >
        Back to Groups
      </Button>

      <Snackbar
        visible={snackbarVisible}
        onDismiss={hideSnackbar}
        duration={3000}
      >
        {snackbarMessage}
      </Snackbar>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  headerContainer: {
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 14,
    color: '#757575',
    marginTop: 4,
  },
  sectionCard: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  userCard: {
    marginVertical: 4,
  },
  userCardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  userUsername: {
    fontSize: 14,
    color: '#757575',
  },
  emptyText: {
    fontStyle: 'italic',
    textAlign: 'center',
    marginVertical: 16,
    color: '#757575',
  },
  divider: {
    marginVertical: 16,
  },
  separator: {
    height: 8,
  },
  addUserSection: {
    marginTop: 8,
  },
  input: {
    marginBottom: 16,
  },
  addButton: {
    marginBottom: 8,
  },
  backButton: {
    marginTop: 8,
    marginBottom: 24,
  },
  retryButton: {
    marginVertical: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  errorText: {
    color: 'red',
    marginBottom: 16,
    textAlign: 'center',
  },
  rolesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  roleChip: {
    margin: 4,
  },
});

export default UpdateGroupScreen; 