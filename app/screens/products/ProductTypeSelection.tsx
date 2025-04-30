import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Card } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/types/navigation';
import { colors, textColors } from '../../theme';
import { InventoryStackParamList } from '../../navigation/types/navigation';
import { useDispatch } from 'react-redux';
import { setIsNewProduct } from '../../store/slices/ocrSlice';
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
      <Text style={styles.header}>Select an Action</Text>
      
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
    backgroundColor: colors.background,
    padding: 16,
    marginTop: 50,
    justifyContent: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    color: textColors.primary,
    textAlign: 'center'
  },
  list: {
    paddingBottom: 16,
  },
  cardContainer: {
    flex: 1,
    padding: 8,
    marginBottom: 20,
  },
  card: {
    marginTop: 20,
    borderRadius: 20,
    backgroundColor: colors.white,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4
    
  },
  cardContent: {
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 8,
    color: textColors.primary,
  },
  cardDescription: {
    fontSize: 12,
    color: textColors.secondary,
    textAlign: 'center',
    marginTop: 4,
  },
});

export default ProductTypeSelection;