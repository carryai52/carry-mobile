import { useEffect } from 'react';
import { useRouter, useSegments } from 'expo-router';
import { authClient } from '@/lib/auth-client';
import { View, ActivityIndicator } from 'react-native';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data: session, isPending } = authClient.useSession();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isPending) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!session && !inAuthGroup) {
      // Redirect to the sign-in page.
      router.replace('/(auth)/login');
    } else if (session && inAuthGroup) {
      // Redirect away from the sign-in page.
      router.replace('/(tabs)');
    }
  }, [session, isPending, segments]);

  if (isPending) {
    return (
      <View className="flex-1 justify-center items-center bg-zinc-950">
        <ActivityIndicator size="large" color="#10b981" />
      </View>
    );
  }

  return <>{children}</>;
}
