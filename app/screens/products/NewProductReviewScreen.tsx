import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Image } from 'react-native';
import { TextInput, Button, Text, ActivityIndicator, Card } from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { convertOcrToProduct, createProduct } from '../../services/api/productApi';
import { setLoading, resetOcr } from '../../store/slices/ocrSlice';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { InventoryStackParamList } from '../../navigation/types/navigation';
import { colors, textColors } from '../../theme';

type NewProductReviewScreenNavigationProp = StackNavigationProp<InventoryStackParamList>;

const NewProductReviewScreen = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation<NewProductReviewScreenNavigationProp>();
  const { ocrResults, imageUri, loading } = useSelector((state: RootState) => state.ocr);
  
  const [product, setProduct] = useState({
    name: '',
    category: '',
    expiration_date: '',
    quantity: 1,
    comments: '',
    ocr_text: ''
  });
  
  const [convertingOcr, setConvertingOcr] = useState(true);

  // Process OCR text when component mounts
  useEffect(() => {
    const processOcr = async () => {
      if (ocrResults && ocrResults.length > 0) {
        try {
          setConvertingOcr(true);
          const ocrText = ocrResults[0];
          
          // Call backend to convert OCR to product structure
          const extractedProduct = await convertOcrToProduct(ocrText);
          
          setProduct({
            ...extractedProduct,
            ocr_text: ocrText,
            quantity: 1 // Default quantity for new product
          });
          
        } catch (error) {
          console.error('Error converting OCR:', error);
        } finally {
          setConvertingOcr(false);
        }
      }
    };
    
    processOcr();
  }, [ocrResults]);

  const handleSaveProduct = async () => {
    try {
      dispatch(setLoading(true));
      
      // Create new product in backend
      await createProduct(product);
      
      // Show success and navigate back to selection
      alert('Product added successfully!');
      dispatch(resetOcr());
      navigation.navigate('ProductTypeSelection');
      
    } catch (error) {
      console.error('Error saving product:', error);
      alert('Failed to save product. Please try again.');
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleRetake = () => {
    navigation.navigate('Camera');
  };

  if (convertingOcr || loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>
          {convertingOcr ? 'Processing image...' : 'Saving product...'}
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.scrollView} contentContainerStyle={styles.container}>
      <Text style={styles.title}>Review Product Information</Text>
      
      {imageUri && (
        <Card style={styles.imageCard}>
          <Card.Content>
            <Image source={{ uri: imageUri }} style={styles.image} />
          </Card.Content>
        </Card>
      )}
      
      <TextInput
        label="Product Name"
        value={product.name}
        onChangeText={(text) => setProduct({ ...product, name: text })}
        style={styles.input}
        mode="outlined"
        outlineColor={colors.primary}
        activeOutlineColor={colors.primary}
      />
      
      <TextInput
        label="Category"
        value={product.category}
        onChangeText={(text) => setProduct({ ...product, category: text })}
        style={styles.input}
        mode="outlined"
        outlineColor={colors.primary}
        activeOutlineColor={colors.primary}
      />
      
      <TextInput
        label="Expiration Date"
        value={product.expiration_date}
        onChangeText={(text) => setProduct({ ...product, expiration_date: text })}
        style={styles.input}
        mode="outlined"
        outlineColor={colors.primary}
        activeOutlineColor={colors.primary}
      />
      
      <TextInput
        label="Quantity"
        value={product.quantity.toString()}
        onChangeText={(text) => setProduct({ ...product, quantity: parseInt(text) || 0 })}
        keyboardType="numeric"
        style={styles.input}
        mode="outlined"
        outlineColor={colors.primary}
        activeOutlineColor={colors.primary}
      />
      
      <TextInput
        label="Comments (Optional)"
        value={product.comments}
        onChangeText={(text) => setProduct({ ...product, comments: text })}
        style={styles.input}
        multiline
        mode="outlined"
        outlineColor={colors.primary}
        activeOutlineColor={colors.primary}
      />
      
      <View style={styles.buttonContainer}>
        <Button 
          mode="contained" 
          onPress={handleSaveProduct} 
          style={styles.button}
          disabled={!product.name || !product.category}
          buttonColor={colors.primary}
        >
          Add Product
        </Button>
        
        <Button 
          mode="outlined" 
          onPress={handleRetake} 
          style={styles.button}
          textColor={colors.primary}
          buttonColor={colors.white}
        >
          Retake Photo
        </Button>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: textColors.primary,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
    color: colors.primary,
  },
  imageCard: {
    marginBottom: 16,
    borderRadius: 8,
    backgroundColor: colors.white,
    elevation: 2,
  },
  image: {
    width: '100%',
    height: 200,
    resizeMode: 'contain',
  },
  input: {
    marginBottom: 16,
    backgroundColor: colors.white,
  },
  buttonContainer: {
    marginTop: 16,
  },
  button: {
    marginBottom: 12,
    borderRadius: 8,
    borderColor: colors.primary,
  },
});

export default NewProductReviewScreen; 