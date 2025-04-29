import React, { useState, useEffect } from 'react';
import { 
  View, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Alert, 
  ActivityIndicator 
} from 'react-native';
import { 
  Text, 
  Card, 
  Title, 
  Paragraph, 
  Button, 
  Divider, 
  TextInput,
  IconButton,
  useTheme,
  Dialog,
  Portal,
  List,
  Chip,
  Menu
} from 'react-native-paper';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { 
  getProducts, 
  increaseProductQuantity, 
  decreaseProductQuantity, 
  deleteProduct,
  getSpecificProductHistory,
  getProductQuantityInAllGroups,
  getProductQuantityInOneGroup
} from '../../services/api/productApi';
import { getAllGroups, getMyGroups } from '../../services/api/groupApi';
import { format, parseISO } from 'date-fns';

// Define interfaces
interface Product {
  uuid: string;
  name: string;
  category: string;
  expiration_date: string;
  quantity: number;
  comments?: string;
  groups?: Group[];
}

interface Group {
  uuid: string;
  name: string;
  quantity?: number; // Make quantity optional since it might not be present in all contexts
}

interface ProductHistory {
  uuid: string;
  product_uuid: string;
  user_uuid: string;
  username: string;
  action: string;
  quantity: number;
  timestamp: string;
  group_uuid?: string;
  group_name?: string;
}

type ProductDetailRouteProp = RouteProp<
  { ProductDetail: { productUuid: string } },
  'ProductDetail'
>;

