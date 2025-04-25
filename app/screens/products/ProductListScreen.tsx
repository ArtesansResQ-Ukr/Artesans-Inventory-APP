// app/screens/products/ProductListScreen.tsx
import React, { useState, useEffect } from 'react';
import { View, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { Searchbar, Card, Text, Chip, ActivityIndicator, Divider } from 'react-native-paper';
import { getProducts } from '../../services/api/productApi';
import { getAllGroups } from '../../services/api/groupApi';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { InventoryStackParamList } from '../../navigation/types/navigation';

type ProductListScreenNavigationProp = StackNavigationProp<InventoryStackParamList>;

const ProductListScreen = () => {
  const navigation = useNavigation<ProductListScreenNavigationProp>();
  const [products, setProducts] = useState<any[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [groups, setGroups] = useState<{[key: string]: string}>({});
  const [groupsMap, setGroupsMap] = useState<{[key: string]: string}>({});

  // Fetch products on component mount
  useEffect(() => {
    fetchProducts();
    fetchGroups();
  }, []);

  // Fetch products from API
  const fetchProducts = async (groupUuid?: string, productUuid?: string) => {
    try {
      setLoading(true);
      setError(null);
      const result = await getProducts(groupUuid, productUuid);
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

  // Render product item
  const renderProductItem = ({ item }: { item: any }) => (
    <Card style={styles.card} onPress={() => navigation.navigate('ProductDetail', { productUuid: item.uuid , groupUuid: item.group_uuid })}>
      <Card.Content>
        <Text variant="titleLarge">{item.name}</Text>
        <Text variant="bodyMedium">Category: {item.category}</Text>
        <View style={styles.productDetails}>
          <Text variant="bodyMedium">Quantity: {item.quantity}</Text>
          <Text variant="bodyMedium">Expires: {item.expiration_date}</Text>
          <Text variant="bodyMedium">Group: {groupsMap[item.group_uuid] || 'Unknown'}</Text>
        </View>
        {item.comments && <Text variant="bodySmall">Notes: {item.comments}</Text>}
      </Card.Content>
    </Card>
  );

  return (
    <View style={styles.container}>
      <Text variant="titleLarge" style={styles.title}>Inventory List</Text>
      <Searchbar
        placeholder="Search products"
        onChangeText={onChangeSearch}
        value={searchQuery}
        style={styles.searchBar}
      />
      
      {/* Group filter chips */}
      {Object.keys(groups).length > 0 && (
        <View style={styles.chipContainer}>
          <Text variant="bodySmall" style={styles.filterLabel}>Filter by group:</Text>
          <FlatList
            data={Object.keys(groups)}
            renderItem={({ item }) => (
              <Chip 
                style={styles.chip}
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
        <ActivityIndicator size="large" style={styles.loader} />
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text variant="bodyLarge" style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={() => fetchProducts()}>
            <Text style={styles.retryButton}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : filteredProducts.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text variant="bodyLarge">No products found</Text>
        </View>
      ) : (
        <FlatList
          data={filteredProducts}
          renderItem={renderProductItem}
          keyExtractor={item => item.uuid}
          contentContainerStyle={styles.list}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  title: {
    marginTop: 10,
    marginBottom: 20,
    fontWeight: 'bold',
    fontSize: 24,
    textAlign: 'center',
    color: 'Gray',
  },
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
    marginTop: 50,
  },
  searchBar: {
    marginBottom: 8,
    elevation: 2,
  },
  chipContainer: {
    marginVertical: 8,
  },
  filterLabel: {
    marginBottom: 4,
  },
  chip: {
    marginRight: 8,
    marginVertical: 4,
  },
  divider: {
    marginVertical: 8,
  },
  card: {
    marginBottom: 12,
    elevation: 2,
  },
  list: {
    paddingBottom: 16,
  },
  productDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 8,
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
});

export default ProductListScreen;