import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from 'react-native-paper';
import { Platform, View, Text, StyleSheet } from 'react-native';

// Import your main tab screens
import HomeScreen from '../screens/HomeScreen';
import ProductTypeSelection from '../screens/products/ProductTypeSelection';
import { MyAccountScreen } from '../screens/users/MyAccoutScreen';
import UserManagementScreen from '../screens/users/UserManagementScreen';

// Define tab navigator param list
export type TabNavigatorParamList = {
  Home: undefined;
  Inventory: undefined;
  UserManagement: undefined;
  MyAccount: undefined;
};

const Tab = createBottomTabNavigator<TabNavigatorParamList>();

/**
 * Main tab navigator for the authenticated app experience
 * Provides access to the primary sections of the app
 */
const TabNavigator = () => {
  const theme = useTheme();
  const isWeb = Platform.OS === 'web';
  
  // Custom tab bar button for web
  const CustomTabBarButton = ({ focused, label, icon }: { focused: boolean; label: string; icon: React.ReactNode }) => {
    if (!isWeb) return null;
    
    return (
      <View style={[
        styles.customTabButton,
        focused ? { backgroundColor: theme.colors.primaryContainer } : {}
      ]}>
        {icon}
        <Text style={[
          styles.customTabLabel,
          focused ? { color: theme.colors.primary } : { color: 'gray' }
        ]}>
          {label}
        </Text>
      </View>
    );
  };
  
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: string = '';
          
          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Inventory') {
            iconName = focused ? 'list' : 'list-outline';
          } else if (route.name === 'UserManagement') {
            iconName = focused ? 'people' : 'people-outline';
          } else if (route.name === 'MyAccount'){
            iconName = focused ? 'contact' : 'contact-outline';
          }
          
          return <Ionicons name={iconName as any} size={isWeb ? size * 1.2 : size} color={color} />;
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: 'gray',
        headerShown: true,
        tabBarStyle: {
          height: isWeb ? 60 : 70,
          paddingBottom: isWeb ? 10 : 20,
          paddingTop: isWeb ? 10 : 5,
          // Additional web-specific styles
          ...(isWeb && {
            borderTop: `1px solid ${theme.colors.outline}`,
            justifyContent: 'center',
            maxWidth: 1200,
            marginHorizontal: 'auto',
            width: '100%'
          }),
        },
        tabBarLabelStyle: {
          fontSize: isWeb ? 14 : 12,
          paddingBottom: isWeb ? 5 : 0,
        },
        // Use larger touch targets on web
        tabBarItemStyle: isWeb ? {
          paddingVertical: 8,
        } : undefined,
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen} 
        options={{
          title: 'Home',
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons name={focused ? 'home' : 'home-outline'} color={color} size={isWeb ? size * 1.2 : size} />
          ),
        }}
      />
      
      <Tab.Screen 
        name="Inventory" 
        component={ProductTypeSelection} 
        options={{
          title: 'Inventory',
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons name={focused ? 'list' : 'list-outline'} color={color} size={isWeb ? size * 1.2 : size} />
          ),
        }}
      />
      
      <Tab.Screen 
        name="UserManagement" 
        component={UserManagementScreen} 
        options={{
          title: 'Users',
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons name={focused ? 'people' : 'people-outline'} color={color} size={isWeb ? size * 1.2 : size} />
          ),
        }}
      />
      
      <Tab.Screen 
        name="MyAccount" 
        component={MyAccountScreen} 
        options={{
          title: 'My Account',
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons name={focused ? 'person' : 'person-outline'} color={color} size={isWeb ? size * 1.2 : size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  customTabButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  customTabLabel: {
    marginLeft: 8,
    fontWeight: '500',
  }
});

export default TabNavigator; 