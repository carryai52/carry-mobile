import { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useChat } from '@ai-sdk/react';
import * as SecureStore from 'expo-secure-store';
import { Send, ArrowLeft } from 'lucide-react-native';

export default function ChatScreen() {
  const router = useRouter();
  const { query, id } = useLocalSearchParams();
  const [sessionToken, setSessionToken] = useState<string | null>(null);

  useEffect(() => {
    SecureStore.getItemAsync('carry_auth_session_token').then(setSessionToken);
  }, []);

  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: `${process.env.EXPO_PUBLIC_API_URL || 'https://aicarry.online'}/api/chat`,
    id: id ? String(id) : undefined,
    initialMessages: [],
    fetch: async (input: any, init: any) => {
      const headers = new Headers(init?.headers);
      if (sessionToken) {
        headers.set('Authorization', `Bearer ${sessionToken}`);
      }
      return fetch(input, { ...init, headers });
    }
  } as any) as any;

  // If there's an initial query and no messages yet, we could trigger a submit
  const initialized = useRef(false);
  useEffect(() => {
    if (query && typeof query === 'string' && messages.length === 0 && !initialized.current) {
      initialized.current = true;
      handleInputChange({ target: { value: query } } as any);
      // Wait for state to update, then submit
      setTimeout(() => {
        handleSubmit(new Event('submit') as any, { data: { analysisMode: 'medium' } });
      }, 100);
    }
  }, [query, messages.length, handleInputChange, handleSubmit]);

  const scrollViewRef = useRef<ScrollView>(null);

  return (
    <KeyboardAvoidingView 
      className="flex-1 bg-zinc-950" 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View className="flex-row items-center p-4 pt-12 border-b border-zinc-800 bg-zinc-900">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <ArrowLeft color="#fff" size={24} />
        </TouchableOpacity>
        <Text className="text-white text-xl font-bold">Carry AI</Text>
      </View>

      <ScrollView 
        ref={scrollViewRef}
        className="flex-1 p-4"
        contentContainerStyle={{ paddingBottom: 20 }}
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
      >
        {messages.length === 0 && !isLoading && (
          <View className="flex-1 items-center justify-center mt-20">
            <Text className="text-zinc-500 text-center">Ask about any match or team.</Text>
          </View>
        )}
        
        {messages.map((m: any) => (
          <View 
            key={m.id} 
            className={`mb-4 max-w-[85%] rounded-2xl p-4 ${m.role === 'user' ? 'bg-emerald-500 self-end' : 'bg-zinc-800 self-start'}`}
          >
            <Text className={`text-base ${m.role === 'user' ? 'text-white' : 'text-zinc-200'}`}>
              {m.content}
            </Text>
            {m.toolInvocations && m.toolInvocations.map((tool: any) => (
              <View key={tool.toolCallId} className="mt-2 bg-zinc-900 p-2 rounded-lg border border-zinc-700">
                <Text className="text-emerald-400 text-xs font-bold">
                  {tool.toolName === 'search' ? 'Searching web...' : 'Analyzing data...'}
                </Text>
              </View>
            ))}
          </View>
        ))}
        {isLoading && messages[messages.length - 1]?.role === 'user' && (
          <View className="bg-zinc-800 self-start rounded-2xl p-4 mb-4">
            <ActivityIndicator color="#10b981" />
          </View>
        )}
      </ScrollView>

      <View className="p-4 bg-zinc-900 border-t border-zinc-800 flex-row items-center">
        <TextInput
          className="flex-1 bg-zinc-800 text-white rounded-full px-4 py-3 mr-2 border border-zinc-700"
          placeholder="Type your message..."
          placeholderTextColor="#666"
          value={input}
          onChangeText={(text) => handleInputChange({ target: { value: text } } as any)}
          onSubmitEditing={() => handleSubmit(new Event('submit') as any, { data: { analysisMode: 'medium' } })}
        />
        <TouchableOpacity 
          className={`p-3 rounded-full ${input.trim() ? 'bg-emerald-500' : 'bg-zinc-700'}`}
          disabled={!input.trim() || isLoading}
          onPress={() => handleSubmit(new Event('submit') as any, { data: { analysisMode: 'medium' } })}
        >
          <Send color={input.trim() ? '#fff' : '#444'} size={20} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}
