import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Button, Card, Divider } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { UserManagementStackParamList } from '../../navigation/types/navigation';
import { colors, textColors } from '../../theme';
import { Ionicons } from '@expo/vector-icons';

/**
 * UserManagementScreen component
 * Screen for user management functionality
 */
const UserManagementScreen = () => {
  const navigation = useNavigation<StackNavigationProp<UserManagementStackParamList>>();

  return (
    <ScrollView style={styles.scrollContainer}>
      <View style={styles.container}>
        <Text style={styles.title}>User Management</Text>
        
        <Card style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="people-outline" size={24} color={colors.white} />
            <Text style={styles.cardHeaderText}>Users</Text>
          </View>
          <Card.Content style={styles.cardContent}>
            <Text style={styles.cardDescription}>
              View all users, create new users, or manage existing user accounts.
            </Text>
          </Card.Content>
          <Card.Actions style={styles.cardActions}>
            <Button 
              mode="contained" 
              onPress={() => navigation.navigate('ViewAllUsers')}
              style={styles.button}
              buttonColor={colors.primary}
            >
              Manage Users
            </Button>
          </Card.Actions>
        </Card>

        <Card style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="people" size={24} color={colors.white} />
            <Text style={styles.cardHeaderText}>Groups</Text>
          </View>
          <Card.Content style={styles.cardContent}>
            <Text style={styles.cardDescription}>
              Manage user groups and permissions within the organization.
            </Text>
          </Card.Content>
          <Card.Actions style={styles.cardActions}>
            <Button 
              mode="contained" 
              onPress={() => navigation.navigate('ViewAllGroups')}
              style={styles.button}
              buttonColor={colors.primary}
            >
              Manage Groups
            </Button>
          </Card.Actions>
        </Card>

        <Card style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="shield-outline" size={24} color={colors.white} />
            <Text style={styles.cardHeaderText}>Roles</Text>
          </View>
          <Card.Content style={styles.cardContent}>
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
    backgroundColor: colors.background,
    marginTop: 50,
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
    color: colors.primary,
  },
  card: {
    width: '100%',
    marginBottom: 16,
    elevation: 2,
    maxWidth: 600,
    borderRadius: 10,
    overflow: 'hidden',
  },
  cardHeader: {
    backgroundColor: colors.primary,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardHeaderText: {
    color: colors.white,
    fontWeight: 'bold',
    fontSize: 18,
    marginLeft: 10,
  },
  cardContent: {
    padding: 16,
    backgroundColor: colors.white,
  },
  cardDescription: {
    marginBottom: 8,
    color: textColors.primary,
  },
  cardActions: {
    justifyContent: 'flex-end',
    paddingRight: 16,
    paddingBottom: 16,
    backgroundColor: colors.white,
  },
  button: {
    marginTop: 8,
    borderRadius: 8,
  },
});

export default UserManagementScreen; 