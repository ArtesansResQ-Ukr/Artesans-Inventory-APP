import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Dimensions, Platform } from 'react-native';
import { Text, TextInput, Button, Snackbar } from 'react-native-paper';
import { createGroup } from '../../services/api/groupApi';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { UserManagementStackParamList } from '../../navigation/types/navigation';
import BottomSheet from '@gorhom/bottom-sheet';

type CreateGroupNavigationProp = StackNavigationProp<UserManagementStackParamList, 'CreateGroup'>;

const CreateGroup = () => {
  const navigation = useNavigation<CreateGroupNavigationProp>();
  const [groupName, setGroupName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  
  // Reference to bottom sheet
  const bottomSheetRef = useRef<BottomSheet>(null);

  // Snap points for bottom sheet
  const snapPoints = ['60%', '90%'];

  useEffect(() => {
    // Open the bottom sheet when the component mounts
    bottomSheetRef.current?.snapToIndex(0);
  }, []);

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

  const renderContent = () => (
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
  );

  // For web, render a modal-like view instead of bottom sheet
  if (Platform.OS === 'web') {
    return (
      <View style={styles.webContainer}>
        <View style={styles.webContent}>
          {renderContent()}
        </View>
      </View>
    );
  }

  // For mobile, use bottom sheet
  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={0}
      snapPoints={snapPoints}
      enablePanDownToClose
      onClose={handleClose}
    >
      {renderContent()}
    </BottomSheet>
  );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  contentContainer: {
    padding: 16,
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
    marginBottom: 20,
    paddingVertical: 8,
  },
  errorSnackbar: {
    backgroundColor: '#d32f2f',
  },
  successSnackbar: {
    backgroundColor: '#43a047',
  },
  webContainer: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  webContent: {
    width: Math.min(width * 0.8, 500),
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 20,
    maxHeight: '80%',
    overflow: 'auto',
  },
});

export default CreateGroup; 