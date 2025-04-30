import { DefaultTheme } from 'react-native-paper';
import { colors, colorVariations, textColors } from './colors';

export const theme = {
  ...DefaultTheme,
  // Override React Native Paper theme
  colors: {
    ...DefaultTheme.colors,
    primary: colors.primary,
    accent: colors.secondary,
    background: colors.background,
    surface: colors.white,
    text: textColors.primary,
    error: colors.error,
    placeholder: textColors.secondary,
    backdrop: 'rgba(0, 0, 0, 0.5)',
    notification: colors.secondary,
  },
  // Custom theme properties
  card: {
    backgroundColor: colors.white,
    borderRadius: 8,
    elevation: 2,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    marginVertical: 8,
    padding: 16,
  },
  button: {
    primary: {
      backgroundColor: colors.primary,
      textColor: colors.white,
    },
    secondary: {
      backgroundColor: colors.secondary,
      textColor: colors.white,
    },
    outlined: {
      backgroundColor: 'transparent',
      borderColor: colors.primary,
      borderWidth: 1,
      textColor: colors.primary,
    },
    disabled: {
      backgroundColor: colorVariations.backgroundDarker,
      textColor: textColors.disabled,
    },
  },
  input: {
    backgroundColor: colors.white,
    borderColor: colorVariations.backgroundDarker,
    textColor: textColors.primary,
    placeholderColor: textColors.secondary,
  },
  header: {
    backgroundColor: colors.primary,
    textColor: colors.white,
  },
  statusColors: {
    success: colors.success,
    warning: colors.warning,
    error: colors.error,
    info: colors.info,
  },
  typography: {
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      color: textColors.primary,
    },
    subtitle: {
      fontSize: 18,
      fontWeight: '600',
      color: textColors.primary,
    },
    body: {
      fontSize: 16,
      color: textColors.primary,
    },
    caption: {
      fontSize: 14,
      color: textColors.secondary,
    },
    small: {
      fontSize: 12,
      color: textColors.secondary,
    },
  },
  divider: {
    backgroundColor: colorVariations.backgroundDarker,
    height: 1,
    marginVertical: 8,
  },
};

export default theme; 