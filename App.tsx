import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider as ReduxProvider } from 'react-redux';
import { store } from './app/store';
import { Provider as PaperProvider } from 'react-native-paper';
import { UserProvider } from './app/contexts/UserContext';
import { AuthProvider } from './app/contexts/AuthContext';

import AppNavigatorWrapper from './app/navigation/AppNavigatorWrapper';

/**
 * Main App component
 * Sets up providers for Redux, Paper UI, and Safe Area
 */
export default function App() {
  return (
    <ReduxProvider store={store}>
      <PaperProvider>
        <AuthProvider>
          <UserProvider>
            <SafeAreaProvider>
              <AppNavigatorWrapper />
            </SafeAreaProvider>
          </UserProvider>
        </AuthProvider>
      </PaperProvider>
    </ReduxProvider>
  );
} 