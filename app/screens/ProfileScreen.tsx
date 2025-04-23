import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Button, Avatar, Card, Divider } from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { logout } from '../store/slices/authSlice';

const ProfileScreen = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Avatar.Text 
          size={80} 
          label={user?.username?.substring(0, 2).toUpperCase() || 'U'} 
          style={styles.avatar}
        />
        <Text style={styles.name}>{user?.username || 'User'}</Text>
        <Text style={styles.email}>{user?.email || 'No email provided'}</Text>
      </View>

      <Card style={styles.section}>
        <Card.Title title="Account Information" />
        <Card.Content>
          <Text style={styles.label}>User ID:</Text>
          <Text style={styles.value}>{user?.uuid || 'Unknown'}</Text>
          
          <Divider style={styles.divider} />
          
          <Text style={styles.label}>Username:</Text>
          <Text style={styles.value}>{user?.username || 'Not set'}</Text>
          
          <Divider style={styles.divider} />
          
          <Text style={styles.label}>Email:</Text>
          <Text style={styles.value}>{user?.email || 'Not set'}</Text>
        </Card.Content>
      </Card>

      <Card style={styles.section}>
        <Card.Title title="App Settings" />
        <Card.Content>
          <Button 
            mode="outlined" 
            onPress={() => {}}
            style={styles.settingButton}
          >
            Notification Preferences
          </Button>
          
          <Button 
            mode="outlined" 
            onPress={() => {}}
            style={styles.settingButton}
          >
            Display Settings
          </Button>
        </Card.Content>
      </Card>

      <Button 
        mode="contained" 
        onPress={handleLogout}
        style={styles.logoutButton}
        buttonColor="#ff6b6b"
      >
        Log Out
      </Button>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatar: {
    marginBottom: 12,
    backgroundColor: '#3498db',
  },
  name: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  email: {
    fontSize: 16,
    color: '#666',
  },
  section: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  value: {
    fontSize: 16,
    marginBottom: 8,
  },
  divider: {
    marginVertical: 12,
  },
  settingButton: {
    marginBottom: 8,
  },
  logoutButton: {
    marginTop: 24,
  },
});

export default ProfileScreen; 