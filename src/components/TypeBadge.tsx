import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Typography, Spacing, BorderRadius, getTypeColor } from '@/constants/theme';

interface TypeBadgeProps {
  typeName: string;
  size?: 'sm' | 'md';
}

export function TypeBadge({ typeName, size = 'sm' }: TypeBadgeProps) {
  const color = getTypeColor(typeName);
  const isSmall = size === 'sm';

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: color + '30', // 30 = ~19% opacity
          borderColor: color + '60',
        },
        isSmall ? styles.badgeSm : styles.badgeMd,
      ]}
    >
      <Text
        style={[
          styles.text,
          { color },
          isSmall ? styles.textSm : styles.textMd,
        ]}
      >
        {typeName.toUpperCase()}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: BorderRadius.pill,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  badgeSm: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
  },
  badgeMd: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
  },
  text: {
    fontWeight: Typography.weights.bold,
    letterSpacing: 1,
  },
  textSm: {
    fontSize: Typography.sizes.xs,
  },
  textMd: {
    fontSize: Typography.sizes.sm,
  },
});
