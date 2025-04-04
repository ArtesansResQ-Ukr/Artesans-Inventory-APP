import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput, Button, Text } from 'react-native-paper';
import { storeToken } from '../../services/auth/tokenService';

interface LoginScreenProps {
  navigation: any;
}

export const LoginScreen = ({ navigation }: LoginScreenProps) => {
  const [token, setToken] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async () => {
    try {
      if (!token.trim()) {
        setError('Please enter a token');
        return;
      }
      await storeToken(token);
      navigation.replace('Home'); // or whatever your main screen is named
    } catch (err) {
      setError('Failed to store token');
      console.error('Login error:', err);
    }
  };

  return (
    <View style={styles.container}>
      <Text variant="headlineMedium" style={styles.title}>Login</Text>
      <TextInput
        label="Enter JWT Token"
        value={token}
        onChangeText={setToken}
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