import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Button, Card } from 'react-native-paper';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { useNavigation } from '@react-navigation/native';

const HomeScreen = () => {
  const navigation = useNavigation();
  const { user } = useSelector((state: RootState) => state.auth);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.greeting}>
        Welcome, {user?.username || 'User'}!
      </Text>

      <Card style={styles.card}>
        <Card.Title title="Quick Actions" />
        <Card.Content>
          <Button 
            mode="contained" 
            onPress={() => navigation.navigate('ProductTypeSelection' as never)}
            style={styles.button}
          >
            Scan Product
          </Button>
          
          <Button 
            mode="outlined" 
            onPress={() => navigation.navigate('ProductList' as never)}
            style={styles.button}
          >
            View Inventory
          </Button>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Title title="Inventory Summary" />
        <Card.Content>
          <Text>Your inventory overview will appear here.</Text>
          <Text>Connect to the API to fetch real-time data.</Text>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Title title="Recent Activity" />
        <Card.Content>
          <Text>Your recent activity will be shown here.</Text>
          <Text>Connect to the API to fetch activity data.</Text>
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 50,
    padding: 16,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  card: {
    marginBottom: 16,
  },
  button: {
    marginBottom: 8,
  },
});

export default HomeScreen; 