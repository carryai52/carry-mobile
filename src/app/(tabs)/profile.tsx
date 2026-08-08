import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { User, LogOut, CreditCard, Zap, ChevronRight } from 'lucide-react-native';
import { authClient } from '@/lib/auth-client';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/api/client';

export default function ProfileScreen() {
  const router = useRouter();
  
  const { data: account, isLoading } = useQuery({
    queryKey: ['account'],
    queryFn: async () => {
      const res = await apiClient.get('/api/account');
      return res.data?.account;
    }
  });

  const handleLogout = async () => {
    await authClient.signOut();
    router.replace('/(auth)/login');
  };

  return (
    <ScrollView className="flex-1 bg-zinc-950">
      <View className="px-6 py-12 pt-20">
        <Text className="text-white text-3xl font-bold mb-8">Profile</Text>

        {isLoading ? (
          <ActivityIndicator color="#10b981" />
        ) : account ? (
          <>
            <View className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 mb-6 flex-row items-center">
              <View className="w-16 h-16 rounded-full bg-zinc-800 items-center justify-center mr-4">
                <User color="#10b981" size={32} />
              </View>
              <View>
                <Text className="text-white text-xl font-bold">{account.name || 'User'}</Text>
                {account.phoneNumber && <Text className="text-zinc-400 mt-1">{account.phoneNumber}</Text>}
              </View>
            </View>

            <View className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 mb-6">
              <View className="flex-row items-center justify-between mb-4">
                <View className="flex-row items-center">
                  <Zap color="#f59e0b" size={24} className="mr-3" />
                  <Text className="text-white text-lg font-bold">AI Tokens</Text>
                </View>
                <Text className="text-2xl font-bold text-emerald-400">{account.tokens}</Text>
              </View>
              
              <View className="flex-row items-center justify-between mt-4 pt-4 border-t border-zinc-800">
                <View className="flex-row items-center">
                  <CreditCard color="#a1a1aa" size={24} className="mr-3" />
                  <View>
                    <Text className="text-white font-bold">Current Plan</Text>
                    <Text className="text-zinc-400 text-sm capitalize">{account.plan || 'Free'}</Text>
                  </View>
                </View>
                <TouchableOpacity className="bg-zinc-800 px-4 py-2 rounded-full">
                  <Text className="text-white font-bold text-sm">Upgrade</Text>
                </TouchableOpacity>
              </View>
            </View>
          </>
        ) : null}

        <TouchableOpacity 
          className="flex-row items-center justify-between bg-zinc-900 border border-zinc-800 p-4 rounded-2xl mb-4"
          onPress={() => {}}
        >
          <Text className="text-white font-bold">Settings</Text>
          <ChevronRight color="#52525b" size={20} />
        </TouchableOpacity>

        <TouchableOpacity 
          className="flex-row items-center justify-between bg-red-500/10 border border-red-500/20 p-4 rounded-2xl"
          onPress={handleLogout}
        >
          <Text className="text-red-400 font-bold">Log Out</Text>
          <LogOut color="#f87171" size={20} />
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
