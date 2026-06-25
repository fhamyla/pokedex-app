import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PokemonCard } from '@/components/PokemonCard';
import { LoadingSkeletons } from '@/components/LoadingSkeletons';
import { ErrorState, EmptyState } from '@/components/ErrorState';
import { usePokemonList } from '@/hooks/usePokemonList';
import { Colors, Typography, Spacing, BorderRadius } from '@/constants/theme';
import type { PokemonCardData } from '@/types/pokemon';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { pokemon, loading, loadingMore, error, loadMore, refresh, hasMore } =
    usePokemonList();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredPokemon = useMemo(() => {
    if (!searchQuery.trim()) return pokemon;
    const query = searchQuery.toLowerCase().trim();
    return pokemon.filter(
      (p) =>
        p.name.toLowerCase().includes(query) ||
        p.id.toString().includes(query)
    );
  }, [pokemon, searchQuery]);

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

  const renderFooter = useCallback(() => {
    if (!loadingMore) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator color={Colors.primary} size="small" />
        <Text style={styles.loadingText}>Loading more Pokémon...</Text>
      </View>
    );
  }, [loadingMore]);

  const keyExtractor = useCallback(
    (item: PokemonCardData) => item.id.toString(),
    []
  );

  if (loading) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <Text style={styles.title}>Pokédex</Text>
          <Text style={styles.subtitle}>Search for a Pokémon</Text>
        </View>
        <LoadingSkeletons count={6} />
      </View>
    );
  }

  if (error && pokemon.length === 0) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <Text style={styles.title}>Pokédex</Text>
        </View>
        <ErrorState message={error} onRetry={refresh} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Pokédex</Text>
        <Text style={styles.subtitle}>
          {pokemon.length} Pokémon loaded
        </Text>
      </View>

      {/* Search bar */}
      <View style={styles.searchContainer}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name or number..."
          placeholderTextColor={Colors.textMuted}
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoCorrect={false}
          autoCapitalize="none"
        />
      </View>

      {/* Pokemon grid */}
      {filteredPokemon.length === 0 ? (
        <EmptyState
          title="No Pokémon found"
          subtitle={`No results for "${searchQuery}"`}
        />
      ) : (
        <FlatList
          data={filteredPokemon}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          numColumns={2}
          contentContainerStyle={styles.gridContent}
          columnWrapperStyle={styles.columnWrapper}
          showsVerticalScrollIndicator={false}
          onEndReached={searchQuery ? undefined : loadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={renderFooter}
          refreshControl={
            <RefreshControl
              refreshing={false}
              onRefresh={refresh}
              tintColor={Colors.primary}
            />
          }
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
    paddingBottom: Spacing.sm,
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    marginHorizontal: Spacing.base,
    marginBottom: Spacing.base,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.surfaceLight + '60',
  },
  searchIcon: {
    fontSize: 16,
    marginRight: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    color: Colors.textPrimary,
    fontSize: Typography.sizes.base,
    paddingVertical: Spacing.md,
  },
  gridContent: {
    paddingHorizontal: Spacing.base,
    paddingBottom: Spacing.xxxl,
  },
  columnWrapper: {
    justifyContent: 'space-between',
  },
  footerLoader: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Spacing.lg,
    gap: Spacing.sm,
  },
  loadingText: {
    color: Colors.textSecondary,
    fontSize: Typography.sizes.sm,
  },
});
