// app/screens/products/ProductListScreen.tsx
import React, { useState, useEffect } from 'react';
import { View, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { Searchbar, Card, Text, Chip, ActivityIndicator, Divider, useTheme, Button, Snackbar } from 'react-native-paper';
import { getProducts, exportProductsToExcel } from '../../services/api/productApi';
import { getAllGroups } from '../../services/api/groupApi';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { InventoryStackParamList } from '../../navigation/types/navigation';
import { colors, textColors } from '../../theme';
import { fuzzySearch } from '../../services/api/searchApi';
type ProductListScreenNavigationProp = StackNavigationProp<InventoryStackParamList>;

const ProductListScreen = () => {
  const navigation = useNavigation<ProductListScreenNavigationProp>();
  const paperTheme = useTheme();
  const [products, setProducts] = useState<any[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [groups, setGroups] = useState<{[key: string]: string}>({});
  const [groupsMap, setGroupsMap] = useState<{[key: string]: string}>({});
  const [exporting, setExporting] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [expiredProducts, setExpiredProducts] = useState<{[key: string]: boolean}>({});
  const [expirationFilter, setExpirationFilter] = useState<'expired' | 'not-expired' | null>(null);

  // Fetch products on component mount
  useEffect(() => {
    fetchProducts();
    fetchGroups();
  }, []);

  // Check for expired products
  useEffect(() => {
    if (products.length > 0) {
      checkExpiredProducts(products);
    }
  }, [products]);

  // Apply all filters whenever filter conditions change
  useEffect(() => {
    applyFilters();
  }, [searchQuery, selectedGroup, expirationFilter, expiredProducts]);

  // Check which products are expired using local date comparison
  const checkExpiredProducts = (productList: any[]) => {
    const today = new Date();
    const expiredMap: {[key: string]: boolean} = {};
    
    productList.forEach(product => {
      if (product.expiration_date) {
        const expirationDate = new Date(product.expiration_date);
        expiredMap[product.uuid] = expirationDate <= today;
      } else {
        expiredMap[product.uuid] = false;
      }
    });
    
    setExpiredProducts(expiredMap);
  };

  // Apply all current filters (search, group, expiration)
  const applyFilters = () => {
    let filtered = products;
    
    // Apply search filter
    if (searchQuery.trim()) {
      filtered = fuzzySearch({
        list: filtered,
        keys: ['name', 'ocr_text', 'category'],
        query: searchQuery,
      });
    }
    
    // Apply group filter
    if (selectedGroup) {
      filtered = filtered.filter(p => p.group_uuid === selectedGroup);
    }
    
    // Apply expiration filter
    if (expirationFilter === 'expired') {
      filtered = filtered.filter(p => expiredProducts[p.uuid]);
    } else if (expirationFilter === 'not-expired') {
      filtered = filtered.filter(p => !expiredProducts[p.uuid]);
    }
    
    setFilteredProducts(filtered);
  };

  // Fetch products from API
  const fetchProducts = async (productUuid?: string) => {
    try {
      setLoading(true);
      setError(null);
      const result = await getProducts(productUuid);
      console.log('Product data sample:', result[0]);
      setProducts(result);
      setFilteredProducts(result);
      
      // Extract unique groups for filtering
      const groupMap: {[key: string]: string} = {};
      result.forEach((product: any) => {
        if (product.group_uuid && product.group_name) {
          groupMap[product.group_uuid] = product.group_name;
        }
      });
      setGroups(groupMap);
      
    } catch (err: any) {
      setError(err.message || 'Failed to fetch products');
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch groups data
  const fetchGroups = async () => {
    try {
      // Assuming you have a getGroups API method
      const groups = await getAllGroups();
      const groupsMapping = groups.data?.reduce((acc: {[key: string]: string}, group: any) => {
        acc[group.uuid] = group.name;
        return acc;
      }, {});
      setGroupsMap(groupsMapping || {});
    } catch (error) {
      console.error('Failed to fetch groups:', error);
    }
  };

  // Handle search query changes
  const onChangeSearch = (query: string) => {
    setSearchQuery(query);
  };

  // Handle group filter selection
  const handleGroupFilter = (groupUuid: string) => {
    if (selectedGroup === groupUuid) {
      // Deselect group if already selected
      setSelectedGroup(null);
    } else {
      // Select new group
      setSelectedGroup(groupUuid);
    }
  };

  // Handle expiration filter selection
  const handleExpirationFilter = (filter: 'expired' | 'not-expired') => {
    if (expirationFilter === filter) {
      // Deselect filter if already selected
      setExpirationFilter(null);
    } else {
      // Select new filter
      setExpirationFilter(filter);
    }
  };

  // Handle export to Excel
  const handleExport = async () => {
    try {
      setExporting(true);
      await exportProductsToExcel();
      setSnackbarMessage('Excel file downloaded successfully!');
      setSnackbarVisible(true);
    } catch (err) {
      console.error('Error downloading Excel file:', err);
      setSnackbarMessage('Failed to download Excel file');
      setSnackbarVisible(true);
    } finally {
      setExporting(false);
    }
  };

  // Render product item
  const renderProductItem = ({ item }: { item: any }) => {
    const isExpired = expiredProducts[item.uuid] || false;
    
    return (
      <Card 
        style={[
          styles.card, 
          isExpired && styles.expiredCard
        ]} 
        onPress={() => navigation.navigate('ProductDetail', { productUuid: item.uuid , userUuid: item.user_uuid })}
      >
        <Card.Content>
          <Text 
            variant="titleLarge" 
            style={[styles.productTitle, isExpired && styles.expiredText]}
          >
            {item.name}
          </Text>
          <View style={styles.productDetails}>
            <Text variant="bodyMedium">Category: {item.category}</Text>
            <Text variant="bodyMedium">Total Quantity: {item.quantity}</Text>
            <Text 
              variant="bodyMedium" 
              style={isExpired ? styles.expiredText : {}}
            >
              Expires: {item.expiration_date}
            </Text>
          </View>
          {item.comments && <Text variant="bodySmall" style={styles.notes}>Notes: {item.comments}</Text>}
        </Card.Content>
      </Card>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.topControls}>
        <Searchbar
          placeholder="Search products"
          onChangeText={onChangeSearch}
          value={searchQuery}
          style={styles.searchBar}
          iconColor={colors.primary}
          inputStyle={{color: textColors.primary}}
        />
        <Button 
          mode="contained" 
          onPress={handleExport}
          loading={exporting}
          disabled={exporting}
          icon="file-excel"
          style={styles.exportButton}
          compact={true}
          labelStyle={styles.exportButtonLabel}
        >
          Export
        </Button>
      </View>
      
      {/* Group filter chips */}
      {Object.keys(groups).length > 0 && (
        <View style={styles.chipContainer}>
          <Text variant="bodySmall" style={styles.filterLabel}>Filter by group:</Text>
          <FlatList
            data={Object.keys(groups)}
            renderItem={({ item }) => (
              <Chip 
                style={[
                  styles.chip,
                  selectedGroup === item ? styles.selectedChip : {}
                ]}
                selectedColor={colors.primary}
                selected={selectedGroup === item}
                onPress={() => handleGroupFilter(item)}
                mode="outlined"
              >
                {groups[item]}
              </Chip>
            )}
            keyExtractor={item => item}
            horizontal
            showsHorizontalScrollIndicator={false}
          />
        </View>
      )}
      
      {/* Expiration filter chips */}
      <View style={styles.chipContainer}>
        <Text variant="bodySmall" style={styles.filterLabel}>Filter by expiration:</Text>
        <View style={styles.chipRow}>
          <Chip 
            style={[
              styles.chip,
              expirationFilter === 'expired' ? styles.expiredChip : {}
            ]}
            selectedColor={colors.primary}
            selected={expirationFilter === 'expired'}
            onPress={() => handleExpirationFilter('expired')}
            mode="outlined"
          >
            Expired
          </Chip>
          <Chip 
            style={[
              styles.chip,
              expirationFilter === 'not-expired' ? styles.notExpiredChip : {}
            ]}
            selectedColor={colors.primary}
            selected={expirationFilter === 'not-expired'}
            onPress={() => handleExpirationFilter('not-expired')}
            mode="outlined"
          >
            Not Expired
          </Chip>
        </View>
      </View>
      
      <Divider style={styles.divider} />
      
      {loading ? (
        <ActivityIndicator size="large" style={styles.loader} color={colors.primary} />
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text variant="bodyLarge" style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={() => fetchProducts()}>
            <Text style={styles.retryButton}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : filteredProducts.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text variant="bodyLarge" style={{color: textColors.secondary}}>No products found</Text>
        </View>
      ) : (
        <FlatList
          data={filteredProducts}
          renderItem={renderProductItem}
          keyExtractor={item => item.uuid}
          contentContainerStyle={styles.list}
        />
      )}
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
    </View>
  );
};

const styles = StyleSheet.create({
  title: {
    marginBottom: 20,
    fontWeight: 'bold',
    fontSize: 24,
    textAlign: 'center',
    color: textColors.primary,
  },
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: colors.background
  },
  topControls: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    justifyContent: 'space-between',
  },
  searchBar: {
    flex: 1,
    marginRight: 8,
    elevation: 2,
    backgroundColor: colors.white,
  },
  chipContainer: {
    marginVertical: 8,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  filterLabel: {
    marginBottom: 4,
    color: textColors.secondary,
  },
  chip: {
    marginRight: 8,
    marginVertical: 4,
    borderColor: colors.primary,
  },
  selectedChip: {
    backgroundColor: colors.primary,
  },
  expiredChip: {
    backgroundColor: colors.error,
    borderColor: colors.error,
  },
  notExpiredChip: {
    backgroundColor: colors.success || '#4CAF50',
    borderColor: colors.success || '#4CAF50',
  },
  divider: {
    marginVertical: 8,
    backgroundColor: colors.gray,
    opacity: 0.2,
  },
  card: {
    marginBottom: 12,
    elevation: 2,
    backgroundColor: colors.white,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  expiredCard: {
    borderLeftColor: colors.error,
    borderLeftWidth: 4,
  },
  expiredText: {
    color: colors.error,
  },
  list: {
    paddingBottom: 16,
  },
  productDetails: {
    flexDirection: 'column',
    justifyContent: 'space-between',
    marginVertical: 8,
  },
  productTitle: {
    color: colors.primary,
    fontWeight: 'bold',
  },
  notes: {
    fontStyle: 'italic',
    color: textColors.secondary,
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
  exportButton: {
    marginLeft: 8,
    paddingHorizontal: 10,
  },
  exportButtonLabel: {
    fontSize: 12,
  },
});

export default ProductListScreen;