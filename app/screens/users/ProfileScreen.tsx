import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
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
import { AppStackParamList } from '../../navigation/types/navigation';
import { getUsers } from '../../services/api/userApi';
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
  uuid: string;
  name: string;
}

type ProfileScreenRouteProp = RouteProp<AppStackParamList, 'ProfileScreen'>;

const ProfileScreen = () => {
  const theme = useTheme();
  const navigation = useNavigation<StackNavigationProp<AppStackParamList>>();
  const route = useRoute<ProfileScreenRouteProp>();
  const { user: currentUser } = useAuth();
  const { userId } = route.params;
  
  const [user, setUser] = useState<User | null>(null);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [productHistoryExpanded, setProductHistoryExpanded] = useState(false);
  const [permissionDenied, setPermissionDenied] = useState(false);


  useEffect(() => {
    fetchData();
  }, [userId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch user and groups data in parallel
      const [userData] = await Promise.all([
        getUsers(userId),
      ]);
      
      setUser(userData);
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
        setError('Failed to load user profile. Please try again.');
      }
    } finally {
      setLoading(false);
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
      {!hasUpdatePermission && (
        <Banner
          visible={true}
          icon="information"
          actions={[{ label: 'Dismiss', onPress: () => {} }]}
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
          </Card.Content>
        </Card>
        
        <Card style={styles.card}>
          <Card.Title title="Permissions" />
          <Card.Content>
            {user.permissions && user.permissions.length > 0 ? (
              <View style={styles.permissionsContainer}>
                {user.permissions.map((permission, index) => (
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
          onPress={() => setProductHistoryExpanded(!productHistoryExpanded)}
          left={props => <List.Icon {...props} icon="history" />}
          style={styles.accordion}
        >
          <View style={styles.placeholderContainer}>
            <Text style={styles.placeholderText}>
              Product history feature coming soon
            </Text>
          </View>
        </List.Accordion>
        
        {hasUpdatePermission && (
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