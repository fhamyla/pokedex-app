// © fhamyla

import { useState, useEffect } from 'react';
import { fetchPokemonDetail, fetchPokemonSpecies } from '@/api/pokemon';
import type { PokemonDetail, PokemonSpecies } from '@/types/pokemon';

interface UsePokemonDetailReturn {
  pokemon: PokemonDetail | null;
  species: PokemonSpecies | null;
  loading: boolean;
  error: string | null;
  retry: () => void;
}

export function usePokemonDetail(id: string | number): UsePokemonDetailReturn {
  const [pokemon, setPokemon] = useState<PokemonDetail | null>(null);
  const [species, setSpecies] = useState<PokemonSpecies | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError(null);

      try {
        const [pokemonData, speciesData] = await Promise.all([
          fetchPokemonDetail(id),
          fetchPokemonSpecies(Number(id)),
        ]);

        if (!cancelled) {
          setPokemon(pokemonData);
          setSpecies(speciesData);
        }
      } catch (err) {
        if (!cancelled) {
          const message =
            err instanceof Error ? err.message : 'Failed to load Pokémon data';
          setError(message);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [id, retryCount]);

  const retry = () => setRetryCount((c) => c + 1);

  return { pokemon, species, loading, error, retry };
}
