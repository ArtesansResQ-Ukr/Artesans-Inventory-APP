import { configureStore } from '@reduxjs/toolkit';
import ocrReducer from './slices/ocrSlice';
import authReducer from './slices/authSlice';
// Import other reducers as needed

export const store = configureStore({
  reducer: {
    ocr: ocrReducer,
    auth: authReducer,
    // Add other reducers here
  }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 