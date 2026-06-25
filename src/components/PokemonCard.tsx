import React from 'react';
import { View, Text, StyleSheet, Pressable, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { TypeBadge } from './TypeBadge';
import {
  Colors,
  Typography,
  Spacing,
  BorderRadius,
  getTypeColor,
  formatPokedexNumber,
  capitalize,
} from '@/constants/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = (SCREEN_WIDTH - Spacing.base * 3) / 2;

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface PokemonCardProps {
  id: number;
  name: string;
  sprite: string | null;
  types: string[];
}

export function PokemonCard({ id, name, sprite, types }: PokemonCardProps) {
  const router = useRouter();
  const scale = useSharedValue(1);
  const primaryType = types[0] ?? 'normal';
  const typeColor = getTypeColor(primaryType);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.95, { damping: 15, stiffness: 200 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 200 });
  };

  const handlePress = () => {
    router.push(`/pokemon/${id}`);
  };

  return (
    <AnimatedPressable
      style={[styles.card, animatedStyle]}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handlePress}
    >
      {/* Accent glow */}
      <View
        style={[
          styles.accentGlow,
          { backgroundColor: typeColor + '15' },
        ]}
      />

      {/* Pokédex number */}
      <Text style={[styles.pokedexNumber, { color: typeColor + '50' }]}>
        {formatPokedexNumber(id)}
      </Text>

      {/* Sprite */}
      <View style={styles.spriteContainer}>
        {sprite ? (
          <Image
            source={{ uri: sprite }}
            style={styles.sprite}
            contentFit="contain"
            transition={300}
          />
        ) : (
          <View style={styles.spritePlaceholder}>
            <Text style={styles.placeholderText}>?</Text>
          </View>
        )}
      </View>

      {/* Name */}
      <Text style={styles.name} numberOfLines={1}>
        {capitalize(name)}
      </Text>

      {/* Type badges */}
      <View style={styles.typesRow}>
        {types.map((type) => (
          <TypeBadge key={type} typeName={type} size="sm" />
        ))}
      </View>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.base,
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.surfaceLight + '60',
  },
  accentGlow: {
    position: 'absolute',
    top: -30,
    right: -30,
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  pokedexNumber: {
    position: 'absolute',
    top: Spacing.sm,
    right: Spacing.md,
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.bold,
  },
  spriteContainer: {
    width: 90,
    height: 90,
    marginTop: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  sprite: {
    width: '100%',
    height: '100%',
  },
  spritePlaceholder: {
    width: '100%',
    height: '100%',
    borderRadius: 45,
    backgroundColor: Colors.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: Typography.sizes.xl,
    color: Colors.textMuted,
  },
  name: {
    color: Colors.textPrimary,
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.semibold,
    marginBottom: Spacing.xs,
  },
  typesRow: {
    flexDirection: 'row',
    gap: Spacing.xs,
    marginTop: 2,
  },
});
