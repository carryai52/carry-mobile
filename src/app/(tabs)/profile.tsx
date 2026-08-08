import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { authClient } from '@/lib/auth-client';
import { useRouter } from 'expo-router';
import { LogOut, User, Coins, CreditCard } from 'lucide-react-native';

export default function ProfileScreen() {
  const { data: session, isPending } = authClient.useSession();
  const router = useRouter();

  const handleLogout = async () => {
    await authClient.signOut();
    router.replace('/(auth)/login');
  };

  if (isPending) {
    return (
      <View className="flex-1 bg-zinc-950 items-center justify-center">
        <ActivityIndicator size="large" color="#10b981" />
      </View>
    );
  }

  const user = session?.user;
  // @ts-ignore - tokens and plan are added as custom fields in better-auth
  const tokens = user?.tokens ?? 0;
  // @ts-ignore
  const plan = user?.plan ?? 'basic';

  return (
    <ScrollView className="flex-1 bg-zinc-950">
      <View className="px-6 py-12 pt-20">
        <Text className="text-white text-3xl font-bold mb-8">Profile</Text>

        <View className="bg-zinc-900 rounded-3xl p-6 border border-zinc-800 mb-6 flex-row items-center">
          <View className="w-16 h-16 rounded-full bg-emerald-500/20 items-center justify-center mr-4">
            <User color="#10b981" size={32} />
          </View>
          <View>
            <Text className="text-white text-xl font-bold">{user?.name || 'User'}</Text>
            {(user as any)?.phoneNumber && <Text className="text-zinc-400 mt-1">{(user as any).phoneNumber}</Text>}
          </View>
        </View>

        <View className="flex-row gap-4 mb-8">
          <View className="flex-1 bg-zinc-900 rounded-3xl p-6 border border-zinc-800">
            <Coins color="#f59e0b" size={24} className="mb-2" />
            <Text className="text-zinc-400 text-sm mb-1">Balance</Text>
            <Text className="text-white text-2xl font-bold">{tokens} tokens</Text>
          </View>
          <View className="flex-1 bg-zinc-900 rounded-3xl p-6 border border-zinc-800">
            <CreditCard color="#3b82f6" size={24} className="mb-2" />
            <Text className="text-zinc-400 text-sm mb-1">Plan</Text>
            <Text className="text-white text-2xl font-bold capitalize">{plan}</Text>
          </View>
        </View>

        <TouchableOpacity 
          className="bg-red-500/10 p-4 rounded-xl border border-red-500/20 flex-row items-center justify-center"
          onPress={handleLogout}
        >
          <LogOut color="#ef4444" size={20} className="mr-2" />
          <Text className="text-red-500 font-bold">Log Out</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
