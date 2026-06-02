import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import { CityGrid } from '../components/CityGrid';
import { AuthStackParamList } from '../navigation/types';

type NavProp = NativeStackNavigationProp<AuthStackParamList, 'Login'>;

export function LoginScreen() {
  const navigation = useNavigation<NavProp>();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState<'email' | 'password' | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    setError('');
    setLoading(true);
    const success = await login(email.trim(), password);
    if (!success) setError('Email ou senha incorretos');
    setLoading(false);
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: '#0f172a' }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: 'center',
          paddingHorizontal: 24,
          paddingTop: Platform.OS === 'ios' ? 64 : 48,
          paddingBottom: 40,
        }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Identidade — grelha urbana + tipografia */}
        <View style={{ marginBottom: 32 }}>
          <CityGrid />

          <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 10, marginTop: 20, marginBottom: 8 }}>
            <Text style={{ fontSize: 46, fontWeight: '900', color: '#f8fafc', letterSpacing: 6 }}>
              AVISA
            </Text>
            <View
              style={{
                backgroundColor: '#38bdf8',
                borderRadius: 6,
                paddingHorizontal: 8,
                paddingVertical: 4,
                marginBottom: 7,
              }}
            >
              <Text style={{ fontSize: 10, fontWeight: '800', color: '#0f172a', letterSpacing: 2 }}>
                RP
              </Text>
            </View>
          </View>

          <Text style={{ fontSize: 13, color: '#64748b', letterSpacing: 0.3, lineHeight: 20 }}>
            Relate problemas urbanos{'\n'}em Ribeirão Preto
          </Text>
        </View>

        {/* Card do formulário */}
        <View
          style={{
            backgroundColor: '#1e293b',
            borderRadius: 20,
            padding: 24,
            borderWidth: 1,
            borderColor: '#334155',
            elevation: 8,
            shadowColor: '#000',
            shadowOpacity: 0.35,
            shadowRadius: 20,
            shadowOffset: { width: 0, height: 8 },
          }}
        >
          {/* Email */}
          <Text style={{
            fontSize: 10, fontWeight: '700', color: '#38bdf8',
            letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 8,
          }}>
            Email
          </Text>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: '#0f172a',
              borderWidth: 1,
              borderColor: focusedField === 'email' ? '#38bdf8' : '#334155',
              borderRadius: 12,
              paddingHorizontal: 14,
              marginBottom: 20,
            }}
          >
            <Ionicons
              name="mail-outline"
              size={18}
              color={focusedField === 'email' ? '#38bdf8' : '#475569'}
            />
            <TextInput
              style={{ flex: 1, fontSize: 15, color: '#f8fafc', paddingVertical: 13, paddingLeft: 10 }}
              placeholder="seu@email.com"
              placeholderTextColor="#475569"
              value={email}
              onChangeText={setEmail}
              onFocus={() => setFocusedField('email')}
              onBlur={() => setFocusedField(null)}
              autoCapitalize="none"
              keyboardType="email-address"
              autoComplete="email"
            />
          </View>

          {/* Senha */}
          <Text style={{
            fontSize: 10, fontWeight: '700', color: '#38bdf8',
            letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 8,
          }}>
            Senha
          </Text>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: '#0f172a',
              borderWidth: 1,
              borderColor: focusedField === 'password' ? '#38bdf8' : '#334155',
              borderRadius: 12,
              paddingHorizontal: 14,
              marginBottom: error ? 12 : 24,
            }}
          >
            <Ionicons
              name="lock-closed-outline"
              size={18}
              color={focusedField === 'password' ? '#38bdf8' : '#475569'}
            />
            <TextInput
              style={{ flex: 1, fontSize: 15, color: '#f8fafc', paddingVertical: 13, paddingLeft: 10 }}
              placeholder="••••••••"
              placeholderTextColor="#475569"
              value={password}
              onChangeText={setPassword}
              onFocus={() => setFocusedField('password')}
              onBlur={() => setFocusedField(null)}
              secureTextEntry={!showPassword}
              autoComplete="password"
            />
            <TouchableOpacity
              onPress={() => setShowPassword(prev => !prev)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons
                name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                size={18}
                color={focusedField === 'password' ? '#38bdf8' : '#475569'}
              />
            </TouchableOpacity>
          </View>

          {/* Erro */}
          {!!error && (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 20 }}>
              <Ionicons name="alert-circle-outline" size={15} color="#f87171" />
              <Text style={{ fontSize: 13, color: '#f87171' }}>{error}</Text>
            </View>
          )}

          {/* Botão */}
          <TouchableOpacity
            onPress={handleLogin}
            disabled={loading}
            style={{
              backgroundColor: loading ? '#7dd3fc' : '#0ea5e9',
              borderRadius: 12,
              paddingVertical: 16,
              alignItems: 'center',
              flexDirection: 'row',
              justifyContent: 'center',
              gap: 8,
            }}
          >
            {loading ? (
              <ActivityIndicator color="#0f172a" />
            ) : (
              <>
                <Text style={{ color: '#0f172a', fontSize: 16, fontWeight: '800' }}>Entrar</Text>
                <Ionicons name="arrow-forward" size={18} color="#0f172a" />
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Link para cadastro */}
        <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 4, marginTop: 24 }}>
          <Text style={{ fontSize: 13, color: '#64748b' }}>Não tem conta?</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <Text style={{ fontSize: 13, color: '#38bdf8', fontWeight: '600' }}>Criar conta</Text>
          </TouchableOpacity>
        </View>

        {/* Rodapé */}
        <Text style={{ fontSize: 12, color: '#475569', textAlign: 'center', marginTop: 16 }}>
          Da rua para a prefeitura
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
