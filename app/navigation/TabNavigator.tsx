import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from 'react-native-paper';
import { Platform, View, Text, StyleSheet } from 'react-native';
import { 
  TabNavigatorParamList, 
  HomeStackParamList, 
  InventoryStackParamList,
  UserManagementStackParamList,
  AccountStackParamList
} from './types/navigation';

// Import your main tab screens
import HomeScreen from '../screens/HomeScreen';
import ProductTypeSelection from '../screens/products/ProductTypeSelection';
import { MyAccountScreen } from '../screens/users/MyAccoutScreen';
import UserManagementScreen from '../screens/users/UserManagementScreen';
import ViewAllUsers from '../screens/users/ViewAllUsers';
import CreateUserScreen from '../screens/users/CreateUserScreen';
import UpdateUserScreen from '../screens/users/UpdateUserScreen';
import ProfileScreen from '../screens/users/ProfileScreen';
import SecuritySettingsScreen from '../screens/settings/SecuritySettingsScreen';
import CameraScreen from '../screens/camera/CameraScreen';
import NewProductReviewScreen from '../screens/products/NewProductReviewScreen';
import ExistingProductMatchScreen from '../screens/products/ExistingProductMatchScreen';
import ProductListScreen from '../screens/products/ProductListScreen';
import ProductHistoryScreen from '../screens/products/ProductHistoryScreen';
import ProductDetailScreen from '../screens/products/ProductDetailScreen';
import ViewAllGroupsScreen from '../screens/groups/ViewAllGroupsScreen';
import UpdateGroupScreen from '../screens/groups/UpdateGroupScreen';
import ChangePasswordScreen from '../screens/settings/ChangePasswordScreen';
import CreateGroupScreen from '../screens/groups/CreateGroupScreen';
import GroupSettingsScreen from '../screens/settings/GroupSettingsScreen';

// Create stack navigators for each tab
const HomeStack = createStackNavigator<HomeStackParamList>();
const InventoryStack = createStackNavigator<InventoryStackParamList>();
const UserManagementStack = createStackNavigator<UserManagementStackParamList>();
const AccountStack = createStackNavigator<AccountStackParamList>();

// Home Stack Screen
const HomeStackScreen = () => (
  <HomeStack.Navigator>
    <HomeStack.Screen 
      name="HomeScreen" 
      component={HomeScreen}
      options={{ headerShown: false }}
    />
    <HomeStack.Screen 
      name="SecuritySettings" 
      component={SecuritySettingsScreen}
      options={{ title: 'Security Settings' }}
    />
  </HomeStack.Navigator>
);

// Inventory Stack Screen
const InventoryStackScreen = () => (
  <InventoryStack.Navigator>
    <InventoryStack.Screen 
      name="ProductTypeSelection" 
      component={ProductTypeSelection}
      options={{ headerShown: false }}
    />
    <InventoryStack.Screen 
      name="Camera" 
      component={CameraScreen} 
      options={{ title: 'Scan Product' }}
    />
    <InventoryStack.Screen 
      name="NewProductReview" 
      component={NewProductReviewScreen}
      options={{ title: 'New Product' }}
    />
    <InventoryStack.Screen 
      name="ExistingProductMatch" 
      component={ExistingProductMatchScreen}
      options={{ title: 'Match Product' }}
    />
    <InventoryStack.Screen 
      name="ProductList" 
      component={ProductListScreen}
      options={{ title: 'Product Inventory' }}
    />
    <InventoryStack.Screen 
      name="ProductHistory" 
      component={ProductHistoryScreen}
      options={{ title: 'Product History' }}
    />
    <InventoryStack.Screen 
      name="ProductDetail" 
      component={ProductDetailScreen}
      options={{ title: 'Product Details' }}
    />
  </InventoryStack.Navigator>
);

// User Management Stack Screen
const UserManagementStackScreen = () => (
  <UserManagementStack.Navigator>
    <UserManagementStack.Screen 
      name="UserManagementScreen" 
      component={UserManagementScreen}
      options={{ headerShown: false }}
    />
    <UserManagementStack.Screen 
      name="ViewAllUsers" 
      component={ViewAllUsers}
      options={{ title: 'All Users' }}
    />
    <UserManagementStack.Screen 
      name="CreateUser" 
      component={CreateUserScreen}
      options={{ title: 'Create User' }}
    />
    <UserManagementStack.Screen 
      name="UpdateUser" 
      component={UpdateUserScreen}
      options={{ title: 'Update User' }}
    />
    <UserManagementStack.Screen 
      name="ProfileScreen" 
      component={ProfileScreen}
      options={{ title: 'User Profile' }}
    />
    <UserManagementStack.Screen 
      name="ViewAllGroups" 
      component={ViewAllGroupsScreen}
      options={{ title: 'All Groups' }}
    />
    <UserManagementStack.Screen 
      name="CreateGroup" 
      component={CreateGroupScreen}
      options={{ 
        title: 'Create Group',
        headerShown: true,
        presentation: 'modal'
      }}
    />
    <UserManagementStack.Screen 
      name="UpdateGroup" 
      component={UpdateGroupScreen}
      options={{ title: 'Update Group' }}
    />
  </UserManagementStack.Navigator>
);

// Account Stack Screen
const AccountStackScreen = () => (
  <AccountStack.Navigator>
    <AccountStack.Screen 
      name="MyAccountScreen" 
      component={MyAccountScreen}
      options={{ headerShown: false }}
    />
    <AccountStack.Screen 
      name="SecuritySettings" 
      component={SecuritySettingsScreen}
      options={{ title: 'Security Settings' }}
    />
    <AccountStack.Screen 
      name="ChangePassword" 
      component={ChangePasswordScreen}
      options={{ title: 'Change Password' }}
    />
    <AccountStack.Screen 
      name="GroupSettings" 
      component={GroupSettingsScreen}
      options={{ title: 'Group Settings' }}
    />
  </AccountStack.Navigator>
);

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
      initialRouteName="Home"
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
            iconName = focused ? 'person' : 'person-outline';
          }
          
          return <Ionicons name={iconName as any} size={isWeb ? size * 1.2 : size} color={color} />;
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
        tabBarStyle: {
          height: isWeb ? 60 : 70,
          paddingBottom: isWeb ? 10 : 20,
          paddingTop: isWeb ? 10 : 5,
          marginBottom: isWeb ? 10 : 10,
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
        component={HomeStackScreen} 
        options={{
          title: 'Home',
        }}
      />
      
      <Tab.Screen 
        name="Inventory" 
        component={InventoryStackScreen} 
        options={{
          title: 'Inventory',
        }}
      />
      
      <Tab.Screen 
        name="UserManagement" 
        component={UserManagementStackScreen} 
        options={{
          title: 'Users',
        }}
      />
      
      <Tab.Screen 
        name="MyAccount" 
        component={AccountStackScreen} 
        options={{
          title: 'My Account',
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