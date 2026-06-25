# 🔴 Pokédex — React Native Expo App

A premium dark-themed Pokédex app built with **Expo + TypeScript** that fetches and displays Pokémon data from PokéAPI.

## 🎯 API Choice

**[PokéAPI](https://pokeapi.co/)** — A free, open RESTful API for Pokémon data. No API key required.

- **Base URL:** `https://pokeapi.co/api/v2/`
- **Endpoints used:**
  - `/pokemon?limit=20&offset=0` — Paginated Pokémon list
  - `/pokemon/{id}` — Full Pokémon detail (sprites, stats, types, abilities)
  - `/pokemon-species/{id}` — Flavor text descriptions

## 🚀 Setup Instructions

### Prerequisites

- Node.js 18+ installed
- Xcode installed (for iOS simulator)
- macOS (required for iOS development)

### Installation

```bash
# Clone the repository
git clone <repo-url>
cd pokedex-app

# Install dependencies
npm install

# Run on iOS simulator (native build via Xcode)
npx expo run:ios
```

> **Note:** This app uses `npx expo run:ios` for a native build — not Expo Go.

## 📱 Features

### Core
- ✅ Fetch Pokémon data on mount with infinite scroll pagination
- ✅ Display Pokémon in a beautiful 2-column grid
- ✅ Handle loading states with animated skeleton placeholders
- ✅ Handle errors gracefully with retry functionality
- ✅ Pull-to-refresh support

### Navigation (Expo Router)
- ✅ Bottom tab navigation (Pokédex + Favorites)
- ✅ Stack navigation for detail screen (slide-up animation)
- ✅ Deep linking support via Expo Router

### State Management (React Context)
- ✅ Favorites system with `useFavorites()` hook
- ✅ Persisted to AsyncStorage (survives app restarts)

### Premium UI
- ✅ Dark theme with Pokémon-type-colored accents
- ✅ Animated stat bars (react-native-reanimated)
- ✅ Press scale animations on cards
- ✅ Shimmer loading skeletons
- ✅ Type-colored badges
- ✅ Hero sprite with gradient background on detail screen
- ✅ Search/filter by name or Pokédex number

## 🏗 Architecture

```
src/
├── api/              # API layer (fetch functions + helpers)
├── app/              # Expo Router screens
│   ├── (tabs)/       # Tab navigator (Home + Favorites)
│   └── pokemon/      # Detail screen ([id].tsx)
├── components/       # Reusable UI components
├── constants/        # Theme (colors, typography, spacing)
├── context/          # React Context (FavoritesProvider)
├── hooks/            # Custom hooks (usePokemonList, usePokemonDetail)
└── types/            # TypeScript interfaces
```

## 🛠 Tech Stack

| Tool | Purpose |
|------|---------|
| Expo SDK 56 | Framework |
| TypeScript | Language |
| Expo Router | File-based navigation |
| React Native Reanimated | Animations |
| expo-image | Optimized image loading |
| AsyncStorage | Persistent storage |
| PokéAPI | Data source |
