import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useAuth } from '../context/AuthContext';

export function LoginScreen() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    setError('');
    setLoading(true);
    await new Promise(r => setTimeout(r, 400));
    const success = login(email.trim(), password);
    if (!success) setError('Email ou senha incorretos');
    setLoading(false);
  }

  return (
    <View className="flex-1 items-center justify-center bg-white px-8">
      <Text className="text-4xl font-bold text-gray-800 mb-2">Avisa RP</Text>
      <Text className="text-gray-400 mb-12 text-base">Relate problemas urbanos</Text>

      <TextInput
        className="w-full border border-gray-200 rounded-xl px-4 py-3 mb-3 text-base bg-gray-50"
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        autoComplete="email"
      />

      <TextInput
        className="w-full border border-gray-200 rounded-xl px-4 py-3 mb-2 text-base bg-gray-50"
        placeholder="Senha"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        autoComplete="password"
      />

      {error ? (
        <Text className="text-red-500 text-sm mb-4 self-start">{error}</Text>
      ) : (
        <View className="mb-4" />
      )}

      <TouchableOpacity
        className="w-full bg-blue-600 rounded-2xl py-4 items-center"
        onPress={handleLogin}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text className="text-white text-lg font-semibold">Entrar</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}
