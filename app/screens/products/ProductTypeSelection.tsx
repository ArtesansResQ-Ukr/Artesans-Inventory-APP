import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Button, Text, Card } from 'react-native-paper';
import { useDispatch } from 'react-redux';
import { setIsNewProduct } from '../../store/slices/ocrSlice';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type Props = {
  navigation: NativeStackNavigationProp<any>;
};

const ProductTypeSelection = ({ navigation }: Props) => {
  const dispatch = useDispatch();

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