import { NavigatorScreenParams } from '@react-navigation/native';
import { AuthStackParamList as AuthParams, AppStackParamList as AppParams } from '../AppNavigator';

// Re-export types for convenience
export type AuthStackParamList = AuthParams;
export type AppStackParamList = AppParams;
export type RootStackParamList = AuthStackParamList & AppStackParamList;

// Declare module augmentation for useNavigation hook
declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
} 