import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Text, Card, Button, Searchbar, IconButton, Divider, FAB } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { UserManagementStackParamList } from '../../navigation/types/navigation';
import { getAllGroups, searchGroup } from '../../services/api/groupApi';

type ViewAllGroupsNavigationProp = StackNavigationProp<UserManagementStackParamList, 'ViewAllGroups'>;

interface Group {
  uuid: string;
  name: string;
}

const ViewAllGroupsScreen = () => {
  const navigation = useNavigation<ViewAllGroupsNavigationProp>();
  const [groups, setGroups] = useState<Group[]>([]);
  const [filteredGroups, setFilteredGroups] = useState<Group[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getAllGroups();
      if (response.data) {
        setGroups(response.data);
        setFilteredGroups(response.data);
      } else if (response.error) {
        setError(response.error.message);
      }
    } catch (error) {
      setError('Failed to fetch groups');
      console.error('Error fetching groups:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.trim() === '') {
      setFilteredGroups(groups);
      return;
    }

    try {
      const response = await searchGroup(query);
      if (response.data && response.data.uuid) {
        // If we get a specific UUID, filter by it
        const foundGroup = groups.find(group => group.uuid === response.data?.uuid);
        setFilteredGroups(foundGroup ? [foundGroup] : []);
      } else {
        // Otherwise, do client-side filtering
        const filtered = groups.filter(group => 
          group.name.toLowerCase().includes(query.toLowerCase())
        );
        setFilteredGroups(filtered);
      }
    } catch (error) {
      console.error('Error searching for group:', error);
      // Default to client-side filtering on error
      const filtered = groups.filter(group => 
        group.name.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredGroups(filtered);
    }
  };

  const renderGroupItem = ({ item }: { item: Group }) => (
    <Card 
      style={styles.card}
      onPress={() => navigation.navigate('UpdateGroup', { groupId: item.uuid, groupName: item.name })}
    >
      <Card.Content>
        <View style={styles.cardContent}>
          <View>
            <Text style={styles.groupName}>{item.name}</Text>
            <Text style={styles.groupId}>ID: {item.uuid}</Text>
          </View>
          <IconButton
            icon="chevron-right"
            size={24}
            onPress={() => navigation.navigate('UpdateGroup', { groupId: item.uuid, groupName: item.name })}
          />
        </View>
      </Card.Content>
    </Card>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>All Groups</Text>
        <Searchbar
          placeholder="Search by group name"
          onChangeText={handleSearch}
          value={searchQuery}
          style={styles.searchBar}
        />
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0000ff" />
          <Text>Loading groups...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <Button mode="contained" onPress={fetchGroups} style={styles.retryButton}>
            Retry
          </Button>
        </View>
      ) : filteredGroups.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text>No groups found</Text>
          <Button 
            mode="contained" 
            onPress={() => {
              console.log('Create New Group button pressed - navigating to CreateGroup');
              navigation.navigate('CreateGroup');
            }}
            style={styles.createButton}
          >
            Create a New Group
          </Button>
        </View>
      ) : (
        <FlatList
          data={filteredGroups}
          renderItem={renderGroupItem}
          keyExtractor={(item) => item.uuid}
          contentContainerStyle={styles.listContent}
          ItemSeparatorComponent={() => <Divider />}
        />
      )}

      <FAB
        style={styles.fab}
        icon="plus"
        onPress={() => {
          console.log('FAB button pressed - navigating to CreateGroup');
          try {
            navigation.navigate('CreateGroup');
            console.log('Navigation called successfully');
          } catch (err) {
            console.error('Navigation error:', err);
          }
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 16,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  searchBar: {
    marginBottom: 8,
  },
  card: {
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 8,
  },
  cardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  groupName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  groupId: {
    fontSize: 14,
    color: '#757575',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  retryButton: {
    marginTop: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  createButton: {
    marginTop: 16,
  },
  listContent: {
    paddingVertical: 8,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#2196F3',
  },
});

export default ViewAllGroupsScreen; 