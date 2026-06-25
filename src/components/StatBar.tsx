import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { Typography, Spacing, BorderRadius } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';

interface StatBarProps {
  label: string;
  value: number;
  maxValue?: number;
  color?: string;
}

const STAT_ABBREVIATIONS: Record<string, string> = {
  hp: 'HP',
  attack: 'ATK',
  defense: 'DEF',
  'special-attack': 'SpA',
  'special-defense': 'SpD',
  speed: 'SPD',
};

function getStatColor(value: number): string {
  if (value >= 150) return '#00c853';
  if (value >= 100) return '#2ecc71';
  if (value >= 70) return '#f4d03f';
  if (value >= 50) return '#f39c12';
  return '#e74c3c';
}

export function StatBar({ label, value, maxValue = 255 }: StatBarProps) {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const progress = useSharedValue(0);
  const abbreviation = STAT_ABBREVIATIONS[label] ?? label.toUpperCase().slice(0, 3);
  const barColor = getStatColor(value);

  useEffect(() => {
    progress.value = withTiming(value / maxValue, {
      duration: 800,
      easing: Easing.out(Easing.cubic),
    });
  }, [value, maxValue, progress]);

  const animatedStyle = useAnimatedStyle(() => ({
    width: `${Math.min(progress.value * 100, 100)}%`,
  }));

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{abbreviation}</Text>
      <Text style={styles.value}>{value}</Text>
      <View style={styles.trackContainer}>
        <View style={styles.track}>
          <Animated.View
            style={[
              styles.fill,
              { backgroundColor: barColor },
              animatedStyle,
            ]}
          />
        </View>
      </View>
    </View>
  );
}

const getStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: Spacing.sm,
    },
    label: {
      color: colors.textSecondary,
      fontSize: Typography.sizes.sm,
      fontWeight: Typography.weights.semibold,
      width: 36,
    },
    value: {
      color: colors.textPrimary,
      fontSize: Typography.sizes.sm,
      fontWeight: Typography.weights.bold,
      width: 36,
      textAlign: 'right',
      marginRight: Spacing.md,
    },
    trackContainer: {
      flex: 1,
    },
    track: {
      height: 6,
      backgroundColor: colors.surfaceLight,
      borderRadius: BorderRadius.pill,
      overflow: 'hidden',
    },
    fill: {
      height: '100%',
      borderRadius: BorderRadius.pill,
    },
  });
