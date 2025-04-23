import React from 'react';
import { ActivityIndicator, View, StyleSheet, Platform } from 'react-native';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { useTheme } from 'react-native-paper';
import { useAuth } from '../contexts/AuthContext';
import AppNavigator, { AuthNavigator } from './AppNavigator';

/**
 * Navigation wrapper that uses AuthContext for auth state
 */
const AppNavigatorWrapper = () => {
  const { isLoading, isAuthenticated } = useAuth();
  const isWeb = Platform.OS === 'web';
  const theme = useTheme();

  if (isLoading) {
    return (
      <View style={[
        styles.loadingContainer,
        { backgroundColor: theme.colors.background }
      ]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  // Create navigation theme based on paper theme
  const navigationTheme = {
    ...DefaultTheme,
    dark: theme.dark,
    colors: {
      ...DefaultTheme.colors,
      primary: theme.colors.primary,
      background: theme.colors.background,
      card: theme.colors.surface,
      text: theme.colors.onSurface,
      border: theme.colors.outline,
      notification: theme.colors.error,
    }
  };

  return (
    <NavigationContainer theme={navigationTheme}>
      <View style={isWeb ? styles.webRootContainer : styles.mobileRootContainer}>
        {isAuthenticated ? <AppNavigator /> : <AuthNavigator />}
      </View>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  webRootContainer: {
    flex: 1,
    width: '100%',
  },
  mobileRootContainer: {
    flex: 1,
  },
});

export default AppNavigatorWrapper; 