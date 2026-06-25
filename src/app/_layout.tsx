import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { FavoritesProvider } from '@/context/FavoritesContext';
import { ThemeProvider, useTheme } from '@/context/ThemeContext';

export default function RootLayout() {
  return (
    <ThemeProvider>
      <FavoritesProvider>
        <RootLayoutContent />
      </FavoritesProvider>
    </ThemeProvider>
  );
}

function RootLayoutContent() {
  const { colors, isDark } = useTheme();

  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="pokemon/[id]"
          options={{
            headerShown: false,
            animation: 'slide_from_bottom',
            presentation: 'card',
          }}
        />
      </Stack>
    </>
  );
}
