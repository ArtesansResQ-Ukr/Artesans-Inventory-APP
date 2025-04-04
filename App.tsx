import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider as PaperProvider } from 'react-native-paper';
import { Provider as ReduxProvider } from 'react-redux';
import { store } from './app/store';
import { AppNavigator } from './app/navigation/AppNavigator';
import { UserProvider } from './app/contexts/UserContext';



/**
 * Main App component
 * Sets up providers for Redux, Paper UI, and Safe Area
 */
export default function App() {
  return (
    <ReduxProvider store={store}>
      <PaperProvider>
        <UserProvider>
          <SafeAreaProvider>
            <AppNavigator />
          </SafeAreaProvider>
        </UserProvider>
      </PaperProvider>
    </ReduxProvider>
  );
} 