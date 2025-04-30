import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Text, Card, Button, Searchbar, IconButton, Divider, FAB } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { UserManagementStackParamList } from '../../navigation/types/navigation';
import { getAllGroups, searchGroup } from '../../services/api/groupApi';
import { colors, textColors } from '../../theme';

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
            iconColor={colors.primary}
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
          iconColor={colors.primary}
          inputStyle={{ color: textColors.primary }}
        />
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading groups...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <Button 
            mode="contained" 
            onPress={fetchGroups} 
            style={styles.retryButton}
            buttonColor={colors.primary}
          >
            Retry
          </Button>
        </View>
      ) : filteredGroups.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No groups found</Text>
          <Button 
            mode="contained" 
            onPress={() => {
              console.log('Create New Group button pressed - navigating to CreateGroup');
              navigation.navigate('CreateGroup');
            }}
            style={styles.createButton}
            buttonColor={colors.primary}
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
          ItemSeparatorComponent={() => <Divider style={styles.divider} />}
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
        color={colors.white}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: 16,
    backgroundColor: colors.white,
    elevation: 2,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    color: colors.primary,
  },
  searchBar: {
    marginBottom: 8,
    backgroundColor: colors.white,
    elevation: 1,
  },
  card: {
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 8,
    backgroundColor: colors.white,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  cardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  groupName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary,
  },
  groupId: {
    fontSize: 14,
    color: textColors.secondary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    color: textColors.primary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  errorText: {
    color: colors.error,
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
  emptyText: {
    color: textColors.secondary,
    marginBottom: 16,
  },
  createButton: {
    marginTop: 16,
  },
  listContent: {
    paddingVertical: 8,
  },
  divider: {
    backgroundColor: colors.gray + '40',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: colors.primary,
  },
});

export default ViewAllGroupsScreen; 