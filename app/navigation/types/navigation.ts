import { NavigatorScreenParams } from '@react-navigation/native';

// Define the types for each stack navigator
export type HomeStackParamList = {
  HomeScreen: undefined;
  SecuritySettings: undefined;
};

export type InventoryStackParamList = {
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
  ProductList: {
    userId?: string;
  };
  ProductHistory: {
    userId?: string;
  };
  ProductDetail: {
    productUuid: string;
    userUuid?: string;
  };
  ProductHistoryDetail: {
    productUuid: string;
  };
};

export type UserManagementStackParamList = {
  UserManagementScreen: undefined;
  ViewAllUsers: undefined;
  CreateUser: undefined;
  UpdateUser: { 
    userId: string 
  };
  ProfileScreen: { 
    userId: string 
  };
  ViewAllGroups: undefined;
  CreateGroup: undefined;
  UpdateGroup: {
    groupId: string;
    groupName: string;
  };
};

export type AccountStackParamList = {
  MyAccountScreen: undefined;
  SecuritySettings: undefined;
  ChangePassword: undefined;
  GroupSettings: undefined;
};

// Define the TabNavigator types using NavigatorScreenParams to support nested navigation
export type TabNavigatorParamList = {
  Home: NavigatorScreenParams<HomeStackParamList>;
  Inventory: NavigatorScreenParams<InventoryStackParamList>;
  UserManagement: NavigatorScreenParams<UserManagementStackParamList>;
  MyAccount: NavigatorScreenParams<AccountStackParamList>;
};

// Define the main app navigator types
export type RootStackParamList = {
  MainTabs: NavigatorScreenParams<TabNavigatorParamList>;
  // Add any other root-level screens here that aren't in tabs
};

// Auth stack types
export type AuthStackParamList = {
  Login: undefined;
  OTPLogin: undefined;
  BiometricAuth: undefined;
  ForgotPassword: undefined;
};

// Declare module augmentation for useNavigation hook
declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
} 