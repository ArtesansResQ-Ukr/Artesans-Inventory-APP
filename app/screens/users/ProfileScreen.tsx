import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { 
  Text, 
  Card, 
  Avatar, 
  List, 
  Button, 
  useTheme, 
  Divider, 
  Chip,
  Banner
} from 'react-native-paper';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { UserManagementStackParamList } from '../../navigation/types/navigation';
import { getUsersByUuid, getGroupUserIn, getUserPermissions } from '../../services/api/userApi';
import { getProductByUuid, getProductUserHistory } from '../../services/api/productApi';
import { useAuth } from '../../contexts/AuthContext';

interface User {
  uuid: string;
  username?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  arq_id?: string;
  active?: boolean;
  password?: string;
  language_preference?: string;
  roles?: string[];
  permissions?: string[];
  group_uuid?: string;
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

interface UserHistory {
  uuid: string;
  action: string;
  product_uuid?: string;
  user_uuid?: string;
  product_name?: string;
  timestamp: string;
}

type ProfileScreenRouteProp = RouteProp<UserManagementStackParamList, 'ProfileScreen'>;

const ProfileScreen = () => {
  const theme = useTheme();
  const navigation = useNavigation<StackNavigationProp<UserManagementStackParamList>>();
  const route = useRoute<ProfileScreenRouteProp>();
  const { user: currentUser } = useAuth();
  const { userId } = route.params;
  
  const [user, setUser] = useState<User | null>(null);
  const [userGroup, setUserGroup] = useState<Group | null>(null);
  const [userGroups, setUserGroups] = useState<UserGroups | null>(null);
  const [userPermissions, setUserPermissions] = useState<string[]>([]);
  const [userHistory, setUserHistory] = useState<UserHistory[]>([]);
  const [userHistoryLoading, setUserHistoryLoading] = useState(false);
  const [userHistoryError, setUserHistoryError] = useState<string | null>(null);
  const [permissionsLoading, setPermissionsLoading] = useState(false);
  const [permissionsError, setPermissionsError] = useState<string | null>(null);
  const [groupLoading, setGroupLoading] = useState(false);
  const [groupError, setGroupError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [productHistoryExpanded, setProductHistoryExpanded] = useState(false);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  

  useEffect(() => {
    fetchData();
  }, [userId]);

  useEffect(() => {
    if (user) {
      fetchUserPermissions(userId);
      fetchUserHistory(userId);
    }
  }, [user]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch user data
      const result = await getUsersByUuid(userId);
      if (result.error) {
        if (result.error.status === 403) {
          setPermissionDenied(true);
        }
        setError(result.error.message);
        return;
      }
      
      if (result.data) {
        setUser(result.data);
      } else {
        setError('No user data received from server');
        return;
      }
      
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
          setUserGroups(null);
          setUserGroup(null);
        } else {
          setGroupError(result.error.message);
        }
        return;
      }
      
      if (result.data) {
        // New API response format with groups array
        setUserGroups(result.data);
        
        // Set the first group as userGroup for backward compatibility if available
        const groups = result.data.groups;
        if (groups && groups.length > 0) {
          const firstGroup = groups[0];
          setUserGroup({
            user_uuid: result.data.user_uuid,
            group_uuid: firstGroup.group_uuid,
            group_name: firstGroup.group_name
          });
        } else {
          setUserGroup(null);
        }
      } else {
        // This handles the case where API returns an empty response
        setUserGroups(null);
        setUserGroup(null);
      }
    } catch (error) {
      console.error('Error fetching user group:', error);
      setGroupError('An unexpected error occurred fetching group information.');
    } finally {
      setGroupLoading(false);
    }
  };
  const fetchProductName = async (productUuid: string) => {
    try {
      const result = await getProductByUuid(productUuid);
      return result.data.name;
    } catch (error) {
      console.error('Error fetching product name:', error);
      return 'Unknown';
    }
  };

  const fetchUserHistory = async (userId: string) => {
    try {
      setUserHistoryLoading(true);
      setUserHistoryError(null);
      
      const result = await getProductUserHistory(userId);
      if (result.error) {
        if (result.error.status === 404) {
          setUserHistory([]);
        } else {
          setUserHistoryError(result.error.message);
        }
        return;
      }
      
      // Store the history data and sort it chronologically (newest first)
      if (result) {
        const sortedHistory = [...result].sort((a, b) => {
          return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
        });
        const historyWithProductName = await Promise.all(sortedHistory.map(async (item) => ({
          ...item,
          product_name: await fetchProductName(item.product_uuid)
        })));
        
        setUserHistory(historyWithProductName);
        
        if (sortedHistory.length > 0) {
          setProductHistoryExpanded(true);
        }
      } else {
        setUserHistory([]);
      }
    } catch (error) {
      console.error('Error fetching user history:', error);
      setUserHistoryError('An unexpected error occurred fetching user history.');
    } finally {
      setUserHistoryLoading(false);
    }
  };

  const fetchUserPermissions = async (userId: string) => {
    try {
      setPermissionsLoading(true);
      setPermissionsError(null);
      
      const result = await getUserPermissions(userId);
      if (result.error) {
        // 404 error means user is not in any group - this is a valid state
        if (result.error.status === 404) {
          setUserPermissions([]);
        } else {
          setPermissionsError(result.error.message);
        }
        return;
      }
      
      if (result.data) {
        setUserPermissions(result.data.permissions);
      } else {
        // This handles the case where API returns an empty response
        setUserPermissions([]);
      }
    } catch (error) {
      console.error('Error fetching user permissions:', error);
      setPermissionsError('An unexpected error occurred fetching permissions information.');
    } finally {
      setPermissionsLoading(false);
    }
  };
  

  // Navigate to update user screen
  const navigateToUpdateUser = () => {
    navigation.navigate('UpdateUser', { userId });
  };

  // If loading, show loading indicator
  if (loading) {
    return (
      <View style={styles.centeredContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={{ marginTop: 16 }}>Loading profile...</Text>
      </View>
    );
  }

  // If permission denied, show message
  if (permissionDenied) {
    return (
      <View style={styles.centeredContainer}>
        <Text style={{ color: theme.colors.error, textAlign: 'center' }}>
          You do not have permission to view this user's profile.
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
          onPress={fetchData} 
          style={{ marginTop: 16 }}
        >
          Retry
        </Button>
      </View>
    );
  }

  // If no user data, show message
  if (!user) {
    return (
      <View style={styles.centeredContainer}>
        <Text>User not found</Text>
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

  return (
    <View style={styles.container}>
      {isVisible && (
        <Banner
          visible={true}
          icon="information"
          actions={[{ label: 'Dismiss', onPress: () => setIsVisible(false) }]}
        >
          You only have permission to view this profile. Update functionality is limited to your own profile or users you manage.
        </Banner>
      )}
      
      <ScrollView style={styles.scrollView}>
        <View style={styles.headerContainer}>
          <Avatar.Text 
            size={80} 
            label={(user.first_name?.[0] || '') + (user.last_name?.[0] || '')} 
            style={styles.avatar}
          />
          <View style={styles.headerTextContainer}>
            <Text style={styles.nameText}>
              {`${user.first_name || ''} ${user.last_name || ''}`}
            </Text>
            <Text style={styles.usernameText}>@{user.username || ''}</Text>
            <Chip 
              icon={user.active ? "check-circle" : "close-circle"} 
              style={[
                styles.statusChip, 
                { backgroundColor: user.active ? '#e8f5e9' : '#ffebee' }
              ]}
            >
              {user.active ? 'Active' : 'Inactive'}
            </Chip>
          </View>
        </View>
        
        <Divider style={styles.divider} />
        
        <Card style={styles.card}>
          <Card.Title title="Basic Information" />
          <Card.Content>
            <List.Item
              title="Email"
              description={user.email || 'No email'}
              left={props => <List.Icon {...props} icon="email" />}
            />
            <Divider />
            <List.Item
              title="ARQ ID"
              description={user.arq_id || 'No ARQ ID'}
              left={props => <List.Icon {...props} icon="card-account-details" />}
            />
            <Divider />
            <List.Item
              title="Language Preference"
              description={user.language_preference || 'Not set'}
              left={props => <List.Icon {...props} icon="translate" />}
            />
            <Divider />
            <List.Item
              title="Group"
              description={
                groupLoading 
                  ? 'Loading group information...' 
                  : groupError 
                    ? 'Error loading group information' 
                    : userGroups && userGroups.groups && userGroups.groups.length > 0
                      ? userGroups.groups.map(g => g.group_name).join(', ')
                      : 'Not assigned to any group'
              }
              left={props => <List.Icon {...props} icon="account-group" />}
            />
          </Card.Content>
        </Card>
        
        <Card style={styles.card}>
          <Card.Title title="Permissions" />
          <Card.Content>
            {userPermissions && userPermissions.length > 0 ? (
              <View style={styles.permissionsContainer}>
                {userPermissions.map((permission, index) => (
                  <Chip key={index} style={styles.permissionChip}>
                    {permission}
                  </Chip>
                ))}
              </View>
            ) : (
              <Text style={styles.noDataText}>No permissions assigned</Text>
            )}
          </Card.Content>
        </Card>
        
        <List.Accordion
          title="Product History"
          description="Items checked out by this user"
          expanded={productHistoryExpanded}
          onPress={() => {
            setProductHistoryExpanded(!productHistoryExpanded);
            if (!productHistoryExpanded && userHistory.length === 0) {
              fetchUserHistory(userId);
            }
          }}
          left={props => <List.Icon {...props} icon="history" />}
          style={styles.accordion}
        >
          {userHistoryLoading ? (
            <View style={styles.placeholderContainer}>
              <ActivityIndicator size="small" />
              <Text style={styles.placeholderText}>Loading history...</Text>
            </View>
          ) : userHistoryError ? (
            <View style={styles.placeholderContainer}>
              <Text style={[styles.placeholderText, { color: theme.colors.error }]}>
                {userHistoryError}
              </Text>
            </View>
          ) : userHistory.length === 0 ? (
            <View style={styles.placeholderContainer}>
              <Text style={styles.placeholderText}>
                No history available for this user
              </Text>
            </View>
          ) : (
            <View>
              {userHistory.map((item, index) => (
                <List.Item
                  key={item.uuid || index}
                  title={item.action}
                  description={`${item.product_name} • ${new Date(item.timestamp).toLocaleString()}`}
                  left={props => <List.Icon {...props} icon={
                    item.action.includes('created') ? 'plus-circle' : 
                    item.action.includes('added') ? 'plus-circle' : 
                    item.action.includes('removed') ? 'minus-circle' :
                    item.action.includes('deleted') ? 'delete' : 'history'
                  } />}
                  style={index < userHistory.length - 1 ? { borderBottomWidth: 0.5, borderBottomColor: '#e0e0e0' } : {}}
                />
              ))}
            </View>
          )}
        </List.Accordion>
        
        {(
          <Button 
            mode="contained" 
            onPress={navigateToUpdateUser}
            style={styles.updateButton}
            icon="account-edit"
          >
            Update User
          </Button>
        )}
      </ScrollView>
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
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  headerContainer: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
    backgroundColor: 'white',
  },
  avatar: {
    marginRight: 16,
  },
  headerTextContainer: {
    flex: 1,
  },
  nameText: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  usernameText: {
    fontSize: 16,
    opacity: 0.7,
    marginBottom: 4,
  },
  statusChip: {
    alignSelf: 'flex-start',
  },
  divider: {
    height: 1,
  },
  card: {
    margin: 16,
    marginBottom: 8,
  },
  noDataText: {
    fontStyle: 'italic',
    opacity: 0.7,
    textAlign: 'center',
    padding: 16,
  },
  permissionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  permissionChip: {
    margin: 4,
  },
  accordion: {
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginVertical: 8,
  },
  placeholderContainer: {
    padding: 16,
    backgroundColor: '#f9f9f9',
  },
  placeholderText: {
    textAlign: 'center',
    fontStyle: 'italic',
    opacity: 0.7,
  },
  updateButton: {
    margin: 16,
  },
});

export default ProfileScreen; 