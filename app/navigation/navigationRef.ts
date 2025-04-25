import { createNavigationContainerRef } from '@react-navigation/native';
import { RootStackParamList } from './types/navigation';

// Create a navigation ref that can be used outside of React components
export const navigationRef = createNavigationContainerRef<RootStackParamList>(); 