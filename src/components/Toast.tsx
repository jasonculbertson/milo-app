import React, { useEffect, useRef } from 'react';
import { Animated, Text, StyleSheet, ViewStyle } from 'react-native';
import * as Haptics from 'expo-haptics';
import { colors, spacing, borderRadius, shadows } from '../theme';

interface ToastProps {
  message: string;
  visible: boolean;
  type?: 'success' | 'error' | 'info';
  duration?: number;
  onHide?: () => void;
  onDismiss?: () => void; // Alias for onHide
}

export function Toast({
  message,
  visible,
  type = 'success',
  duration = 3000,
  onHide,
  onDismiss,
}: ToastProps) {
  const handleHide = onHide || onDismiss;
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    if (visible) {
      // Haptic feedback
      Haptics.notificationAsync(
        type === 'success'
          ? Haptics.NotificationFeedbackType.Success
          : type === 'error'
          ? Haptics.NotificationFeedbackType.Error
          : Haptics.NotificationFeedbackType.Warning
      );

      // Slide up animation
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto hide
      const timer = setTimeout(() => {
        Animated.parallel([
          Animated.timing(opacity, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(translateY, {
            toValue: 20,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start(() => {
          handleHide?.();
        });
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [visible, type, duration, handleHide, opacity, translateY]);

  if (!visible) return null;

  const backgroundColor =
    type === 'success'
      ? colors.success
      : type === 'error'
      ? colors.error
      : colors.info;

  const icon =
    type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ';

  return (
    <Animated.View
      style={[
        styles.toast,
        { backgroundColor, opacity, transform: [{ translateY }] },
      ]}
    >
      <Text style={styles.toastIcon}>{icon}</Text>
      <Text style={styles.toastText}>{message}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  toast: {
    position: 'absolute',
    bottom: 100,
    left: spacing.lg,
    right: spacing.lg,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    flexDirection: 'row',
    alignItems: 'center',
    ...shadows.lg,
  },
  
  toastIcon: {
    fontSize: 24,
    color: colors.white,
    marginRight: spacing.md,
  },
  
  toastText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
    flex: 1,
  },
});

