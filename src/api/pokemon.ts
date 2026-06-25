// © fhamyla

import type {
  PokemonListResponse,
  PokemonDetail,
  PokemonSpecies,
} from '@/types/pokemon';

const BASE_URL = 'https://pokeapi.co/api/v2';

class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new ApiError(
      `API request failed: ${response.status} ${response.statusText}`,
      response.status
    );
  }
  return response.json() as Promise<T>;
}

/**
 * Fetch a paginated list of Pokémon.
 * @param offset - Starting index (default 0)
 * @param limit  - Number of results (default 20)
 */
export async function fetchPokemonList(
  offset: number = 0,
  limit: number = 20
): Promise<PokemonListResponse> {
  return fetchJson<PokemonListResponse>(
    `${BASE_URL}/pokemon?offset=${offset}&limit=${limit}`
  );
}

/**
 * Fetch full detail for a single Pokémon.
 * @param idOrName - Pokémon ID or name
 */
export async function fetchPokemonDetail(
  idOrName: string | number
): Promise<PokemonDetail> {
  return fetchJson<PokemonDetail>(`${BASE_URL}/pokemon/${idOrName}`);
}

/**
 * Fetch species data (flavor text, genus, etc.)
 * @param id - Pokémon species ID
 */
export async function fetchPokemonSpecies(
  id: number
): Promise<PokemonSpecies> {
  return fetchJson<PokemonSpecies>(`${BASE_URL}/pokemon-species/${id}`);
}

/**
 * Extract the English flavor text from species data,
 * cleaning up control characters.
 */
export function getEnglishFlavorText(species: PokemonSpecies): string {
  const entry = species.flavor_text_entries.find(
    (e) => e.language.name === 'en'
  );
  if (!entry) return 'No description available.';
  // PokéAPI flavor text has \n, \f, \r control chars
  return entry.flavor_text.replace(/[\n\f\r]/g, ' ').replace(/\s+/g, ' ').trim();
}

/**
 * Extract the English genus (e.g., "Seed Pokémon") from species data.
 */
export function getEnglishGenus(species: PokemonSpecies): string {
  const entry = species.genera.find((g) => g.language.name === 'en');
  return entry?.genus ?? '';
}
