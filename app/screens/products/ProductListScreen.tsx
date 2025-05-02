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

  // Fetch products on component mount
  useEffect(() => {
    fetchProducts();
    fetchGroups();
  }, []);

  // Fetch products from API
  const fetchProducts = async ( productUuid?: string) => {
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
    
    if (query.trim() === '') {
      // If search is cleared, show all products or just the selected group
      if (selectedGroup) {
        setFilteredProducts(products.filter(p => p.group_uuid === selectedGroup));
      } else {
        setFilteredProducts(products);
      }
    } else {
      // Filter products by name, category, or OCR text
      const filtered = products.filter(product => {
        const matchesSearch = 
          product.name.toLowerCase().includes(query.toLowerCase()) ||
          product.category.toLowerCase().includes(query.toLowerCase()) ||
          (product.ocr_text && product.ocr_text.toLowerCase().includes(query.toLowerCase()));
        
        // Apply group filter if selected
        return matchesSearch && (!selectedGroup || product.group_uuid === selectedGroup);
      });
      
      setFilteredProducts(filtered);
    }
  };

  // Handle group filter selection
  const handleGroupFilter = (groupUuid: string) => {
    if (selectedGroup === groupUuid) {
      // Deselect group if already selected
      setSelectedGroup(null);
      setFilteredProducts(
        searchQuery.trim() ? 
          products.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase())) : 
          products
      );
    } else {
      // Select new group
      setSelectedGroup(groupUuid);
      setFilteredProducts(
        products.filter(p => {
          const matchesGroup = p.group_uuid === groupUuid;
          const matchesSearch = !searchQuery.trim() || 
            p.name.toLowerCase().includes(searchQuery.toLowerCase());
          return matchesGroup && matchesSearch;
        })
      );
    }
  };

  // Handle export to Excel
  const handleExport = async () => {
    try {
      setExporting(true);
      await exportProductsToExcel();
      setSnackbarMessage('Products exported successfully!');
      setSnackbarVisible(true);
    } catch (err) {
      console.error('Error exporting products:', err);
      setSnackbarMessage('Failed to export products');
      setSnackbarVisible(true);
    } finally {
      setExporting(false);
    }
  };

  // Render product item
  const renderProductItem = ({ item }: { item: any }) => (
    <Card style={styles.card} onPress={() => navigation.navigate('ProductDetail', { productUuid: item.uuid , userUuid: item.user_uuid })}>
      <Card.Content>
        <Text variant="titleLarge" style={styles.productTitle}>{item.name}</Text>
        <View style={styles.productDetails}>
          <Text variant="bodyMedium">Category: {item.category}</Text>
          <Text variant="bodyMedium">Total Quantity: {item.quantity}</Text>
          <Text variant="bodyMedium">Expires: {item.expiration_date}</Text>
        </View>
        {item.comments && <Text variant="bodySmall" style={styles.notes}>Notes: {item.comments}</Text>}
      </Card.Content>
    </Card>
  );

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
                selectedColor={colors.white}
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
  },
  searchBar: {
    marginRight: 8,
    elevation: 2,
    backgroundColor: colors.white,
  },
  chipContainer: {
    marginVertical: 8,
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
  },
});

export default ProductListScreen;