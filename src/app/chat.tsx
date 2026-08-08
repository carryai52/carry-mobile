import { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useChat } from '@ai-sdk/react';
import { Send, ArrowLeft } from 'lucide-react-native';
import { authClient } from '../lib/auth-client';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../api/client';

export default function ChatScreen() {
  const router = useRouter();
  const { query, id, featuredMatch } = useLocalSearchParams();

  // Load chat history if ID is provided
  const { data: chatData, isLoading: isChatLoading } = useQuery({
    queryKey: ['chat', id],
    queryFn: async () => {
      if (!id) return null;
      const res = await apiClient.get(`/api/chats/${id}`);
      return res.data;
    },
    enabled: !!id,
  });

  if (id && isChatLoading) {
    return (
      <View className="flex-1 bg-zinc-950 items-center justify-center">
        <ActivityIndicator color="#10b981" />
      </View>
    );
  }

  return (
    <ChatInterface 
      initialMessages={chatData?.messages || []} 
      chatId={chatData?.chat?.id}
      initialQuery={query as string}
      featuredMatch={featuredMatch as string}
    />
  );
}

function ChatInterface({ initialMessages, chatId, initialQuery, featuredMatch }: { initialMessages: any[], chatId?: number, initialQuery?: string, featuredMatch?: string }) {
  const router = useRouter();

  const { messages, input, handleInputChange, handleSubmit, isLoading, append } = useChat({
    api: `${process.env.EXPO_PUBLIC_API_URL || 'https://aicarry.online'}/api/chat`,
    id: chatId ? String(chatId) : undefined,
    initialMessages,
    body: {
      chatId,
      mode: 'medium',
      locale: 'ru',
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      ...(featuredMatch ? { featuredMatch: JSON.parse(featuredMatch) } : {}),
    },
    fetch: async (input: any, init: any) => {
      const headers = new Headers(init?.headers);
      const cookie = await (authClient as any).getCookie();
      if (cookie) {
        headers.set('Cookie', cookie);
      }
      return fetch(input, { ...init, headers });
    }
  } as any) as any;

  // Instead of DOM hacks, we use the SDK's `append` method natively
  const initialized = useRef(false);
  useEffect(() => {
    if (initialQuery && messages.length === 0 && !initialized.current) {
      initialized.current = true;
      append({
        role: 'user',
        content: initialQuery,
      });
    }
  }, [initialQuery, messages.length, append]);

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
        
        {messages.map((m: any, index: number) => {
          const textParts = m.parts?.filter((p: any) => p.type === 'text') || [];
          const text = textParts.map((p: any) => p.text).join('\n') || m.content;
          const matchSummaries = m.parts?.filter((p: any) => p.type === 'data-matchSummary') || [];
          const clarifications = m.parts?.filter((p: any) => p.type === 'data-clarification') || [];
          const tools = m.parts?.filter((p: any) => p.type.startsWith('tool-')) || m.toolInvocations || [];
          
          return (
            <View key={m.id} className={`mb-4 w-full flex-row ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <View className={`max-w-[85%] ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
                {matchSummaries.map((summaryPart: any, idx: number) => {
                  const data = summaryPart.data;
                  return (
                    <View key={idx} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 mb-2 w-full">
                      <Text className="text-zinc-400 text-xs mb-2">{data.tournament || 'Match'}</Text>
                      <View className="flex-row items-center justify-between mb-2">
                        <Text className="text-white font-bold flex-1">{data.home?.name}</Text>
                        <Text className="text-emerald-400 font-bold ml-2">{data.home?.probability}%</Text>
                      </View>
                      <View className="flex-row items-center justify-between">
                        <Text className="text-white font-bold flex-1">{data.away?.name}</Text>
                        <Text className="text-emerald-400 font-bold ml-2">{data.away?.probability}%</Text>
                      </View>
                    </View>
                  );
                })}

                {text ? (
                  <View className={`rounded-2xl p-4 ${m.role === 'user' ? 'bg-emerald-500' : 'bg-zinc-800'}`}>
                    <Text className={`text-base ${m.role === 'user' ? 'text-white' : 'text-zinc-200'}`}>
                      {text}
                    </Text>
                  </View>
                ) : null}

                {clarifications.map((clarification: any, idx: number) => {
                  const data = clarification.data;
                  return (
                    <View key={idx} className="bg-zinc-800 rounded-2xl p-4 mt-2 w-full">
                      <Text className="text-white font-bold mb-3">{data.question}</Text>
                      {data.options.map((opt: any, oIdx: number) => (
                        <TouchableOpacity 
                          key={oIdx}
                          className="bg-zinc-700 py-3 px-4 rounded-xl mb-2"
                          onPress={() => {
                            if (opt.kind === 'send') {
                              append({ role: 'user', content: opt.value });
                            }
                          }}
                        >
                          <Text className="text-white text-center font-bold">{opt.label}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  );
                })}

                {tools.length > 0 && index === messages.length - 1 && isLoading && (
                  <View className="mt-2 bg-zinc-900 p-2 rounded-lg border border-zinc-700">
                    <Text className="text-emerald-400 text-xs font-bold">Analyzing data...</Text>
                  </View>
                )}
              </View>
            </View>
          );
        })}
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
          onSubmitEditing={() => {
            if (input.trim()) {
              append({ role: 'user', content: input });
              handleInputChange({ target: { value: '' } } as any);
            }
          }}
        />
        <TouchableOpacity 
          className={`p-3 rounded-full ${input.trim() ? 'bg-emerald-500' : 'bg-zinc-700'}`}
          disabled={!input.trim() || isLoading}
          onPress={() => {
            if (input.trim()) {
              append({ role: 'user', content: input });
              handleInputChange({ target: { value: '' } } as any);
            }
          }}
        >
          <Send color={input.trim() ? '#fff' : '#444'} size={20} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}
