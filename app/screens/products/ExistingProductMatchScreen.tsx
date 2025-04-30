import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native';
import { Text, Button, Card, ActivityIndicator, TextInput } from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { convertOcrToProduct, getProductMatches, increaseProductQuantity, decreaseProductQuantity, getProductMatchesGlobal } from '../../services/api/productApi';
import { setLoading, resetOcr } from '../../store/slices/ocrSlice';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { InventoryStackParamList } from '../../navigation/types/navigation';

// Define Product interface
interface Product {
  uuid: string;
  name: string;
  category: string;
  expiration_date: string;
  quantity: number;
  comments?: string;
  ocr_text?: string;
}

type ExistingProductMatchScreenNavigationProp = StackNavigationProp<InventoryStackParamList>;

const ExistingProductMatchScreen = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation<ExistingProductMatchScreenNavigationProp>();
  const { ocrResults, imageUri, loading } = useSelector((state: RootState) => state.ocr);
  const [matchingProducts, setMatchingProducts] = useState<Product[]>([]);
  const [isNewProduct, setIsNewProduct] = useState(false);
  const [matched_uuids, setMatchedUuids] = useState<string[]>([]);
  const [convertedProduct, setConvertedProduct] = useState<Product | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState('1');
  const [processing, setProcessing] = useState(true);
  const [actionType, setActionType] = useState('add'); // 'add' or 'remove'
  const [convertingOcr, setConvertingOcr] = useState(true);
  const [isGlobalSearching, setIsGlobalSearching] = useState(false);
  // Process OCR text when component mounts
  useEffect(() => {
    const convertOcr = async () => {
      if (ocrResults && ocrResults.length > 0) {
        try {
          setConvertingOcr(true);
          const ocrText = ocrResults[0];
          
          // Convert OCR to product
          const extractedProduct = await convertOcrToProduct(ocrText);
          console.log('Extracted Product:', extractedProduct);
          
          if (!extractedProduct) {
            throw new Error('Failed to convert OCR to product');
          }
          
          setConvertedProduct(extractedProduct);
          
        } catch (error) {
          console.error('Error processing OCR for existing product:', error);
          alert('Error processing image data. Please try again.');
        } finally {
          setConvertingOcr(false);
        }
      }
    };
    
    convertOcr();
  }, [ocrResults]);
  
  // Log when convertedProduct changes
  useEffect(() => {
    console.log('Converted Product (updated):', convertedProduct);
    
    const findMatches = async () => {
      if (convertedProduct) {
        try {
          setProcessing(true);
          
          // Use the converted product for matching
          const matches = await getProductMatches(convertedProduct);
          
          console.log('is new product:', matches.is_new_product);
          if (matches.is_new_product) {
            setIsNewProduct(true);
          } else {
            setIsNewProduct(false);
            console.log('inside');
            setMatchingProducts(matches.matched_products);
            setMatchedUuids(matches.matched_uuids);
          }
          
        } catch (error) {
          console.error('Error finding matches for existing product:', error);
          alert('Error processing image data. Please try again.');
        } finally {
          setProcessing(false);
        }
      }
    };
    
    findMatches();
  }, [convertedProduct]);


  const handleProductSelect = (product: Product) => {
    setSelectedProduct(product);
  };

  const handleUpdateQuantity = async () => {
    if (!selectedProduct) {
      alert('Please select a product first');
      return;
    }
    
    const quantityNum = parseInt(quantity, 10);
    if (isNaN(quantityNum) || quantityNum <= 0) {
      alert('Please enter a valid quantity');
      return;
    }
    
    try {
      dispatch(setLoading(true));
      
      // Update quantity based on action type
      if (actionType === 'add') {
        await increaseProductQuantity(selectedProduct.uuid, quantityNum);
        alert(`Added ${quantityNum} units of ${selectedProduct.name}`);
      } else {
        await decreaseProductQuantity(selectedProduct.uuid, quantityNum);
        alert(`Removed ${quantityNum} units of ${selectedProduct.name}`);
      }
      
      // Reset and navigate back
      dispatch(resetOcr());
      navigation.navigate('Camera');
      
    } catch (error) {
      console.error('Error updating product quantity:', error);
      alert('Failed to update product quantity. Please try again.');
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleRetake = () => {
    navigation.navigate('Camera');
  };

  const handleGlobalSearch = async () => {
    if (!convertedProduct) {
      alert('No product information available to search');
      return;
    }
    
    try {
      setIsGlobalSearching(true);
      
      // Use the converted product for global matching
      const globalMatches = await getProductMatchesGlobal(convertedProduct);
      
      if (globalMatches.is_new_product) {
        setIsNewProduct(true);
      } else {
        setIsNewProduct(false);
        setMatchingProducts(globalMatches.matched_products);
        setMatchedUuids(globalMatches.matched_uuids);
      }
      
    } catch (error) {
      console.error('Error finding global matches:', error);
      alert('Error searching for global matches. Please try again.');
    } finally {
      setIsGlobalSearching(false);
    }
  };

  useEffect(() => {
    console.log("matchingProducts after update:", matchingProducts);
  }, [matchingProducts]);
  
  useEffect(() => {
    console.log("selectedProduct after update:", selectedProduct);
  }, [selectedProduct]);
  
  //loading screen for OCR conversion 
  if (convertingOcr || loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>
          {convertingOcr ? 'Processing image...' : 'Finding matching products...'}
        </Text>
      </View>
    );
  }

  //loading screen for product matches and quantity update
  if (processing || loading || isGlobalSearching) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>
          {processing ? 'Finding matching products...' : 
           isGlobalSearching ? 'Searching global database...' : 
           'Updating inventory...'}
        </Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Match Existing Product</Text>
      
      {imageUri && (
        <Card style={styles.imageCard}>
          <Card.Content>
            <Image source={{ uri: imageUri }} style={styles.image} />
          </Card.Content>
        </Card>
      )}

      <TextInput
        label="Product Name"
        value={convertedProduct?.name}
        onChangeText={(text) => 
          setConvertedProduct(prev => prev ? {...prev, name: text} : null)
        }
        style={styles.input}
      />
      
      <TextInput
        label="Category"
        value={convertedProduct?.category}
        onChangeText={(text) => 
          setConvertedProduct(prev => prev ? {...prev, category: text} : null)
        }
        style={styles.input}
      />
      
      <TextInput
        label="Expiration Date"
        value={convertedProduct?.expiration_date}
        onChangeText={(text) => 
          setConvertedProduct(prev => prev ? {...prev, expiration_date: text} : null)
        }
        style={styles.input}
      />
      
      <TextInput
        label="Quantity"
        value={convertedProduct?.quantity.toString()}
        onChangeText={(text) => {
          const parsed = parseInt(text, 10)
          if (!isNaN(parsed)) {
            setConvertedProduct(prev => prev ? {...prev, quantity: parsed} : null)
          } else {
            alert('Please enter a valid quantity')
          }
        }}
        keyboardType="numeric"
        style={styles.input}
      />
      
      <TextInput
        label="Comments (Optional)"
        value={convertedProduct?.comments}
        onChangeText={(text) => 
          setConvertedProduct(prev => prev ? {...prev, comments: text} : null)
        }
        style={styles.input}
        multiline
      />


      
      {convertedProduct && (
        <Card style={styles.card}>
          <Card.Title title="Detected Information" />
          <Card.Content>
            <Text>Name: {convertedProduct.name}</Text>
            <Text>Category: {convertedProduct.category}</Text>
            <Text>Expiration: {convertedProduct.expiration_date}</Text>
            <Text>Quantity: {convertedProduct.quantity}</Text>
            <Text>Comments: {convertedProduct.comments}</Text>
          </Card.Content>
          <Card.Actions>
            <Button
              mode="contained"
              onPress={handleGlobalSearch}
              style={styles.globalSearchButton}
            >
              Search Global Database
            </Button>
          </Card.Actions>
        </Card>
      )}
      
      <Text style={styles.sectionTitle}>Select Matching Product:</Text>
      
      {isNewProduct && matchingProducts.length === 0 ? (
        <Text style={styles.noResults}>No matching products found</Text>
      ) : (
        matchingProducts.map((product, index) => (
          <TouchableOpacity key={index} onPress={() => handleProductSelect(product)}>
            <Card 
              style={[
                styles.productCard, 
                selectedProduct?.uuid === product.uuid && styles.selectedCard
              ]}
            >
              <Card.Content>
                <Text style={styles.productName}>{product.name}</Text>
                <Text>Category: {product.category}</Text>
                <Text>Current Quantity: {product.quantity}</Text>
                <Text>Expiration: {product.expiration_date}</Text>
                <Text>Comments: {product.comments}</Text>
              </Card.Content>
            </Card>
          </TouchableOpacity>
        ))
      )}
      
      {selectedProduct && (
        <View style={styles.updateSection}>
          <Text style={styles.sectionTitle}>Update Quantity:</Text>
          
          <View style={styles.actionButtons}>
            <Button 
              mode={actionType === 'add' ? 'contained' : 'outlined'} 
              onPress={() => setActionType('add')}
              style={styles.actionButton}
            >
              Add
            </Button>
            
            <Button 
              mode={actionType === 'remove' ? 'contained' : 'outlined'} 
              onPress={() => setActionType('remove')}
              style={styles.actionButton}
            >
              Remove
            </Button>
          </View>
          
          <TextInput
            label="Quantity"
            value={quantity}
            onChangeText={setQuantity}
            keyboardType="numeric"
            style={styles.input}
          />
          
          <Button 
            mode="contained" 
            onPress={handleUpdateQuantity} 
            style={styles.updateButton}
          >
            {actionType === 'add' ? 'Add to Inventory' : 'Remove from Inventory'}
          </Button>
        </View>
      )}
      
      <Button 
        mode="outlined" 
        onPress={handleRetake} 
        style={styles.retakeButton}
      >
        Retake Photo
      </Button>
    </ScrollView>
  );
};



const styles = StyleSheet.create({
  container: {
    padding: 16,
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 12,
  },
  imageCard: {
    marginBottom: 16,
  },
  image: {
    width: '100%',
    height: 200,
    resizeMode: 'contain',
  },
  card: {
    marginBottom: 16,
  },
  noResults: {
    textAlign: 'center',
    marginVertical: 24,
    fontSize: 16,
    fontStyle: 'italic',
  },
  productCard: {
    marginBottom: 12,
  },
  selectedCard: {
    borderWidth: 2,
    borderColor: '#2196F3',
  },
  productName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  updateSection: {
    marginTop: 24,
    padding: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 4,
  },
  input: {
    marginBottom: 16,
  },
  updateButton: {
    marginBottom: 16,
  },
  retakeButton: {
    marginTop: 24,
  },
  globalSearchButton: {
    width: '100%',
    marginTop: 8,
  },
});

export default ExistingProductMatchScreen; 