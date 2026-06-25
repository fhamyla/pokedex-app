// © fhamyla

// ─── PokéAPI Response Types ─────────────────────────────────────────


export interface PokemonListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: PokemonListItem[];
}

export interface PokemonListItem {
  name: string;
  url: string;
}

// ─── Pokemon Detail ─────────────────────────────────────────────────

export interface PokemonDetail {
  id: number;
  name: string;
  height: number; // in decimetres
  weight: number; // in hectograms
  base_experience: number;
  sprites: PokemonSprites;
  stats: PokemonStatEntry[];
  types: PokemonTypeEntry[];
  abilities: PokemonAbilityEntry[];
}

export interface PokemonSprites {
  front_default: string | null;
  front_shiny: string | null;
  other?: {
    'official-artwork'?: {
      front_default: string | null;
      front_shiny: string | null;
    };
    dream_world?: {
      front_default: string | null;
    };
  };
}

export interface PokemonStatEntry {
  base_stat: number;
  effort: number;
  stat: {
    name: string;
    url: string;
  };
}

export interface PokemonTypeEntry {
  slot: number;
  type: {
    name: string;
    url: string;
  };
}

export interface PokemonAbilityEntry {
  is_hidden: boolean;
  slot: number;
  ability: {
    name: string;
    url: string;
  };
}

// ─── Pokemon Species (for flavor text) ──────────────────────────────

export interface PokemonSpecies {
  id: number;
  name: string;
  flavor_text_entries: FlavorTextEntry[];
  genera: GenusEntry[];
  gender_rate: number;
  capture_rate: number;
  base_happiness: number;
  growth_rate: {
    name: string;
    url: string;
  };
}

export interface FlavorTextEntry {
  flavor_text: string;
  language: {
    name: string;
    url: string;
  };
  version: {
    name: string;
    url: string;
  };
}

export interface GenusEntry {
  genus: string;
  language: {
    name: string;
    url: string;
  };
}

// ─── App-level types ────────────────────────────────────────────────

/** Pokemon with pre-fetched detail for card display */
export interface PokemonCardData {
  id: number;
  name: string;
  sprite: string | null;
  types: string[];
}
