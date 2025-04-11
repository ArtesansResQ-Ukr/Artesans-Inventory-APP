import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';

/**
 * UserManagementScreen component
 * Placeholder for user management functionality
 */
const UserManagementScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>User Management</Text>
      <Text style={styles.subtitle}>
        This screen will allow administrators to manage users and permissions.
      </Text>
      <Text style={styles.comingSoon}>Coming Soon</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    maxWidth: 600,
  },
  comingSoon: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 24,
    opacity: 0.7,
  },
});

export default UserManagementScreen; 