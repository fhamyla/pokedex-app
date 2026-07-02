// © fhamyla

import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PokemonCard } from '@/components/PokemonCard';
import { LoadingSkeletons } from '@/components/LoadingSkeletons';
import { ErrorState, EmptyState } from '@/components/ErrorState';
import { usePokemonList } from '@/hooks/usePokemonList';
import { Typography, Spacing, BorderRadius } from '@/constants/theme';
import type { PokemonCardData } from '@/types/pokemon';
import { useTheme } from '@/context/ThemeContext';
import Ionicons from '@expo/vector-icons/Ionicons';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { colors, isDark, toggleTheme } = useTheme();
  const styles = getStyles(colors);

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
        <ActivityIndicator color={colors.primary} size="small" />
        <Text style={styles.loadingText}>Loading more Pokémon...</Text>
      </View>
    );
  }, [loadingMore, colors.primary, styles.footerLoader, styles.loadingText]);

  const keyExtractor = useCallback(
    (item: PokemonCardData) => item.id.toString(),
    []
  );

  const renderHeader = useCallback(() => (
    <>
      {/* Header */}
      <View style={styles.headerRow}>
        <View style={styles.header}>
          <Text style={styles.title}>Pokédex</Text>
          <Text style={styles.subtitle}>
            {pokemon.length} Pokémon loaded
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

      {/* Search bar */}
      <View style={styles.searchContainer}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name or number..."
          placeholderTextColor={colors.textMuted}
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoCorrect={false}
          autoCapitalize="none"
        />
      </View>
    </>
  ), [pokemon.length, colors, isDark, toggleTheme, searchQuery, styles]);

  const renderEmpty = useCallback(() => {
    if (!searchQuery) return null;
    return (
      <EmptyState
        title="No Pokémon found"
        subtitle={`No results for "${searchQuery}"`}
      />
    );
  }, [searchQuery]);

  if (loading) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.headerRow}>
          <View style={styles.header}>
            <Text style={styles.title}>Pokédex</Text>
            <Text style={styles.subtitle}>Search for a Pokémon</Text>
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
        <LoadingSkeletons count={6} />
      </View>
    );
  }

  if (error && pokemon.length === 0) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.headerRow}>
          <View style={styles.header}>
            <Text style={styles.title}>Pokédex</Text>
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
        <ErrorState message={error} onRetry={refresh} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <FlatList
        style={styles.flatList}
        data={filteredPokemon}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        numColumns={2}
        contentContainerStyle={styles.gridContent}
        columnWrapperStyle={styles.columnWrapper}
        showsVerticalScrollIndicator={true}
        scrollEnabled={true}
        onEndReached={searchQuery ? undefined : loadMore}
        onEndReachedThreshold={0.5}
        ListHeaderComponent={renderHeader}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmpty}
        refreshControl={
          <RefreshControl
            refreshing={false}
            onRefresh={refresh}
            tintColor={colors.primary}
          />
        }
      />
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
      paddingBottom: Spacing.sm,
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
    searchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surface,
      marginHorizontal: Spacing.base,
      marginBottom: Spacing.base,
      borderRadius: BorderRadius.md,
      paddingHorizontal: Spacing.md,
      borderWidth: 1,
      borderColor: colors.surfaceLight + '60',
    },
    searchIcon: {
      fontSize: 16,
      marginRight: Spacing.sm,
    },
    searchInput: {
      flex: 1,
      color: colors.textPrimary,
      fontSize: Typography.sizes.base,
      paddingVertical: Spacing.md,
    },
    flatList: {
      flex: 1,
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
      color: colors.textSecondary,
      fontSize: Typography.sizes.sm,
    },
  });
