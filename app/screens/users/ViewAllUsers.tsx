import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  ScrollView, 
  StyleSheet, 
  TouchableOpacity, 
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import { 
  Text, 
  List, 
  Button, 
  Searchbar, 
  Divider, 
  IconButton,
  FAB,
  useTheme,
  Avatar
} from 'react-native-paper';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { AppStackParamList } from '../../navigation/types/navigation';
import { getAllUsers, getActiveUsers } from '../../services/api/userApi';
import { getAllGroups } from '../../services/api/groupApi';

// Define user interface
interface User {
  uuid: string;
  username?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  arq_id?: string;
  active?: boolean;
  group_uuid?: string;
}

interface Group {
  uuid: string;
  name: string;
}

interface GroupedUsers {
  [key: string]: User[];
}

const ViewAllUsers = () => {
  const theme = useTheme();
  const navigation = useNavigation<StackNavigationProp<AppStackParamList>>();
  const [users, setUsers] = useState<User[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedGroups, setExpandedGroups] = useState<{ [key: string]: boolean }>({});
  const [refreshing, setRefreshing] = useState(false);

  // Fetch users and groups data
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch users and groups in parallel
      const [usersData, groupsData] = await Promise.all([
        getAllUsers(),
        getAllGroups()
      ]);
      
      setUsers(usersData);
      setGroups(groupsData);
      
      // Set all groups as expanded by default
      const initialExpandedState: Record<string, boolean> = {};
      groupsData.forEach((group: Group) => {
        initialExpandedState[group.uuid] = true;
      });
      // Also expand the "inactive users" section
      initialExpandedState['inactive'] = true;
      
      setExpandedGroups(initialExpandedState);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to load users. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Refresh data when the component comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchData();
      return () => {}; // Cleanup function
    }, [])
  );

  // Handle refresh
  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  // Filter users based on search query
  const filteredUsers = users.filter(user => {
    const searchLower = searchQuery.toLowerCase();
    return (
      (user.first_name?.toLowerCase().includes(searchLower) || 
      user.last_name?.toLowerCase().includes(searchLower) || 
      user.username?.toLowerCase().includes(searchLower) ||
      user.email?.toLowerCase().includes(searchLower))
    );
  });

  // Group users by their group_uuid
  const groupedUsers: GroupedUsers = {};
  const inactiveUsers: User[] = [];

  filteredUsers.forEach(user => {
    // Separate inactive users
    if (user.active === false) {
      inactiveUsers.push(user);
      return;
    }
    
    const groupId = user.group_uuid || 'unknown';
    if (!groupedUsers[groupId]) {
      groupedUsers[groupId] = [];
    }
    groupedUsers[groupId].push(user);
  });

  // Sort users within each group by first_name
  Object.keys(groupedUsers).forEach(groupId => {
    groupedUsers[groupId].sort((a, b) => {
      const nameA = a.first_name?.toLowerCase() || '';
      const nameB = b.first_name?.toLowerCase() || '';
      return nameA.localeCompare(nameB);
    });
  });

  // Also sort inactive users
  inactiveUsers.sort((a, b) => {
    const nameA = a.first_name?.toLowerCase() || '';
    const nameB = b.first_name?.toLowerCase() || '';
    return nameA.localeCompare(nameB);
  });

  // Toggle group expansion
  const toggleGroupExpansion = (groupId: string) => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupId]: !prev[groupId]
    }));
  };

  // Navigate to user profile
  const navigateToProfile = (userId: string) => {
    navigation.navigate('ProfileScreen', { userId });
  };

  // Navigate to create user screen
  const navigateToCreateUser = () => {
    navigation.navigate('CreateUser');
  };

  // Get group name by uuid
  const getGroupName = (groupId: string): string => {
    const group = groups.find(g => g.uuid === groupId);
    return group ? group.name : 'Unknown Group';
  };

  // Render user item
  const renderUserItem = (user: User) => (
    <TouchableOpacity key={user.uuid} onPress={() => navigateToProfile(user.uuid)}>
      <List.Item
        title={`${user.first_name || ''} ${user.last_name || ''}`}
        description={user.username || 'No username'}
        left={props => (
          <Avatar.Text 
            size={40} 
            label={(user.first_name?.[0] || '') + (user.last_name?.[0] || '')} 
            {...props} 
          />
        )}
        right={props => <List.Icon {...props} icon="chevron-right" />}
      />
      <Divider />
    </TouchableOpacity>
  );

  // If loading, show loading indicator
  if (loading && !refreshing) {
    return (
      <View style={styles.centeredContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={{ marginTop: 16 }}>Loading users...</Text>
      </View>
    );
  }

  // If error, show error message
  if (error) {
    return (
      <View style={styles.centeredContainer}>
        <Text style={{ color: theme.colors.error }}>{error}</Text>
        <Button mode="contained" onPress={fetchData} style={{ marginTop: 16 }}>
          Retry
        </Button>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Searchbar
        placeholder="Search users..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchBar}
      />
      
      <ScrollView 
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {Object.keys(groupedUsers).map(groupId => (
          <List.Accordion
            key={groupId}
            title={getGroupName(groupId)}
            description={`${groupedUsers[groupId].length} users`}
            expanded={expandedGroups[groupId]}
            onPress={() => toggleGroupExpansion(groupId)}
            left={props => <List.Icon {...props} icon="account-group" />}
          >
            {groupedUsers[groupId].map(renderUserItem)}
          </List.Accordion>
        ))}
        
        {inactiveUsers.length > 0 && (
          <List.Accordion
            title="Inactive Users"
            description={`${inactiveUsers.length} users`}
            expanded={expandedGroups['inactive']}
            onPress={() => toggleGroupExpansion('inactive')}
            left={props => <List.Icon {...props} icon="account-off" />}
          >
            {inactiveUsers.map(renderUserItem)}
          </List.Accordion>
        )}
        
        {Object.keys(groupedUsers).length === 0 && inactiveUsers.length === 0 && (
          <View style={styles.emptyContainer}>
            <Text>No users found</Text>
          </View>
        )}
      </ScrollView>
      
      <FAB
        style={styles.fab}
        icon="plus"
        onPress={navigateToCreateUser}
        label="Add User"
      />
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
  searchBar: {
    margin: 16,
    elevation: 4,
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});

export default ViewAllUsers; 