import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Typography, Spacing, BorderRadius } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';

interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  const { colors } = useTheme();
  const styles = getStyles(colors);

  return (
    <View style={styles.container}>
      {/* Pokéball icon using text */}
      <View style={styles.iconContainer}>
        <Text style={styles.icon}>💥</Text>
      </View>
      <Text style={styles.title}>Oops! Something went wrong</Text>
      <Text style={styles.message}>{message}</Text>
      {onRetry && (
        <TouchableOpacity
          style={styles.retryButton}
          onPress={onRetry}
          activeOpacity={0.7}
        >
          <Text style={styles.retryText}>Try Again</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

interface EmptyStateProps {
  title: string;
  subtitle?: string;
  icon?: string;
}

export function EmptyState({
  title,
  subtitle,
  icon = '🔍',
}: EmptyStateProps) {
  const { colors } = useTheme();
  const styles = getStyles(colors);

  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Text style={styles.icon}>{icon}</Text>
      </View>
      <Text style={styles.title}>{title}</Text>
      {subtitle && <Text style={styles.message}>{subtitle}</Text>}
    </View>
  );
}

const getStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: Spacing.xxl,
      minHeight: 300,
    },
    iconContainer: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: colors.surface,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: Spacing.lg,
    },
    icon: {
      fontSize: 36,
    },
    title: {
      color: colors.textPrimary,
      fontSize: Typography.sizes.lg,
      fontWeight: Typography.weights.bold,
      textAlign: 'center',
      marginBottom: Spacing.sm,
    },
    message: {
      color: colors.textSecondary,
      fontSize: Typography.sizes.md,
      textAlign: 'center',
      lineHeight: 22,
      marginBottom: Spacing.xl,
    },
    retryButton: {
      backgroundColor: colors.primary,
      paddingHorizontal: Spacing.xl,
      paddingVertical: Spacing.md,
      borderRadius: BorderRadius.md,
    },
    retryText: {
      color: '#ffffff', // High contrast white text over primary red background
      fontSize: Typography.sizes.base,
      fontWeight: Typography.weights.bold,
    },
  });
