import { NavigatorScreenParams } from '@react-navigation/native';
import { AuthStackParamList as AuthParams, AppStackParamList as AppParams } from '../AppNavigator';

// Re-export types for convenience
export type AuthStackParamList = AuthParams;
export type AppStackParamList = {
  // Main screens
  Home: undefined;
  MainTabs: undefined;
  
  // Product-related screens
  ProductTypeSelection: undefined;
  Camera: undefined;
  NewProductReview: {
    ocrResults?: any[];
    ocrText?: string;
  };
  ExistingProductMatch: {
    ocrResults?: any[];
    ocrText?: string;
  };
  
  // Product viewing screens
  ProductList: {
    userId?: string;
  };
  ProductHistory: {
    userId?: string;
  };

  // User management screens
  UserManagement: undefined;
  ViewAllUsers: undefined;
  CreateUser: undefined;
  UpdateUser: { userId: string };
  ProfileScreen: { userId: string };
  MyAccount: undefined;

  // Additional screens
  SecuritySettings: undefined;
  ChangePassword: undefined;

  // New screens
  Dashboard: undefined;
  Inventory: undefined;
};
export type RootStackParamList = AuthStackParamList & AppStackParamList;

// Declare module augmentation for useNavigation hook
declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
} 