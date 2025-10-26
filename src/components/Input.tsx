import React, { useState } from 'react';
import { TextInput, View, Text, StyleSheet, TextInputProps } from 'react-native';
import { colors, spacing, borderRadius, typography } from '../theme';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
}

export function Input({ label, error, style, ...props }: InputProps) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      
      <TextInput
        style={[
          styles.input,
          isFocused && styles.inputFocused,
          error && styles.inputError,
          style,
        ]}
        placeholderTextColor={colors.gray300}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        {...props}
      />
      
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: spacing.sm,
  },
  
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.gray800,
    marginBottom: spacing.sm,
  },
  
  input: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.gray200,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    fontSize: 18,
    color: colors.gray800,
    minHeight: 56,
  },
  
  inputFocused: {
    borderColor: colors.primary,
    borderWidth: 2,
  },
  
  inputError: {
    borderColor: colors.error,
    borderWidth: 2,
  },
  
  errorText: {
    fontSize: 14,
    color: colors.error,
    marginTop: spacing.xs,
  },
});

