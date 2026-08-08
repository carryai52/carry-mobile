import { useState } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Search, Trophy } from 'lucide-react-native';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/api/client';

export default function MatchesScreen() {
  const router = useRouter();
  const [search, setSearch] = useState('');

  const { data: featured, isLoading } = useQuery({
    queryKey: ['featured-match'],
    queryFn: async () => {
      const res = await apiClient.get('/api/sports/featured-match');
      return res.data?.match;
    },
  });

  const { data: slate, isLoading: isSlateLoading } = useQuery({
    queryKey: ['slate'],
    queryFn: async () => {
      const res = await apiClient.get('/api/sports/slate');
      return res.data?.matches || [];
    },
  });

  const handleSearch = () => {
    if (search.trim()) {
      router.push({ pathname: '/chat', params: { query: search } });
    }
  };

  return (
    <ScrollView className="flex-1 bg-zinc-950">
      <View className="px-6 py-12 pt-20">
        <Text className="text-white text-3xl font-bold mb-6">Find Match</Text>
        
        <View className="flex-row bg-zinc-900 border border-zinc-800 rounded-2xl items-center px-4 py-2 mb-8">
          <Search color="#a1a1aa" size={20} />
          <TextInput 
            className="flex-1 text-white p-3 ml-2"
            placeholder="e.g. Real Madrid vs Barcelona"
            placeholderTextColor="#666"
            value={search}
            onChangeText={setSearch}
            onSubmitEditing={handleSearch}
          />
        </View>

        <Text className="text-white text-xl font-bold mb-4 flex-row items-center">
          <Trophy color="#f59e0b" size={20} className="mr-2" /> Featured Match
        </Text>

        {isLoading ? (
          <ActivityIndicator color="#10b981" className="mt-4 mb-8" />
        ) : featured ? (
          <TouchableOpacity 
            className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 mb-8"
            onPress={() => router.push({ pathname: '/chat', params: { query: featured.prompt, featuredMatch: JSON.stringify(featured) } })}
          >
            <View className="flex-row justify-between mb-4">
              <Text className="text-emerald-400 text-sm font-bold">{featured.tournament}</Text>
              <Text className="text-zinc-400 text-sm">{new Date(featured.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</Text>
            </View>
            <Text className="text-white text-xl font-bold mb-2">{featured.home} vs {featured.away}</Text>
            <Text className="text-zinc-400 text-sm">{featured.label}</Text>
            <View className="bg-emerald-500/20 self-start mt-4 px-4 py-2 rounded-lg">
              <Text className="text-emerald-400 font-bold">Analyze Match</Text>
            </View>
          </TouchableOpacity>
        ) : (
          <Text className="text-zinc-500 mb-8">No featured matches available right now.</Text>
        )}

        <Text className="text-white text-xl font-bold mb-4">Upcoming Matches</Text>
        {isSlateLoading ? (
          <ActivityIndicator color="#10b981" className="mt-4" />
        ) : slate && slate.length > 0 ? (
          slate.map((match: any) => (
            <TouchableOpacity 
              key={match.id}
              className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 mb-4"
              onPress={() => router.push({ pathname: '/chat', params: { query: `${match.home} vs ${match.away}` } })}
            >
              <View className="flex-row justify-between mb-2">
                <Text className="text-zinc-400 text-xs font-bold uppercase">{match.sport} • {match.tournament}</Text>
                <Text className="text-zinc-500 text-xs">{new Date(match.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</Text>
              </View>
              <Text className="text-white font-bold">{match.home} vs {match.away}</Text>
            </TouchableOpacity>
          ))
        ) : (
          <Text className="text-zinc-500">No upcoming matches available right now.</Text>
        )}
      </View>
    </ScrollView>
  );
}
