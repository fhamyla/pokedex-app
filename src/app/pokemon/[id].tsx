// © fhamyla

import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { TypeBadge } from '@/components/TypeBadge';
import { StatBar } from '@/components/StatBar';
import { ErrorState } from '@/components/ErrorState';
import { usePokemonDetail } from '@/hooks/usePokemonDetail';
import { useFavorites } from '@/context/FavoritesContext';
import { getEnglishFlavorText, getEnglishGenus } from '@/api/pokemon';
import {
  Typography,
  Spacing,
  BorderRadius,
  getTypeColor,
  formatPokedexNumber,
  capitalize,
  getBestSprite,
} from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function PokemonDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();
  const styles = getStyles(colors);
  
  const { pokemon, species, loading, error, retry } = usePokemonDetail(id!);
  const { isFavorite, toggleFavorite } = useFavorites();

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { paddingTop: insets.top }]}>
        <ActivityIndicator color={colors.primary} size="large" />
        <Text style={styles.loadingText}>Loading Pokémon...</Text>
      </View>
    );
  }

  if (error || !pokemon) {
    return (
      <View style={[styles.loadingContainer, { paddingTop: insets.top }]}>
        <TouchableOpacity
          style={[styles.backButton, { top: insets.top + Spacing.sm }]}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <ErrorState
          message={error ?? 'Failed to load Pokémon data'}
          onRetry={retry}
        />
      </View>
    );
  }

  const primaryType = pokemon.types[0]?.type.name ?? 'normal';
  const typeColor = getTypeColor(primaryType);
  const spriteUrl = getBestSprite(pokemon.sprites);
  const favorite = isFavorite(pokemon.id);
  const genus = species ? getEnglishGenus(species) : '';
  const flavorText = species ? getEnglishFlavorText(species) : '';

  // Convert height/weight from API units
  const heightM = (pokemon.height / 10).toFixed(1);
  const weightKg = (pokemon.weight / 10).toFixed(1);

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={{ paddingBottom: insets.bottom + Spacing.xxxl }}
        showsVerticalScrollIndicator={false}
      >
        {/* ─── Hero Section ──────────────────────────────────── */}
        <View style={[styles.heroSection, { backgroundColor: typeColor + (isDark ? '20' : '15') }]}>
          {/* Background decoration */}
          <View
            style={[
              styles.heroBgCircle,
              { backgroundColor: typeColor + '10' },
            ]}
          />

          {/* Top bar */}
          <View style={[styles.topBar, { paddingTop: insets.top + Spacing.sm }]}>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => router.back()}
            >
              <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => toggleFavorite(pokemon.id)}
            >
              <Ionicons
                name={favorite ? 'heart' : 'heart-outline'}
                size={24}
                color={favorite ? colors.primary : colors.textPrimary}
              />
            </TouchableOpacity>
          </View>

          {/* Pokédex number large */}
          <Text style={[styles.heroNumber, { color: typeColor + (isDark ? '25' : '18') }]}>
            {formatPokedexNumber(pokemon.id)}
          </Text>

          {/* Sprite */}
          <View style={styles.spriteContainer}>
            {spriteUrl ? (
              <Image
                source={{ uri: spriteUrl }}
                style={styles.heroSprite}
                contentFit="contain"
                transition={400}
              />
            ) : (
              <View style={styles.spritePlaceholder}>
                <Text style={styles.placeholderText}>?</Text>
              </View>
            )}
          </View>
        </View>

        {/* ─── Info Section ──────────────────────────────────── */}
        <View style={styles.infoSection}>
          {/* Name and types */}
          <Text style={styles.pokemonName}>{capitalize(pokemon.name)}</Text>
          {genus !== '' && (
            <Text style={styles.genus}>{genus}</Text>
          )}

          <View style={styles.typesRow}>
            {pokemon.types.map((t) => (
              <TypeBadge key={t.type.name} typeName={t.type.name} size="md" />
            ))}
          </View>

          {/* Description */}
          {flavorText !== '' && (
            <Text style={styles.flavorText}>{flavorText}</Text>
          )}

          {/* ─── About Card ───────────────────────────────── */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>About</Text>
            <View style={styles.aboutGrid}>
              <View style={styles.aboutItem}>
                <Ionicons name="resize-outline" size={18} color={colors.textSecondary} />
                <Text style={styles.aboutValue}>{heightM} m</Text>
                <Text style={styles.aboutLabel}>Height</Text>
              </View>
              <View style={styles.aboutDivider} />
              <View style={styles.aboutItem}>
                <Ionicons name="barbell-outline" size={18} color={colors.textSecondary} />
                <Text style={styles.aboutValue}>{weightKg} kg</Text>
                <Text style={styles.aboutLabel}>Weight</Text>
              </View>
              <View style={styles.aboutDivider} />
              <View style={styles.aboutItem}>
                <Ionicons name="flash-outline" size={18} color={colors.textSecondary} />
                <Text style={styles.aboutValue}>{pokemon.base_experience ?? '—'}</Text>
                <Text style={styles.aboutLabel}>Base Exp</Text>
              </View>
            </View>
          </View>

          {/* ─── Abilities Card ───────────────────────────── */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Abilities</Text>
            <View style={styles.abilitiesRow}>
              {pokemon.abilities.map((a) => (
                <View
                  key={a.ability.name}
                  style={[
                    styles.abilityBadge,
                    a.is_hidden && styles.abilityHidden,
                  ]}
                >
                  <Text style={styles.abilityText}>
                    {capitalize(a.ability.name.replace('-', ' '))}
                  </Text>
                  {a.is_hidden && (
                    <Text style={styles.hiddenLabel}>Hidden</Text>
                  )}
                </View>
              ))}
            </View>
          </View>

          {/* ─── Stats Card ───────────────────────────────── */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Base Stats</Text>
            {pokemon.stats.map((s) => (
              <StatBar
                key={s.stat.name}
                label={s.stat.name}
                value={s.base_stat}
              />
            ))}
            {/* Total */}
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>TOT</Text>
              <Text style={styles.totalValue}>
                {pokemon.stats.reduce((sum, s) => sum + s.base_stat, 0)}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const getStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollView: {
      flex: 1,
    },
    loadingContainer: {
      flex: 1,
      backgroundColor: colors.background,
      justifyContent: 'center',
      alignItems: 'center',
    },
    loadingText: {
      color: colors.textSecondary,
      fontSize: Typography.sizes.md,
      marginTop: Spacing.md,
    },
    backButton: {
      position: 'absolute',
      left: Spacing.base,
      zIndex: 10,
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.surface,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.surfaceLight + '40',
    },

    // ─── Hero Section
    heroSection: {
      alignItems: 'center',
      paddingBottom: Spacing.xxl,
      overflow: 'hidden',
      borderBottomLeftRadius: BorderRadius.xl,
      borderBottomRightRadius: BorderRadius.xl,
    },
    heroBgCircle: {
      position: 'absolute',
      width: SCREEN_WIDTH * 1.5,
      height: SCREEN_WIDTH * 1.5,
      borderRadius: SCREEN_WIDTH * 0.75,
      top: -SCREEN_WIDTH * 0.7,
      alignSelf: 'center',
    },
    topBar: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      width: '100%',
      paddingHorizontal: Spacing.base,
      marginBottom: Spacing.sm,
    },
    iconButton: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: colors.surface,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.surfaceLight + '40',
    },
    heroNumber: {
      fontSize: Typography.sizes.hero + 30,
      fontWeight: Typography.weights.heavy,
      position: 'absolute',
      bottom: 10,
      right: Spacing.lg,
    },
    spriteContainer: {
      width: 220,
      height: 220,
      zIndex: 1,
    },
    heroSprite: {
      width: '100%',
      height: '100%',
    },
    spritePlaceholder: {
      width: '100%',
      height: '100%',
      borderRadius: 110,
      backgroundColor: colors.surfaceLight,
      justifyContent: 'center',
      alignItems: 'center',
    },
    placeholderText: {
      fontSize: 60,
      color: colors.textMuted,
    },

    // ─── Info Section
    infoSection: {
      paddingHorizontal: Spacing.base,
      paddingTop: Spacing.lg,
    },
    pokemonName: {
      color: colors.textPrimary,
      fontSize: Typography.sizes.xxl,
      fontWeight: Typography.weights.heavy,
      textAlign: 'center',
    },
    genus: {
      color: colors.textSecondary,
      fontSize: Typography.sizes.md,
      textAlign: 'center',
      marginTop: Spacing.xs,
    },
    typesRow: {
      flexDirection: 'row',
      justifyContent: 'center',
      gap: Spacing.sm,
      marginTop: Spacing.md,
    },
    flavorText: {
      color: colors.textSecondary,
      fontSize: Typography.sizes.md,
      lineHeight: 22,
      textAlign: 'center',
      marginTop: Spacing.base,
      paddingHorizontal: Spacing.base,
    },

    // ─── Cards
    card: {
      backgroundColor: colors.surface,
      borderRadius: BorderRadius.lg,
      padding: Spacing.base,
      marginTop: Spacing.base,
      borderWidth: 1,
      borderColor: colors.surfaceLight + '40',
    },
    sectionTitle: {
      color: colors.textPrimary,
      fontSize: Typography.sizes.lg,
      fontWeight: Typography.weights.bold,
      marginBottom: Spacing.md,
    },

    // About
    aboutGrid: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      alignItems: 'center',
    },
    aboutItem: {
      alignItems: 'center',
      flex: 1,
    },
    aboutValue: {
      color: colors.textPrimary,
      fontSize: Typography.sizes.base,
      fontWeight: Typography.weights.bold,
      marginTop: Spacing.sm,
    },
    aboutLabel: {
      color: colors.textMuted,
      fontSize: Typography.sizes.sm,
      marginTop: Spacing.xs,
    },
    aboutDivider: {
      width: 1,
      height: 50,
      backgroundColor: colors.surfaceLight,
    },

    // Abilities
    abilitiesRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: Spacing.sm,
    },
    abilityBadge: {
      backgroundColor: colors.surfaceLight,
      paddingHorizontal: Spacing.md,
      paddingVertical: Spacing.sm,
      borderRadius: BorderRadius.md,
    },
    abilityHidden: {
      borderWidth: 1,
      borderColor: colors.accent + '40',
      borderStyle: 'dashed',
    },
    abilityText: {
      color: colors.textPrimary,
      fontSize: Typography.sizes.md,
      fontWeight: Typography.weights.medium,
    },
    hiddenLabel: {
      color: colors.accent,
      fontSize: Typography.sizes.xs,
      marginTop: 2,
    },

    // Stats total
    totalRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: Spacing.sm,
      paddingTop: Spacing.sm,
      borderTopWidth: 1,
      borderTopColor: colors.surfaceLight,
    },
    totalLabel: {
      color: colors.textSecondary,
      fontSize: Typography.sizes.sm,
      fontWeight: Typography.weights.bold,
      width: 36,
    },
    totalValue: {
      color: colors.textPrimary,
      fontSize: Typography.sizes.base,
      fontWeight: Typography.weights.heavy,
      width: 36,
      textAlign: 'right',
    },
  });
