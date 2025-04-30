import React, { useState, useEffect } from 'react';
import { View, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { Searchbar, Card, Text, Button, ActivityIndicator, Divider, TextInput, Chip, List } from 'react-native-paper';
import { getProductUserHistory, getProductByUuid } from '../../services/api/productApi';
import { getAllGroups } from '../../services/api/groupApi';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { format } from 'date-fns';
import { getUsersByUuid, searchUsers } from '../../services/api/userApi';
import { colors, textColors } from '../../theme';

type ProductHistoryProps = {
  navigation: NativeStackNavigationProp<any>;
};

interface UserHistory {
  uuid: string;
  user_uuid: string;
  user_name?: string;
  product_uuid: string;
  product_name?: string;
  action: string;
  timestamp: string;
}

const ProductHistoryScreen = ({ navigation }: ProductHistoryProps) => {
  const [history, setHistory] = useState<UserHistory[]>([]);
  const [filteredHistory, setFilteredHistory] = useState<UserHistory[]>([]);
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
      if (result.error) {
        if (result.error.status === 404) {
          setHistory([]);
        } else {
          setError(result.error.message);
        }
        return;
      }
      console.log('result', result);
      if (result && Array.isArray(result)) {
        // Sort by timestamp (newest first)
        const sortedHistory = [...result].sort((a, b) => {
          return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
        });
        
        // Fetch additional details for each history item
        const historyWithNames = await Promise.all(sortedHistory.map(async (item) => {
          const userName = await fetchUsersName(item.user_uuid);
          const productName = await fetchProductName(item.product_uuid);
    
          return { 
            ...item, 
            user_name: userName, 
            product_name: productName
          };
        }));
        
        setHistory(historyWithNames);
        setFilteredHistory(historyWithNames);
        setUserSearchActive(!!subjectUuid);
      } else {
        setHistory([]);
        setFilteredHistory([]);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch product history');
      console.error('Error fetching product history:', err);
    } finally {
      setLoading(false);
      setSearching(false);
    }
  };

  const fetchUsersName = async (userUuid: string) => {
    try {
      const response = await getUsersByUuid(userUuid);
      if (response?.data) {
        return response.data.first_name + ' ' + response.data.last_name;
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch user name');
      console.error('Error fetching user name:', err);
    }
  }

  const fetchProductName = async (productUuid: string) => {
    try {
      const response = await getProductByUuid(productUuid);
      if (response?.data) {
        console.log('product name', response.name);
        return response.data.name;
        
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch product name');
      console.error('Error fetching product name:', err);
    }
  }

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

  const searchUsersByName = async (query: string) => {
    setSearching(true);
    setSearchQuery(query);
    try {

      const response = await searchUsers({first_name: query});
      if (response?.data) {
        setUsers(response.data.filter((user: any) => 
          user.name.toLowerCase().includes(query.toLowerCase())
        ));
        setShowUserDropdown(true);
      }
      return response?.data;
    
    } catch (error) {
      console.error('Error searching users:', error);
    }
  };

  // Render history item
  const renderHistoryItem = ({ item }: { item: any }) => (
    <Card style={styles.card}>
      <Card.Content>
        <View style={styles.historyHeader}>
          <List.Icon
            icon={
              item.action.includes('added') ? 'plus-circle' : 
              item.action.includes('created') ? 'plus-circle' : 
              item.action.includes('removed') ? 'minus-circle' :
              item.action.includes('deleted') ? 'delete' : 'history'
            }
            color={
              item.action.includes('added') || item.action.includes('created') ? '#4CAF50' : 
              item.action.includes('removed') ? '#FF9800' :
              item.action.includes('deleted') ? '#F44336' : '#2196F3'
            }
          />
          <Text variant="titleMedium" style={styles.timestampText}>
            {formatTimestamp(item.timestamp)}
          </Text>
        </View>
        <Divider style={styles.divider} />
        <Text variant="bodyLarge" style={styles.actionText}>{item.action}</Text>
        <View style={styles.itemDetails}>
          <View style={styles.detailRow}>
            <Text variant="bodySmall" style={styles.detailLabel}>User:</Text>
            <Text variant="bodySmall" style={styles.detailValue}>{item.user_name || 'Unknown'}</Text>
          </View>
          {item.product_name && (
            <View style={styles.detailRow}>
              <Text variant="bodySmall" style={styles.detailLabel}>Product:</Text>
              <Text variant="bodySmall" style={styles.detailValue}>{item.product_name}</Text>
            </View>
          )}
        </View>
      </Card.Content>
    </Card>
  );

  return (
    <View style={styles.container}>
      <Card style={styles.searchCard}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>Search By User</Text>
          <View style={styles.userSearchContainer}>
            <TextInput
              label="Search User by Name"
              value={userSearchQuery}
              onChangeText={(text) => {
                setUserSearchQuery(text);
                if (text.length > 2) {
                  searchUsers({first_name: text});
                } else {
                  setShowUserDropdown(false);
                }
              }}
              style={styles.userInput}
              mode="outlined"
              outlineColor={colors.primary}
              activeOutlineColor={colors.primary}
            />
            <Button 
              mode="contained" 
              onPress={handleUserSearch}
              loading={searching}
              disabled={searching || !userUuid.trim()}
              style={styles.searchButton}
              buttonColor={colors.primary}
            >
              Search
            </Button>
          </View>
          {userSearchActive && (
            <Chip 
              icon="account" 
              onClose={clearUserSearch}
              style={styles.chip}
              selectedColor={colors.primary}
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
        iconColor={colors.primary}
        inputStyle={{color: textColors.primary}}
      />
      
      {loading ? (
        <ActivityIndicator size="large" style={styles.loader} color={colors.primary} />
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text variant="bodyLarge" style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={() => fetchHistory(userSearchActive ? userUuid : undefined)}>
            <Text style={styles.retryButton}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : filteredHistory.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text variant="bodyLarge" style={{color: textColors.secondary}}>No history found</Text>
          {userSearchActive && (
            <Button 
              mode="outlined" 
              onPress={clearUserSearch} 
              style={styles.clearButton}
              textColor={colors.primary}
            >
              Clear User Filter
            </Button>
          )}
        </View>
      ) : (
        <FlatList
          data={filteredHistory}
          renderItem={renderHistoryItem}
          keyExtractor={(item, index) => `${item.user_name}-${item.product_name}-${item.timestamp}-${index}`}
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
    backgroundColor: colors.background,
    marginTop: 10,
  },
  searchCard: {
    marginBottom: 4,
    backgroundColor: colors.white,
    elevation: 1,
    borderRadius: 4,
  },
  userSearchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 2,
  },
  userInput: {
    flex: 1,
    marginRight: 8,
    backgroundColor: colors.white,
  },
  searchButton: {
    marginLeft: 8,
  },
  chip: {
    marginTop: 8,
    backgroundColor: colors.background,
  },
  searchBar: {
    marginBottom: 10,
    backgroundColor: colors.white,
    elevation: 2,
  },
  card: {
    marginBottom: 12,
    elevation: 2,
    backgroundColor: colors.white,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  divider: {
    marginVertical: 8,
    backgroundColor: colors.gray,
    opacity: 0.2,
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
    color: colors.error,
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    color: colors.secondary,
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  clearButton: {
    marginTop: 16,
    borderColor: colors.primary,
  },
  dropdownCard: {
    marginTop: 8,
    elevation: 2,
    backgroundColor: colors.white,
  },
  dropdownItem: {
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.background,
  },
  uuidText: {
    color: textColors.secondary,
    fontSize: 12,
  },
  historyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionText: {
    marginBottom: 8,
    color: textColors.primary,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailLabel: {
    fontWeight: 'bold',
    marginRight: 8,
    color: colors.primary,
  },
  detailValue: {
    marginRight: 8,
    color: textColors.primary,
  },
  timestampText: {
    marginLeft: 8,
    color: textColors.secondary,
  },
  sectionTitle: {
    marginBottom: 8,
    color: colors.primary,
  },
});

export default ProductHistoryScreen;
