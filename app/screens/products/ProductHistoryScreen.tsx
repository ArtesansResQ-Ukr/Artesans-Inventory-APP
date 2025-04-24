import React, { useState, useEffect } from 'react';
import { View, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { Searchbar, Card, Text, Button, ActivityIndicator, Divider, TextInput, Chip } from 'react-native-paper';
import { getProductUserHistory } from '../../services/api/productApi';
import { getAllGroups } from '../../services/api/groupApi';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { format } from 'date-fns';
import { getUsers } from '../../services/api/userApi';

type ProductHistoryProps = {
  navigation: NativeStackNavigationProp<any>;
};

const ProductHistoryScreen = ({ navigation }: ProductHistoryProps) => {
  const [history, setHistory] = useState<any[]>([]);
  const [filteredHistory, setFilteredHistory] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userUuid, setUserUuid] = useState<string>('');
  const [searching, setSearching] = useState(false);
  const [userSearchActive, setUserSearchActive] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  // Fetch all history on component mount
  useEffect(() => {
    fetchHistory();
  }, []);

  // Fetch history with optional user filter
  const fetchHistory = async (subjectUuid?: string) => {
    try {
      setLoading(true);
      setError(null);
      const result = await getProductUserHistory(subjectUuid);
      setHistory(result);
      setFilteredHistory(result);
      setUserSearchActive(!!subjectUuid);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch product history');
      console.error('Error fetching product history:', err);
    } finally {
      setLoading(false);
      setSearching(false);
    }
  };

  // Handle search query changes
  const onChangeSearch = (query: string) => {
    setSearchQuery(query);
    setUserSearchActive
    if (query.trim() === '') {
      setFilteredHistory(history);
    } else {
      // Filter history by action text
      const filtered = history.filter(item => 
        item.action.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredHistory(filtered);
    }
  };

  // Search for a specific user's history
  const handleUserSearch = () => {
    if (userUuid.trim()) {
      setSearching(true);
      fetchHistory(userUuid.trim());
    }
  };

  // Clear user search filter
  const clearUserSearch = () => {
    setUserUuid('');
    setUserSearchActive(false);
    fetchHistory();
  };

  // Format timestamp for display
  const formatTimestamp = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      return format(date, 'MMM d, yyyy h:mm a');
    } catch (e) {
      return timestamp;
    }
  };

  // In a real app, you'd have an API to search users by name

  const searchUsers = async (query: string) => {
    setSearching(true);
    setSearchQuery(query);
    try {

      const response = await getUsers(query);
      
      return response.data.users;
    
      setUsers(response.filter((user: any) => 
        user.name.toLowerCase().includes(query.toLowerCase())
        ));
    setShowUserDropdown(true);
        } catch (error) {
        console.error('Error searching users:', error);
        }
        };

  // Render history item
  const renderHistoryItem = ({ item }: { item: any }) => (
    <Card style={styles.card}>
      <Card.Content>
        <Text variant="titleMedium">{formatTimestamp(item.timestamp)}</Text>
        <Divider style={styles.divider} />
        <Text variant="bodyMedium">{item.action}</Text>
        <View style={styles.itemDetails}>
          <Text variant="bodySmall">User: {item.user_uuid}</Text>
          {item.product_uuid && (
            <Text variant="bodySmall">Product: {item.product_uuid}</Text>
          )}
          {item.group_uuid && (
            <Text variant="bodySmall">Group: {item.group_uuid}</Text>
          )}
        </View>
      </Card.Content>
    </Card>
  );

  return (
    <View style={styles.container}>
      <Card style={styles.searchCard}>
        <Card.Content>
          <Text variant="titleMedium">Search By User</Text>
          <View style={styles.userSearchContainer}>
            <TextInput
              label="User UUID"
              value={userUuid}
              onChangeText={setUserUuid}
              style={styles.userInput}
              mode="outlined"
            />
            <TextInput
              label="Search User by Name"
              value={userSearchQuery}
              onChangeText={(text) => {
                setUserSearchQuery(text);
                if (text.length > 2) {
                  searchUsers(text);
                } else {
                  setShowUserDropdown(false);
                }
              }}
              style={styles.userInput}
              mode="outlined"
            />
            <Button 
              mode="contained" 
              onPress={handleUserSearch}
              loading={searching}
              disabled={searching || !userUuid.trim()}
              style={styles.searchButton}
            >
              Search
            </Button>
          </View>
          {userSearchActive && (
            <Chip 
              icon="account" 
              onClose={clearUserSearch}
              style={styles.chip}
            >
              Filtered by User: {userUuid.substring(0, 8)}...
            </Chip>
          )}
          {showUserDropdown && (
            <Card style={styles.dropdownCard}>
              <FlatList
                data={users}
                keyExtractor={(item) => item.uuid}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.dropdownItem}
                    onPress={() => {
                      setUserUuid(item.uuid);
                      setUserSearchQuery(item.name);
                      setShowUserDropdown(false);
                    }}
                  >
                    <Text>{item.name}</Text>
                    <Text style={styles.uuidText}>{item.uuid.substring(0, 8)}...</Text>
                  </TouchableOpacity>
                )}
              />
            </Card>
          )}
        </Card.Content>
      </Card>
      
      <Divider style={styles.divider} />
      
      <Searchbar
        placeholder="Search in actions"
        onChangeText={onChangeSearch}
        value={searchQuery}
        style={styles.searchBar}
      />
      
      {loading ? (
        <ActivityIndicator size="large" style={styles.loader} />
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text variant="bodyLarge" style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={() => fetchHistory(userSearchActive ? userUuid : undefined)}>
            <Text style={styles.retryButton}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : filteredHistory.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text variant="bodyLarge">No history found</Text>
          {userSearchActive && (
            <Button mode="outlined" onPress={clearUserSearch} style={styles.clearButton}>
              Clear User Filter
            </Button>
          )}
        </View>
      ) : (
        <FlatList
          data={filteredHistory}
          renderItem={renderHistoryItem}
          keyExtractor={(item, index) => `${item.user_uuid}-${item.timestamp}-${index}`}
          contentContainerStyle={styles.list}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  searchCard: {
    marginBottom: 16,
  },
  userSearchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  userInput: {
    flex: 1,
    marginRight: 8,
  },
  searchButton: {
    marginLeft: 8,
  },
  chip: {
    marginTop: 8,
  },
  searchBar: {
    marginBottom: 16,
  },
  card: {
    marginBottom: 12,
    elevation: 2,
  },
  divider: {
    marginVertical: 8,
  },
  list: {
    paddingBottom: 16,
  },
  itemDetails: {
    marginTop: 8,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    color: 'blue',
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  clearButton: {
    marginTop: 16,
  },
  dropdownCard: {
    marginTop: 8,
    elevation: 2,
  },
  dropdownItem: {
    padding: 8,
  },
  uuidText: {
    color: 'gray',
    fontSize: 12,
  },
});

export default ProductHistoryScreen;
