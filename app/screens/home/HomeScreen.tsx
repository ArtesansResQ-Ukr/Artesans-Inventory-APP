// React import is needed for JSX
import React from 'react';
import { View, StyleSheet, Platform, Dimensions } from 'react-native';
import { Card, Text, useTheme } from 'react-native-paper';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type Props = {
  navigation: NativeStackNavigationProp<any>;
};

/**
 * HomeScreen component
 * Displays main navigation options: Inventory Management and User Management
 * Acts as the main landing page for the application
 */
const HomeScreen = ({ navigation }: Props) => {
  const theme = useTheme();
  const isWeb = Platform.OS === 'web';
  const screenWidth = Dimensions.get('window').width;
  
  // Responsive container width calculation
  const containerWidth = isWeb 
    ? Math.min(800, screenWidth - 40) // Max width on web with padding
    : screenWidth - 32;  // Full width minus padding on mobile
  
  return (
    <View style={[styles.container, { width: containerWidth }]}>
      <Text style={styles.title}>Inventory System</Text>
      <Text style={styles.subtitle}>Please select an option:</Text>
      
      <View style={isWeb ? styles.webCardContainer : styles.mobileCardContainer}>
        <Card 
          style={[
            styles.card, 
            isWeb ? styles.webCard : null
          ]} 
          onPress={() => navigation.navigate('ProductTypeSelection')}
        >
          <Card.Content style={styles.cardContent}>
            <Text style={styles.cardTitle}>Inventory Management</Text>
            <Text style={styles.cardDescription}>
              Manage inventory, scan products, and track inventory
            </Text>
          </Card.Content>
        </Card>

        <Card 
          style={[
            styles.card, 
            isWeb ? styles.webCard : null
          ]} 
          onPress={() => navigation.navigate('UserManagement')}
        >
          <Card.Content style={styles.cardContent}>
            <Text style={styles.cardTitle}>User Management</Text>
            <Text style={styles.cardDescription}>
              Manage groups, users, permissions, and access control
            </Text>
          </Card.Content>
        </Card>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    padding: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    marginBottom: 32,
    textAlign: 'center',
    opacity: 0.7,
  },
  webCardContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    flexWrap: 'wrap',
    width: '100%',
  },
  mobileCardContainer: {
    width: '100%',
  },
  card: {
    marginBottom: 16,
    elevation: 4,
    width: '100%',
  },
  webCard: {
    width: '45%', 
    minWidth: 300,
  },
  cardContent: {
    padding: 16,
    minHeight: 120,
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  cardDescription: {
    fontSize: 16,
    opacity: 0.8,
  },
});

export default HomeScreen; 