const ProductDetailScreen = () => {
  const navigation = useNavigation();
  const route = useRoute<ProductDetailRouteProp>();
  const theme = useTheme();
  const { productUuid } = route.params;

  // State variables
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState<ProductHistory[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [quantity, setQuantity] = useState('1');
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [isHistoryExpanded, setIsHistoryExpanded] = useState(false);
  
  // Dropdown state
  const [openDropdown, setOpenDropdown] = useState(false);
  const [groups, setGroups] = useState<{label: string, value: string}[]>([]);
  const [selectedGroupLabel, setSelectedGroupLabel] = useState('Global (All Groups)');

  // Fetch product details
  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        setLoading(true);
        const products = await getProducts();
        const product = products.find((p: Product) => p.uuid === productUuid);
        
        if (product) {
          setProduct(product);
          
          // Get product quantities in all groups
          const groupQuantities = await getProductQuantityInAllGroups(productUuid);
          if (groupQuantities && groupQuantities.length > 0) {
            // Update product with group quantities
            setProduct(prev => ({
              ...prev!,
              groups: groupQuantities
            }));
          }
          
          // Prepare groups for dropdown
          const groupOptions = [
            { label: 'Global (All Groups)', value: 'global' }
          ];
          
          // Get all groups for the dropdown options
          const allGroups = await getAllGroups();
          if (allGroups && allGroups.data && allGroups.data.length > 0) {
            allGroups.data.forEach((group) => {
              groupOptions.push({
                label: `${group.name}`,
                value: group.uuid
              });
            });
          }
          
          setGroups(groupOptions);
          
          // Get my groups to set default value
          const myGroups = await getMyGroups();
          if (myGroups && myGroups.data && myGroups.data.length > 0) {
            // Set the first of my groups as default
            setSelectedGroup(myGroups.data[0].uuid);
            setSelectedGroupLabel(myGroups.data[0].name);
          } else {
            // Fall back to global if no user groups
            setSelectedGroup('global');
          }
        }
      } catch (error) {
        console.error('Error fetching product details:', error);
        Alert.alert('Error', 'Failed to load product details');
      } finally {
        setLoading(false);
      }
    };

    fetchProductDetails();
  }, [productUuid]);

  // Fetch product history
  useEffect(() => {
    const fetchProductHistory = async () => {
      if (!productUuid) return;
      
      try {
        setHistoryLoading(true);
        const historyData = await getSpecificProductHistory(productUuid);
        setHistory(historyData);
      } catch (error) {
        console.error('Error fetching product history:', error);
      } finally {
        setHistoryLoading(false);
      }
    };

    fetchProductHistory();
  }, [productUuid]);

  // Update the selected group label when selectedGroup changes
  useEffect(() => {
    if (selectedGroup) {
      const groupItem = groups.find(item => item.value === selectedGroup);
      if (groupItem) {
        setSelectedGroupLabel(groupItem.label);
      }
    }
  }, [selectedGroup, groups]);

  // Format date function
  const formatDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), 'MMM d, yyyy');
    } catch (error) {
      return dateString;
    }
  };

  // Format timestamp function
  const formatTimestamp = (timestamp: string) => {
    try {
      return format(parseISO(timestamp), 'MMM d, yyyy h:mm a');
    } catch (error) {
      return timestamp;
    }
  };
  const handleRefreshData = async () => {
    // Refresh product details and history
    const products = await getProducts();
    const updatedProduct = products.find((p: Product) => p.uuid === productUuid);
    if (updatedProduct) {
      setProduct(updatedProduct);
      
      // Get updated group quantities
      const groupQuantities = await getProductQuantityInAllGroups(productUuid);
      if (groupQuantities && groupQuantities.length > 0) {
        setProduct(prev => ({
          ...prev!,
          groups: groupQuantities
        }));
      }
    }
    
    const historyData = await getSpecificProductHistory(productUuid);
    setHistory(historyData);
  };

  // Handle quantity increase
  const handleIncreaseQuantity = async () => {
    if (!product) return;
    
    const quantityNum = parseInt(quantity, 10);
    if (isNaN(quantityNum) || quantityNum <= 0) {
      Alert.alert('Invalid Quantity', 'Please enter a positive number');
      return;
    }
    
    try {
      setLoading(true);
      await increaseProductQuantity(product.uuid, quantityNum);
      Alert.alert('Success', `Added ${quantityNum} units to inventory`);
      handleRefreshData();
    } catch (error) {
      console.error('Error increasing quantity:', error);
      Alert.alert('Error', 'Failed to increase quantity');
    } finally {
      setLoading(false);
    }
  };

  // Handle quantity decrease
  const handleDecreaseQuantity = async () => {
    if (!product) return;
    
    const quantityNum = parseInt(quantity) || 1;
    if (quantityNum <= 0) {
      Alert.alert('Invalid Quantity', 'Please enter a positive number');
      return;
    }
    
    if (quantityNum > product.quantity) {
      Alert.alert('Invalid Quantity', 'Cannot decrease more than available quantity');
      return;
    }
    
    try {
      setLoading(true);
      await decreaseProductQuantity(product.uuid, quantityNum);
      Alert.alert('Success', `Removed ${quantityNum} units from inventory`);
      handleRefreshData();
    } catch (error) {
      console.error('Error decreasing quantity:', error);
      Alert.alert('Error', 'Failed to decrease quantity');
    } finally {
      setLoading(false);
    }
  };

  // Handle product deletion
  const handleDeleteProduct = async () => {
    if (!product) return;
    
    try {
      setLoading(true);
      await deleteProduct(product.uuid);
      Alert.alert('Success', 'Product deleted successfully');
      
      // Navigate back after successful deletion
      navigation.goBack();
      
    } catch (error) {
      console.error('Error deleting product:', error);
      Alert.alert('Error', 'Failed to delete product');
      setLoading(false);
    }
  };

  // Toggle history expansion
  const toggleHistoryExpansion = () => {
    setIsHistoryExpanded(!isHistoryExpanded);
  };

  // Loading state
  if (loading && !product) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Loading product details...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header with back button */}
        <View style={styles.header}>
          <TouchableOpacity 
            onPress={() => navigation.goBack()} 
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color={theme.colors.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Product Details</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Product Details Card */}
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.productName}>{product?.name}</Title>
            
            <View style={styles.infoRow}>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Category</Text>
                <Chip icon="tag" style={styles.categoryChip}>{product?.category}</Chip>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Expiration Date</Text>
                <Chip icon="calendar" style={styles.expirationChip}>
                  {product?.expiration_date ? formatDate(product.expiration_date) : 'N/A'}
                </Chip>
              </View>
            </View>
            
            <Divider style={styles.divider} />
            
            <View style={styles.quantitySection}>
              <Text style={styles.infoLabel}>Total Quantity</Text>
              <View style={styles.quantityDisplay}>
                <Ionicons name="cube" size={24} color={theme.colors.primary} />
                <Text style={styles.quantityText}>{product?.quantity || 0}</Text>
              </View>
            </View>
            
            {/* Comments section */}
            {product?.comments && (
              <>
                <Divider style={styles.divider} />
                <Text style={styles.infoLabel}>Comments</Text>
                <Paragraph style={styles.commentsText}>{product.comments}</Paragraph>
              </>
            )}
          </Card.Content>
        </Card>

        {/* Group Quantities Card */}
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.cardTitle}>Quantity by Group</Title>
            {!product?.groups || product.groups.length === 0 ? (
              <Text style={styles.noHistoryText}>No group quantity information available</Text>
            ) : (
              product.groups.map((group) => (
                <View key={group.uuid} style={styles.groupItem}>
                  <Text style={styles.groupName}>{group.name}</Text>
                  <Text style={styles.groupQuantity}>{group.quantity} units</Text>
                </View>
              ))
            )}
          </Card.Content>
        </Card>

        {/* Update Quantity Card */}
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.cardTitle}>Update Inventory</Title>
            
            <Text style={styles.dropdownLabel}>Select Group</Text>
            <View style={styles.menuContainer}>
              <Menu
                visible={openDropdown}
                onDismiss={() => setOpenDropdown(false)}
                anchor={
                  <Button 
                    mode="outlined" 
                    onPress={() => setOpenDropdown(true)}
                    style={styles.menuButton}
                    icon="chevron-down"
                    contentStyle={styles.menuButtonContent}
                  >
                    {selectedGroupLabel}
                  </Button>
                }
              >
                {groups.map((group) => (
                  <Menu.Item
                    key={group.value}
                    onPress={() => {
                      setSelectedGroup(group.value);
                      setSelectedGroupLabel(group.label);
                      setOpenDropdown(false);
                    }}
                    title={group.label}
                    style={selectedGroup === group.value ? styles.selectedMenuItem : {}}
                    titleStyle={selectedGroup === group.value ? styles.selectedMenuItemText : {}}
                  />
                ))}
              </Menu>
            </View>
            
            <View style={styles.quantityInputContainer}>
              <Text style={styles.inputLabel}>Quantity</Text>
              <TextInput
                value={quantity}
                onChangeText={setQuantity}
                keyboardType="numeric"
                style={styles.quantityInput}
                mode="outlined"
              />
            </View>
            
            <View style={styles.actionButtons}>
              <Button 
                mode="contained" 
                onPress={handleIncreaseQuantity}
                style={[styles.actionButton, { backgroundColor: theme.colors.primary }]}
                icon="plus"
                disabled={loading}
              >
                Add
              </Button>
              <Button 
                mode="contained" 
                onPress={handleDecreaseQuantity}
                style={[styles.actionButton, { backgroundColor: theme.colors.primary }]}
                icon="minus"
                disabled={loading || (product?.quantity || 0) <= 0}
              >
                Remove
              </Button>
            </View>
          </Card.Content>
        </Card>

        {/* Product History Card */}
        <Card style={styles.card}>
          <Card.Content>
            <TouchableOpacity 
              onPress={toggleHistoryExpansion}
              style={styles.historyHeaderContainer}
            >
              <Title style={styles.cardTitle}>Product History</Title>
              <Ionicons 
                name={isHistoryExpanded ? 'chevron-up' : 'chevron-down'} 
                size={24} 
                color={theme.colors.primary}
              />
            </TouchableOpacity>
            
            {historyLoading ? (
              <ActivityIndicator size="small" style={styles.historyLoading} />
            ) : history.length === 0 ? (
              <Text style={styles.noHistoryText}>No history available</Text>
            ) : isHistoryExpanded ? (
              history.map((item, index) => (
                <View key={item.uuid} style={styles.historyItem}>
                  <View style={styles.historyItemRow}>
                    <Ionicons 
                      name={
                        item.action.includes('increase') ? 'arrow-up-circle' : 
                        item.action.includes('decrease') ? 'arrow-down-circle' : 
                        item.action.includes('delete') ? 'trash-outline' : 
                        'information-circle'
                      } 
                      size={20} 
                      color={
                        item.action.includes('increase') ? '#4CAF50' : 
                        item.action.includes('decrease') ? '#F44336' : 
                        item.action.includes('delete') ? '#FF9800' : 
                        '#2196F3'
                      }
                      style={styles.historyIcon}
                    />
                    <Text style={styles.historyAction}>{item.action}</Text>
                  </View>
                  <Text style={styles.historyInfo}>
                    {item.quantity} units | {formatTimestamp(item.timestamp)}
                  </Text>
                  {index < history.length - 1 && <Divider style={styles.historyDivider} />}
                </View>
              ))
            ) : (
              <Text style={styles.expandPrompt}>
                Tap to view {history.length} history items
              </Text>
            )}
          </Card.Content>
        </Card>

        {/* Delete Button */}
        <Button 
          mode="contained" 
          onPress={() => setDeleteDialogVisible(true)}
          style={styles.deleteButton}
          icon="delete"
          buttonColor={theme.colors.error}
        >
          Delete Product
        </Button>
      </ScrollView>

      {/* Delete Confirmation Dialog */}
      <Portal>
        <Dialog visible={deleteDialogVisible} onDismiss={() => setDeleteDialogVisible(false)}>
          <Dialog.Title>Delete Product</Dialog.Title>
          <Dialog.Content>
            <Paragraph>
              Are you sure you want to delete "{product?.name}"? This action cannot be undone.
            </Paragraph>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDeleteDialogVisible(false)}>Cancel</Button>
            <Button onPress={handleDeleteProduct} textColor={theme.colors.error}>Delete</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  card: {
    marginBottom: 16,
    elevation: 2,
  },
  productName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  infoItem: {
    flex: 1,
    marginRight: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  categoryChip: {
    alignSelf: 'flex-start',
  },
  expirationChip: {
    alignSelf: 'flex-start',
  },
  divider: {
    marginVertical: 16,
  },
  quantitySection: {
    alignItems: 'center',
  },
  quantityDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  quantityText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  commentsText: {
    fontSize: 16,
    fontStyle: 'italic',
  },
  groupItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  groupName: {
    fontSize: 16,
  },
  groupQuantity: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  dropdownLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  menuContainer: {
    marginBottom: 16,
  },
  menuButton: {
    backgroundColor: 'white',
  },
  menuButtonContent: {
    padding: 8,
  },
  selectedMenuItem: {
    backgroundColor: '#f0f0f0',
  },
  selectedMenuItemText: {
    fontWeight: 'bold',
  },
  quantityInputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  quantityInput: {
    backgroundColor: 'white',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 0.48,
  },
  historyLoading: {
    marginVertical: 16,
  },
  noHistoryText: {
    textAlign: 'center',
    marginVertical: 16,
    fontStyle: 'italic',
    color: '#666',
  },
  historyHeaderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  historyItem: {
    padding: 8,
  },
  historyItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  historyIcon: {
    marginRight: 8,
  },
  historyAction: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  historyInfo: {
    fontSize: 14,
    color: '#666',
  },
  historyDivider: {
    marginVertical: 8,
  },
  expandPrompt: {
    textAlign: 'center',
    marginVertical: 16,
    fontStyle: 'italic',
    color: '#666',
  },
  deleteButton: {
    marginTop: 8,
  },
  historyGroupChip: {
    marginVertical: 4,
  },
});

export default ProductDetailScreen;