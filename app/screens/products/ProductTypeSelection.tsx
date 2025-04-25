import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Button, Card } from 'react-native-paper';
import { Text } from 'react-native';
import { useDispatch } from 'react-redux';
import { setIsNewProduct } from '../../store/slices/ocrSlice';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { InventoryStackParamList } from '../../navigation/types/navigation';

type ProductTypeSelectionNavigationProp = StackNavigationProp<InventoryStackParamList>;

const ProductTypeSelection = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation<ProductTypeSelectionNavigationProp>();

  const handleNewProduct = () => {
    dispatch(setIsNewProduct(true));
    navigation.navigate('Camera');
  };

  const handleExistingProduct = () => {
    dispatch(setIsNewProduct(false));
    navigation.navigate('Camera');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>What would you like to do?</Text>
      
      <Card style={styles.card} onPress={handleNewProduct}>
        <Card.Content>
          <Text style={styles.cardTitle}>Add New Product</Text>
          <Text>Scan a new product to add to your inventory</Text>
        </Card.Content>
      </Card>

      <Card style={styles.card} onPress={handleExistingProduct}>
        <Card.Content>
          <Text style={styles.cardTitle}>Update Existing Product</Text>
          <Text>Scan an existing product to update quantity</Text>
        </Card.Content>
      </Card>

      <Card style={styles.card} onPress={() => navigation.navigate('ProductList', {})}>
        <Card.Content>
          <Text style={styles.cardTitle}>View Products</Text>
          <Text>Browse and search your inventory</Text>
        </Card.Content>
      </Card>

      <Card style={styles.card} onPress={() => navigation.navigate('ProductHistory', {})}>
        <Card.Content>
          <Text style={styles.cardTitle}>View Activity History</Text>
          <Text>View product activity history</Text>
        </Card.Content>
      </Card>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
  },
  card: {
    marginBottom: 16,
    elevation: 4,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
});

export default ProductTypeSelection;