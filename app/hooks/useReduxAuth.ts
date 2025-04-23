import { useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import {
  initializeAuth,
  login,
  logout,
  forgotPassword,
  resetPassword,
  clearError
} from '../store/slices/authSlice';

export const useAuth = () => {
  const dispatch = useDispatch<AppDispatch>();
  const auth = useSelector((state: RootState) => state.auth);

  // Initialize auth state on component mount
  useEffect(() => {
    dispatch(initializeAuth());
  }, [dispatch]);

  // Login function
  const handleLogin = useCallback(
    async (email: string, password: string) => {
      const resultAction = await dispatch(login({ email, password }));
      return !resultAction.rejected;
    },
    [dispatch]
  );

  // Logout function
  const handleLogout = useCallback(async () => {
    await dispatch(logout());
  }, [dispatch]);

  // Forgot password function
  const handleForgotPassword = useCallback(
    async (email: string) => {
      const resultAction = await dispatch(forgotPassword(email));
      return !resultAction.rejected;
    },
    [dispatch]
  );

  // Reset password function
  const handleResetPassword = useCallback(
    async (token: string, newPassword: string) => {
      const resultAction = await dispatch(resetPassword({ token, newPassword }));
      return !resultAction.rejected;
    },
    [dispatch]
  );

  // Clear error function
  const handleClearError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  return {
    isLoading: auth.isLoading,
    isAuthenticated: auth.isAuthenticated,
    token: auth.token,
    user: auth.user,
    error: auth.error,
    login: handleLogin,
    logout: handleLogout,
    forgotPassword: handleForgotPassword,
    resetPassword: handleResetPassword,
    clearError: handleClearError
  };
};

export default useAuth; 