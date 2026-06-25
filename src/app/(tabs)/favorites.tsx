import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PokemonCard } from '@/components/PokemonCard';
import { EmptyState } from '@/components/ErrorState';
import { useFavorites } from '@/context/FavoritesContext';
import { fetchPokemonDetail } from '@/api/pokemon';
import { getBestSprite } from '@/constants/theme';
import { Typography, Spacing } from '@/constants/theme';
import type { PokemonCardData } from '@/types/pokemon';
import { useTheme } from '@/context/ThemeContext';
import Ionicons from '@expo/vector-icons/Ionicons';

export default function FavoritesScreen() {
  const insets = useSafeAreaInsets();
  const { colors, isDark, toggleTheme } = useTheme();
  const styles = getStyles(colors);

  const { favorites, isLoaded } = useFavorites();
  const [pokemonData, setPokemonData] = useState<PokemonCardData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoaded) return;

    const loadFavorites = async () => {
      setLoading(true);
      try {
        const details = await Promise.all(
          favorites.map((id) => fetchPokemonDetail(id))
        );
        const cards: PokemonCardData[] = details.map((detail) => ({
          id: detail.id,
          name: detail.name,
          sprite: getBestSprite(detail.sprites),
          types: detail.types.map((t) => t.type.name),
        }));
        setPokemonData(cards);
      } catch (error) {
        console.warn('Failed to load favorites:', error);
      } finally {
        setLoading(false);
      }
    };

    if (favorites.length > 0) {
      loadFavorites();
    } else {
      setPokemonData([]);
      setLoading(false);
    }
  }, [favorites, isLoaded]);

  const renderItem = useCallback(
    ({ item }: { item: PokemonCardData }) => (
      <PokemonCard
        id={item.id}
        name={item.name}
        sprite={item.sprite}
        types={item.types}
      />
    ),
    []
  );

  const keyExtractor = useCallback(
    (item: PokemonCardData) => item.id.toString(),
    []
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.headerRow}>
        <View style={styles.header}>
          <Text style={styles.title}>Favorites</Text>
          <Text style={styles.subtitle}>
            {favorites.length} Pokémon saved
          </Text>
        </View>
        <TouchableOpacity
          style={styles.themeToggleBtn}
          onPress={toggleTheme}
          activeOpacity={0.7}
        >
          <Ionicons
            name={isDark ? 'sunny-outline' : 'moon-outline'}
            size={20}
            color={colors.textPrimary}
          />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      ) : pokemonData.length === 0 ? (
        <EmptyState
          title="No favorites yet"
          subtitle="Tap the heart icon on a Pokémon's detail page to add it to your favorites!"
          icon="❤️"
        />
      ) : (
        <FlatList
          data={pokemonData}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          numColumns={2}
          contentContainerStyle={styles.gridContent}
          columnWrapperStyle={styles.columnWrapper}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const getStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    headerRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: Spacing.base,
      paddingTop: Spacing.base,
      paddingBottom: Spacing.base,
    },
    header: {
      flex: 1,
    },
    title: {
      color: colors.textPrimary,
      fontSize: Typography.sizes.xxl,
      fontWeight: Typography.weights.heavy,
    },
    subtitle: {
      color: colors.textSecondary,
      fontSize: Typography.sizes.md,
      marginTop: Spacing.xs,
    },
    themeToggleBtn: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.surface,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.surfaceLight + '60',
    },
    loaderContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    gridContent: {
      paddingHorizontal: Spacing.base,
      paddingBottom: Spacing.xxxl,
    },
    columnWrapper: {
      justifyContent: 'space-between',
    },
  });
