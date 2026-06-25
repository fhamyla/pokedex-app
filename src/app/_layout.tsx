import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { FavoritesProvider } from '@/context/FavoritesContext';
import { Colors } from '@/constants/theme';

export default function RootLayout() {
  return (
    <FavoritesProvider>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: Colors.background },
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
    </FavoritesProvider>
  );
}
