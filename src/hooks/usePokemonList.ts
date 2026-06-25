// © fhamyla

import { useState, useEffect, useCallback, useRef } from 'react';
import { fetchPokemonList, fetchPokemonDetail } from '@/api/pokemon';
import type { PokemonCardData } from '@/types/pokemon';
import { getBestSprite } from '@/constants/theme';

interface UsePokemonListReturn {
  pokemon: PokemonCardData[];
  loading: boolean;
  loadingMore: boolean;
  error: string | null;
  loadMore: () => void;
  refresh: () => void;
  hasMore: boolean;
}

const PAGE_SIZE = 20;

export function usePokemonList(): UsePokemonListReturn {
  const [pokemon, setPokemon] = useState<PokemonCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const isLoadingRef = useRef(false);

  const fetchPage = useCallback(async (pageOffset: number, isRefresh: boolean) => {
    if (isLoadingRef.current) return;
    isLoadingRef.current = true;

    if (isRefresh) {
      setLoading(true);
      setError(null);
    } else {
      setLoadingMore(true);
    }

    try {
      const listResponse = await fetchPokemonList(pageOffset, PAGE_SIZE);
      setHasMore(listResponse.next !== null);

      // Fetch detail for each Pokémon to get sprites and types
      const detailPromises = listResponse.results.map((item) =>
        fetchPokemonDetail(item.name)
      );
      const details = await Promise.all(detailPromises);

      const cardData: PokemonCardData[] = details.map((detail) => ({
        id: detail.id,
        name: detail.name,
        sprite: getBestSprite(detail.sprites),
        types: detail.types.map((t) => t.type.name),
      }));

      if (isRefresh) {
        setPokemon(cardData);
      } else {
        setPokemon((prev) => [...prev, ...cardData]);
      }

      setOffset(pageOffset + PAGE_SIZE);
      setError(null);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(message);
    } finally {
      setLoading(false);
      setLoadingMore(false);
      isLoadingRef.current = false;
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchPage(0, true);
  }, [fetchPage]);

  const loadMore = useCallback(() => {
    if (!loadingMore && !loading && hasMore) {
      fetchPage(offset, false);
    }
  }, [fetchPage, offset, loadingMore, loading, hasMore]);

  const refresh = useCallback(() => {
    setOffset(0);
    setHasMore(true);
    fetchPage(0, true);
  }, [fetchPage]);

  return { pokemon, loading, loadingMore, error, loadMore, refresh, hasMore };
}
