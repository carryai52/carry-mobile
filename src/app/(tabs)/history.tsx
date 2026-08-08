import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/api/client';
import { MessageSquare, ChevronRight } from 'lucide-react-native';

type Chat = {
  id: number;
  title: string;
  updatedAt: string;
};

export default function HistoryScreen() {
  const router = useRouter();

  const { data: chats, isLoading } = useQuery({
    queryKey: ['history'],
    queryFn: async () => {
      const res = await apiClient.get('/api/chats');
      return res.data?.chats as Chat[];
    },
  });

  return (
    <ScrollView className="flex-1 bg-zinc-950">
      <View className="px-6 py-12 pt-20">
        <Text className="text-white text-3xl font-bold mb-8">History</Text>

        {isLoading ? (
          <ActivityIndicator color="#10b981" />
        ) : chats && chats.length > 0 ? (
          chats.map((chat) => (
            <TouchableOpacity 
              key={chat.id}
              className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 mb-4 flex-row items-center"
              onPress={() => router.push({ pathname: '/chat', params: { id: chat.id } })}
            >
              <View className="w-12 h-12 rounded-full bg-emerald-500/10 items-center justify-center mr-4">
                <MessageSquare color="#10b981" size={20} />
              </View>
              <View className="flex-1">
                <Text className="text-white font-bold text-lg mb-1" numberOfLines={1}>{chat.title}</Text>
                <Text className="text-zinc-500 text-sm">
                  {new Date(chat.updatedAt).toLocaleDateString()}
                </Text>
              </View>
              <ChevronRight color="#52525b" size={20} />
            </TouchableOpacity>
          ))
        ) : (
          <View className="items-center justify-center py-12">
            <MessageSquare color="#52525b" size={48} className="mb-4" />
            <Text className="text-zinc-400 text-lg text-center">No analysis history yet.</Text>
            <TouchableOpacity 
              className="mt-6 bg-emerald-500/20 px-6 py-3 rounded-xl"
              onPress={() => router.push('/(tabs)/matches')}
            >
              <Text className="text-emerald-400 font-bold">Find a Match</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </ScrollView>
  );
}
