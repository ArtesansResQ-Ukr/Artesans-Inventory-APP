import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { jwtDecode } from 'jwt-decode';
import { API_URL } from '@env';


// Define JWT payload interface
interface JWTPayload {
  exp: number;
  uuid: string;
  email: string;
  username: string;
  permissions: string[];
  group_uuid: string;
}

// Interface for auth state
interface AuthState {
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  user: {
    uuid: string | null;
    email: string | null;
    username: string | null;
    permissions: string[] | null;
    group_uuid: string | null;
  };
}

// Initial auth state
const initialState: AuthState = {
  token: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
  user: {
    uuid: null,
    email: null,
    username: null,
    permissions: [],
    group_uuid: null
  }
};

// Helper functions for token management
const storeToken = async (token: string) => {
  try {
    if (Platform.OS === 'web') {
      await AsyncStorage.setItem('userToken', token);
    } else {
      await SecureStore.setItemAsync('userToken', token);
    }
    return true;
  } catch (error) {
    console.error('Error storing token:', error);
    return false;
  }
};

const getToken = async (): Promise<string | null> => {
  try {
    if (Platform.OS === 'web') {
      return await AsyncStorage.getItem('userToken');
    } else {
      return await SecureStore.getItemAsync('userToken');
    }
  } catch (error) {
    console.error('Error retrieving token:', error);
    return null;
  }
};

const removeToken = async (): Promise<boolean> => {
  try {
    if (Platform.OS === 'web') {
      await AsyncStorage.removeItem('userToken');
    } else {
      await SecureStore.deleteItemAsync('userToken');
    }
    return true;
  } catch (error) {
    console.error('Error removing token:', error);
    return false;
  }
};

// Async thunks for auth actions
export const initializeAuth = createAsyncThunk(
  'auth/initialize',
  async (_, { rejectWithValue }) => {
    try {
      const token = await getToken();
      
      if (!token) {
        return null;
      }
      
      try {
        const decoded = jwtDecode<JWTPayload>(token);
        const currentTime = Math.floor(Date.now() / 1000);
        
        if (decoded.exp < currentTime) {
          await removeToken();
          return null;
        }
        
        return { token, user: decoded };
      } catch (error) {
        console.error('Error decoding token:', error);
        await removeToken();
        return null;
      }
    } catch (error) {
      return rejectWithValue('Failed to initialize auth');
    }
  }
);

export const login = createAsyncThunk(
  'auth/login',
  async ({ email, password }: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_URL}/auth/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          username: email, // API expects username but we're using email
          password,
        }).toString(),
      });

      if (!response.ok) {
        return rejectWithValue('Invalid credentials');
      }

      const data = await response.json();
      const token = data.access_token;
      
      // Store the token
      await storeToken(token);
      
      // Decode token to get user info
      const decoded = jwtDecode<JWTPayload>(token);
      
      return { token, user: decoded };
    } catch (error) {
      return rejectWithValue('Login failed');
    }
  }
);

export const logout = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await removeToken();
      return true;
    } catch (error) {
      return rejectWithValue('Logout failed');
    }
  }
);

export const forgotPassword = createAsyncThunk(
  'auth/forgotPassword',
  async (email: string, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        return rejectWithValue('Failed to send password reset email');
      }

      return true;
    } catch (error) {
      return rejectWithValue('Request failed');
    }
  }
);

export const resetPassword = createAsyncThunk(
  'auth/resetPassword',
  async ({ token, newPassword }: { token: string; newPassword: string }, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_URL}/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, password: newPassword }),
      });

      if (!response.ok) {
        return rejectWithValue('Failed to reset password');
      }

      return true;
    } catch (error) {
      return rejectWithValue('Request failed');
    }
  }
);

// Create the auth slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    // Add a sync version of initialize and logout for use by AuthContext
    setAuthenticated: (state, action: PayloadAction<{token: string, user: {
      uuid: string;
      email: string;
      username: string;
      permissions: string[];
      group_uuid: string;
    }}>) => {
      state.token = action.payload.token;
      state.isAuthenticated = true;
      state.user = {
        uuid: action.payload.user.uuid,
        email: action.payload.user.email,
        username: action.payload.user.username,
        permissions: action.payload.user.permissions,
        group_uuid: action.payload.user.group_uuid
      };
      state.isLoading = false;
    },
    setUnauthenticated: (state) => {
      state.token = null;
      state.isAuthenticated = false;
      state.user = { 
        uuid: null, 
        email: null, 
        username: null,
        permissions: [],
        group_uuid: null
      };
      state.isLoading = false;
    }
  },
  extraReducers: (builder) => {
    builder
      // Initialize auth
      .addCase(initializeAuth.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(initializeAuth.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload) {
          state.token = action.payload.token;
          state.isAuthenticated = true;
          state.user = {
            uuid: action.payload.user.uuid,
            email: action.payload.user.email,
            username: action.payload.user.username,
            permissions: action.payload.user.permissions,
            group_uuid: action.payload.user.group_uuid
          };
        } else {
          state.token = null;
          state.isAuthenticated = false;
          state.user = { 
            uuid: null, 
            email: null, 
            username: null,
            permissions: [],
            group_uuid: null
          };
        }
      })
      .addCase(initializeAuth.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.token = null;
        state.isAuthenticated = false;
        state.user = { 
          uuid: null, 
          email: null, 
          username: null,
          permissions: [],
          group_uuid: null
        };
      })
      
      // Login
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.user = {
          uuid: action.payload.user.uuid,
          email: action.payload.user.email,
          username: action.payload.user.username,
          permissions: action.payload.user.permissions,
          group_uuid: action.payload.user.group_uuid
        };
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Logout
      .addCase(logout.fulfilled, (state) => {
        state.token = null;
        state.isAuthenticated = false;
        state.user = { 
          uuid: null, 
          email: null, 
          username: null,
          permissions: [],
          group_uuid: null
        };
      })
      
      // Forgot password (no state changes needed except error handling)
      .addCase(forgotPassword.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(forgotPassword.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Reset password (no state changes needed except error handling)
      .addCase(resetPassword.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(resetPassword.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  }
});

export const { clearError, setAuthenticated, setUnauthenticated } = authSlice.actions;

export default authSlice.reducer; 