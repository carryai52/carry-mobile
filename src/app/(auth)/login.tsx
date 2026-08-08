import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { authClient } from '@/lib/auth-client';
import { useRouter } from 'expo-router';

export default function LoginScreen() {
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [step, setStep] = useState<'phone' | 'code'>('phone');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const requestCode = async () => {
    try {
      setLoading(true);
      setError(null);
      // Need a proper phone formatting here, assuming clean +number for now
      const formattedPhone = phone.startsWith('+') ? phone : `+${phone}`;
      const { error: err } = await (authClient as any).phoneNumber.sendOtp({ phoneNumber: formattedPhone });
      if (err) throw err;
      setStep('code');
    } catch (err: any) {
      setError(err.message || 'Failed to send code');
    } finally {
      setLoading(false);
    }
  };

  const verifyCode = async () => {
    try {
      setLoading(true);
      setError(null);
      const formattedPhone = phone.startsWith('+') ? phone : `+${phone}`;
      const { error: err } = await (authClient as any).phoneNumber.verify({
        phoneNumber: formattedPhone,
        code,
      });
      if (err) throw err;
      router.replace('/(tabs)');
    } catch (err: any) {
      setError(err.message || 'Invalid code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 justify-center p-6 bg-zinc-950">
      <View className="bg-zinc-900 p-6 rounded-3xl border border-zinc-800">
        <Text className="text-white text-2xl font-bold mb-2 text-center">Login to Carry</Text>
        <Text className="text-zinc-400 text-center mb-6">
          {step === 'phone' ? 'Enter your phone number to get started' : 'Enter the code from Telegram'}
        </Text>

        {error && <Text className="text-red-500 text-sm mb-4 text-center">{error}</Text>}

        {step === 'phone' ? (
          <View>
            <TextInput
              className="bg-zinc-800 text-white p-4 rounded-xl mb-4 border border-zinc-700"
              placeholder="+1 234 567 890"
              placeholderTextColor="#666"
              keyboardType="phone-pad"
              value={phone}
              onChangeText={setPhone}
            />
            <TouchableOpacity 
              className="bg-emerald-500 p-4 rounded-xl items-center"
              onPress={requestCode}
              disabled={loading}
            >
              {loading ? <ActivityIndicator color="#fff" /> : <Text className="text-white font-bold">Get Code</Text>}
            </TouchableOpacity>
          </View>
        ) : (
          <View>
            <TextInput
              className="bg-zinc-800 text-white p-4 rounded-xl mb-4 border border-zinc-700 text-center tracking-widest text-xl"
              placeholder="123456"
              placeholderTextColor="#666"
              keyboardType="number-pad"
              maxLength={6}
              value={code}
              onChangeText={setCode}
            />
            <TouchableOpacity 
              className="bg-emerald-500 p-4 rounded-xl items-center mb-4"
              onPress={verifyCode}
              disabled={loading}
            >
              {loading ? <ActivityIndicator color="#fff" /> : <Text className="text-white font-bold">Verify Code</Text>}
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setStep('phone')}>
              <Text className="text-zinc-400 text-center">Change phone number</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}
