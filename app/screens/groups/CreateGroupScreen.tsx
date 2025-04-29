import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Dimensions, Platform } from 'react-native';
import { Text, TextInput, Button, Snackbar } from 'react-native-paper';
import { createGroup } from '../../services/api/groupApi';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { UserManagementStackParamList } from '../../navigation/types/navigation';

type CreateGroupNavigationProp = StackNavigationProp<UserManagementStackParamList, 'CreateGroup'>;

const CreateGroupScreen = () => {
  const navigation = useNavigation<CreateGroupNavigationProp>();
  const [groupName, setGroupName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [snackbarVisible, setSnackbarVisible] = useState(false);

  const handleCreateGroup = async () => {
    if (!groupName.trim()) {
      setError('Group name is required');
      setSnackbarVisible(true);
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      const response = await createGroup(groupName);
      if (response.data) {
        setSuccess('Group created successfully');
        setSnackbarVisible(true);
        setGroupName('');
        
        // Navigate back after success and short delay
        setTimeout(() => {
          navigation.goBack();
        }, 1500);
      } else if (response.error) {
        setError(response.error.message);
        setSnackbarVisible(true);
      }
    } catch (error) {
      setError('Failed to create group. Please try again.');
      setSnackbarVisible(true);
      console.error('Error creating group:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDismissSnackbar = () => {
    setSnackbarVisible(false);
  };

  const handleClose = () => {
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <ScrollView style={styles.contentContainer}>
          <Text style={styles.title}>Create New Group</Text>
          
          <TextInput
            label="Group Name"
            value={groupName}
            onChangeText={setGroupName}
            style={styles.input}
            disabled={loading}
            placeholder="Enter group name"
          />
          
          <Button
            mode="contained"
            onPress={handleCreateGroup}
            style={styles.createButton}
            loading={loading}
            disabled={loading}
          >
            Create Group
          </Button>
          
          <Button
            mode="outlined"
            onPress={handleClose}
            style={styles.cancelButton}
            disabled={loading}
          >
            Cancel
          </Button>
          
          <Snackbar
            visible={snackbarVisible}
            onDismiss={handleDismissSnackbar}
            duration={3000}
            style={error ? styles.errorSnackbar : styles.successSnackbar}
          >
            {error || success}
          </Snackbar>
        </ScrollView>
      </View>
    </View>
  );
};

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  content: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 20,
    minHeight: 300,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.23,
    shadowRadius: 2.62,
    elevation: 4,
  },
  contentContainer: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    marginBottom: 20,
  },
  createButton: {
    marginBottom: 12,
    paddingVertical: 8,
  },
  cancelButton: {
    marginBottom: 8,
    paddingVertical: 8,
  },
  errorSnackbar: {
    backgroundColor: '#d32f2f',
  },
  successSnackbar: {
    backgroundColor: '#43a047',
  },
});

export default CreateGroupScreen; 