import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Button, Card, Divider } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { AppStackParamList } from '../../navigation/types/navigation';

/**
 * UserManagementScreen component
 * Screen for user management functionality
 */
const UserManagementScreen = () => {
  const navigation = useNavigation<StackNavigationProp<AppStackParamList>>();

  return (
    <ScrollView style={styles.scrollContainer}>
      <View style={styles.container}>
        <Text style={styles.title}>User Management</Text>
        
        <Card style={styles.card}>
          <Card.Title title="Users" titleStyle={styles.cardTitle} />
          <Card.Content>
            <Text style={styles.cardDescription}>
              View all users, create new users, or manage existing user accounts.
            </Text>
          </Card.Content>
          <Card.Actions style={styles.cardActions}>
            <Button 
              mode="contained" 
              onPress={() => navigation.navigate('ViewAllUsers')}
              style={styles.button}
            >
              Manage Users
            </Button>
          </Card.Actions>
        </Card>

        <Card style={styles.card}>
          <Card.Title title="Groups" titleStyle={styles.cardTitle} />
          <Card.Content>
            <Text style={styles.cardDescription}>
              Manage user groups and permissions within the organization.
            </Text>
          </Card.Content>
          <Card.Actions style={styles.cardActions}>
            <Button 
              mode="contained" 
              onPress={() => {}}
              style={styles.button}
              disabled
            >
              Coming Soon
            </Button>
          </Card.Actions>
        </Card>

        <Card style={styles.card}>
          <Card.Title title="Roles" titleStyle={styles.cardTitle} />
          <Card.Content>
            <Text style={styles.cardDescription}>
              Define and assign roles with specific permissions to users.
            </Text>
          </Card.Content>
          <Card.Actions style={styles.cardActions}>
            <Button 
              mode="contained"
              onPress={() => {}}
              style={styles.button}
              disabled
            >
              Coming Soon
            </Button>
          </Card.Actions>
        </Card>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: 16,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 16,
    alignSelf: 'flex-start',
  },
  card: {
    width: '100%',
    marginBottom: 16,
    elevation: 2,
    maxWidth: 600,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  cardDescription: {
    marginBottom: 8,
  },
  cardActions: {
    justifyContent: 'flex-end',
    paddingRight: 16,
    paddingBottom: 16,
  },
  button: {
    marginTop: 8,
  },
});

export default UserManagementScreen; 