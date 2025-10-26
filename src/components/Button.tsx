import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { colors, spacing, borderRadius, shadows, typography } from '../theme';

interface ButtonProps {
  onPress: () => void;
  children: string;
  disabled?: boolean;
  loading?: boolean;
  variant?: 'primary' | 'secondary' | 'outline';
  style?: ViewStyle;
}

export function PrimaryButton({
  onPress,
  children,
  disabled = false,
  loading = false,
  style,
}: ButtonProps) {
  return (
    <TouchableOpacity
      style={[
        styles.primaryButton,
        disabled && styles.primaryButtonDisabled,
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator color={colors.white} size="small" />
      ) : (
        <Text style={styles.primaryButtonText}>{children}</Text>
      )}
    </TouchableOpacity>
  );
}

export function SecondaryButton({
  onPress,
  children,
  disabled = false,
  loading = false,
  style,
}: ButtonProps) {
  return (
    <TouchableOpacity
      style={[
        styles.secondaryButton,
        disabled && styles.secondaryButtonDisabled,
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator color={colors.gray800} size="small" />
      ) : (
        <Text style={styles.secondaryButtonText}>{children}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  primaryButton: {
    backgroundColor: colors.primary,
    paddingVertical: 20,
    paddingHorizontal: 32,
    borderRadius: borderRadius.md,
    minHeight: 56,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.md,
  },
  
  primaryButtonText: {
    color: colors.white,
    ...typography.button,
  },
  
  primaryButtonDisabled: {
    backgroundColor: colors.gray200,
    shadowOpacity: 0,
    elevation: 0,
  },
  
  secondaryButton: {
    backgroundColor: 'transparent',
    paddingVertical: 20,
    paddingHorizontal: 32,
    borderRadius: borderRadius.md,
    borderWidth: 1.5,
    borderColor: colors.gray800,
    minHeight: 56,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  secondaryButtonText: {
    color: colors.gray800,
    ...typography.button,
  },
  
  secondaryButtonDisabled: {
    borderColor: colors.gray200,
    opacity: 0.5,
  },
});

