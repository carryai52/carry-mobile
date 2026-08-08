import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

export default function HomeScreen() {
  const router = useRouter();

  return (
    <ScrollView className="flex-1 bg-zinc-950">
      <View className="px-6 py-12 pt-20">
        <Text className="text-white text-3xl font-bold mb-2">Carry AI</Text>
        <Text className="text-zinc-400 mb-8">Select a sport to start forecasting.</Text>

        <TouchableOpacity 
          className="bg-zinc-900 p-6 rounded-3xl border border-zinc-800 mb-4"
          onPress={() => router.push('/(tabs)/matches')}
        >
          <Text className="text-white text-xl font-bold mb-2">Football</Text>
          <Text className="text-zinc-400">Analysis and predictions for top football leagues</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          className="bg-emerald-500/10 p-6 rounded-3xl border border-emerald-500/20"
          onPress={() => router.push('/chat')}
        >
          <Text className="text-emerald-400 text-xl font-bold mb-2">Ask Carry AI</Text>
          <Text className="text-emerald-500/70">Chat with the intelligent assistant about any match</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
