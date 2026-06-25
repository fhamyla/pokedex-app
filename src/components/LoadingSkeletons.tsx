import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  interpolate,
} from 'react-native-reanimated';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = (SCREEN_WIDTH - Spacing.base * 3) / 2;

function SkeletonCard() {
  const shimmer = useSharedValue(0);

  useEffect(() => {
    shimmer.value = withRepeat(withTiming(1, { duration: 1200 }), -1, true);
  }, [shimmer]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(shimmer.value, [0, 1], [0.3, 0.7]),
  }));

  return (
    <View style={styles.card}>
      <Animated.View style={[styles.imagePlaceholder, animatedStyle]} />
      <Animated.View style={[styles.textPlaceholder, animatedStyle]} />
      <Animated.View style={[styles.badgePlaceholder, animatedStyle]} />
    </View>
  );
}

export function LoadingSkeletons({ count = 6 }: { count?: number }) {
  return (
    <View style={styles.grid}>
      {Array.from({ length: count }, (_, i) => (
        <SkeletonCard key={i} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.base,
  },
  card: {
    width: CARD_WIDTH,
    height: 190,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.base,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imagePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.surfaceLight,
    marginBottom: Spacing.md,
  },
  textPlaceholder: {
    width: '70%',
    height: 14,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.surfaceLight,
    marginBottom: Spacing.sm,
  },
  badgePlaceholder: {
    width: '50%',
    height: 10,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.surfaceLight,
  },
});
