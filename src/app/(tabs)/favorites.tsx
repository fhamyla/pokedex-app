import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PokemonCard } from '@/components/PokemonCard';
import { EmptyState } from '@/components/ErrorState';
import { useFavorites } from '@/context/FavoritesContext';
import { fetchPokemonDetail } from '@/api/pokemon';
import { getBestSprite } from '@/constants/theme';
import { Colors, Typography, Spacing } from '@/constants/theme';
import type { PokemonCardData } from '@/types/pokemon';

export default function FavoritesScreen() {
  const insets = useSafeAreaInsets();
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
      <View style={styles.header}>
        <Text style={styles.title}>Favorites</Text>
        <Text style={styles.subtitle}>
          {favorites.length} Pokémon saved
        </Text>
      </View>

      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator color={Colors.primary} size="large" />
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.base,
    paddingBottom: Spacing.base,
  },
  title: {
    color: Colors.textPrimary,
    fontSize: Typography.sizes.xxl,
    fontWeight: Typography.weights.heavy,
  },
  subtitle: {
    color: Colors.textSecondary,
    fontSize: Typography.sizes.md,
    marginTop: Spacing.xs,
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
