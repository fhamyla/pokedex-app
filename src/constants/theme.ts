// ─── Pokédex Design System ──────────────────────────────────────────

export const LightColors = {
  // Core palette
  background: '#f8fafc',
  surface: '#ffffff',
  surfaceLight: '#e2e8f0',
  card: '#ffffff',
  cardHover: '#f1f5f9',

  // Text
  textPrimary: '#0f172a',
  textSecondary: '#475569',
  textMuted: '#94a3b8',

  // Accents
  primary: '#e63946',
  primaryLight: '#ff6b6b',
  accent: '#d97706',
  accentDim: '#b45309',

  // Status
  success: '#2ecc71',
  error: '#e74c3c',
  warning: '#f39c12',

  // Pokémon type colors
  typeColors: {
    normal: '#A8A878',
    fire: '#F08030',
    water: '#6890F0',
    electric: '#F8D030',
    grass: '#78C850',
    ice: '#98D8D8',
    fighting: '#C03028',
    poison: '#A040A0',
    ground: '#E0C068',
    flying: '#A890F0',
    psychic: '#F85888',
    bug: '#A8B820',
    rock: '#B8A038',
    ghost: '#705898',
    dragon: '#7038F8',
    dark: '#705848',
    steel: '#B8B8D0',
    fairy: '#EE99AC',
  } as Record<string, string>,
};

export const DarkColors = {
  // Core palette
  background: '#0f1923',
  surface: '#1a2332',
  surfaceLight: '#243447',
  card: '#1e2d3d',
  cardHover: '#253a4e',

  // Text
  textPrimary: '#e8edf2',
  textSecondary: '#8899aa',
  textMuted: '#5a6b7c',

  // Accents
  primary: '#e63946',
  primaryLight: '#ff6b6b',
  accent: '#f4d03f',
  accentDim: '#c4a72f',

  // Status
  success: '#2ecc71',
  error: '#e74c3c',
  warning: '#f39c12',

  // Pokémon type colors
  typeColors: LightColors.typeColors,
};

export const Colors = DarkColors;

export const Typography = {
  sizes: {
    xs: 10,
    sm: 12,
    md: 14,
    base: 16,
    lg: 20,
    xl: 28,
    xxl: 36,
    hero: 48,
  },
  weights: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
    heavy: '800' as const,
  },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  xxxl: 48,
};

export const BorderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  pill: 100,
};

/** Get the color for a Pokémon type, with fallback */
export function getTypeColor(typeName: string): string {
  return LightColors.typeColors[typeName.toLowerCase()] ?? LightColors.textMuted;
}

/** Format Pokédex number as #001, #025, etc. */
export function formatPokedexNumber(id: number): string {
  return `#${id.toString().padStart(3, '0')}`;
}

/** Capitalize first letter */
export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/** Get the best available sprite URL */
export function getBestSprite(sprites: {
  front_default: string | null;
  other?: {
    'official-artwork'?: { front_default: string | null };
    dream_world?: { front_default: string | null };
  };
}): string | null {
  return (
    sprites.other?.['official-artwork']?.front_default ??
    sprites.other?.dream_world?.front_default ??
    sprites.front_default
  );
}
