import React from 'react';
import { Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useTheme } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';

// Import screens
import HomeScreen from '../screens/home/HomeScreen';
import UserManagementScreen from '../screens/users/UserManagementScreen';
import ProductTypeSelection from '../screens/products/ProductTypeSelection';
import { MyAccountScreen } from '../screens/users/MyAccoutScreen';

const Tab = createBottomTabNavigator();

/**
 * TabNavigator component
 * Provides bottom tab navigation for the app
 * Adjusts layout for web and mobile platforms
 */
const TabNavigator = () => {
  const theme = useTheme();
  const isWeb = Platform.OS === 'web';
  
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: 'gray',
        headerShown: true,
        tabBarStyle: {
          height: 60,
          paddingBottom: 10,
          paddingTop: 5,
        },
        tabBarLabelStyle: {
          fontSize: 12,
        },
      }}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen} 
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="home" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen 
        name="Inventory" 
        component={ProductTypeSelection} 
        options={{
          title: 'Inventory',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="inventory" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen 
        name="UserManagement" 
        component={UserManagementScreen} 
        options={{
          title: 'Users',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="people" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen 
        name="MyAccount" 
        component={MyAccountScreen} 
        options={{
          title: 'My Account',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="person" color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default TabNavigator; 