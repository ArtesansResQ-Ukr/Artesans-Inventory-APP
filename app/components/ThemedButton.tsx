import React from 'react';
import { 
  TouchableOpacity, 
  Text, 
  StyleSheet, 
  ActivityIndicator,
  ViewStyle,
  TextStyle 
} from 'react-native';
import { colors, textColors } from '../theme';

type ButtonType = 'primary' | 'secondary' | 'outline' | 'danger';

interface ThemedButtonProps {
  title: string;
  onPress: () => void;
  type?: ButtonType;
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

const ThemedButton: React.FC<ThemedButtonProps> = ({
  title,
  onPress,
  type = 'primary',
  loading = false,
  disabled = false,
  icon,
  style,
  textStyle
}) => {
  const getButtonStyle = () => {
    switch (type) {
      case 'primary':
        return disabled ? styles.primaryDisabled : styles.primary;
      case 'secondary':
        return disabled ? styles.secondaryDisabled : styles.secondary;
      case 'outline':
        return disabled ? styles.outlineDisabled : styles.outline;
      case 'danger':
        return disabled ? styles.dangerDisabled : styles.danger;
      default:
        return styles.primary;
    }
  };
  
  const getTextStyle = () => {
    switch (type) {
      case 'primary':
      case 'secondary':
      case 'danger':
        return styles.lightText;
      case 'outline':
        return disabled ? styles.disabledText : styles.darkText;
      default:
        return styles.lightText;
    }
  };
  
  return (
    <TouchableOpacity
      style={[styles.button, getButtonStyle(), style]}
      onPress={onPress}
      disabled={disabled || loading}
    >
      {loading ? (
        <ActivityIndicator 
          color={type === 'outline' ? colors.primary : colors.white} 
          size="small"
        />
      ) : (
        <>
          {icon}
          <Text style={[getTextStyle(), textStyle]}>{title}</Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 8,
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    marginVertical: 8,
  },
  primary: {
    backgroundColor: colors.primary,
  },
  primaryDisabled: {
    backgroundColor: colors.primary + '80', // 50% opacity
  },
  secondary: {
    backgroundColor: colors.secondary,
  },
  secondaryDisabled: {
    backgroundColor: colors.secondary + '80', 
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.primary,
  },
  outlineDisabled: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.primary + '80',
  },
  danger: {
    backgroundColor: colors.error,
  },
  dangerDisabled: {
    backgroundColor: colors.error + '80',
  },
  lightText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  darkText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: 'bold',
  },
  disabledText: {
    color: textColors.disabled,
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ThemedButton; 