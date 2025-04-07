import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { TextInput, Button, Text } from 'react-native-paper';
import { useUser } from '../../contexts/UserContext';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';


interface LoginScreenProps {
  navigation: NativeStackNavigationProp<any>;
}

export const LoginScreen = ({ navigation }: LoginScreenProps) => {
  const [tokenInput, setTokenInput] = useState('');
  const [error, setError] = useState('');
  const { setUserToken } = useUser();

  const handleLogin = async () => {
    try {
      if (!tokenInput.trim()) {
        setError('Please enter a token');
        return;
      }
      
      // Update token in context
      await setUserToken(tokenInput);
      
      // Navigation will happen automatically based on conditional rendering
      // in AppNavigator.tsx due to userToken being updated
    } catch (err) {
      setError('Failed to store token');
      console.error('Login error:', err);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View style={styles.container}>
          <Text variant="headlineMedium" style={styles.title}>Login</Text>
          <TextInput
            label="Enter JWT Token"
            value={tokenInput}
            onChangeText={setTokenInput}
            mode="outlined"
            style={styles.input}
            multiline
            numberOfLines={4}
          />
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <Button mode="contained" onPress={handleLogin} style={styles.button}>
            Login
          </Button>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    textAlign: 'center',
    marginBottom: 20,
  },
  input: {
    marginBottom: 10,
  },
  button: {
    marginTop: 10,
  },
  error: {
    color: 'red',
    marginBottom: 10,
  },
}); 