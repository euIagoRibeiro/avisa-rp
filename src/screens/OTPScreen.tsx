import { useEffect, useRef, useState } from 'react';
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

type NavProp = NativeStackNavigationProp<AuthStackParamList, 'OTP'>;

export function OTPScreen() {
  const navigation = useNavigation<NavProp>();
  const { pendingPhone, verifyOTP } = useAuth();

  const [digits, setDigits] = useState(['', '', '', '', '', '']);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const inputs = useRef<Array<TextInput | null>>([null, null, null, null, null, null]);
  const code = digits.join('');

  useEffect(() => {
    if (countdown <= 0) { setCanResend(true); return; }
    const t = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  function handleChange(index: number, value: string) {
    const digit = value.replace(/\D/g, '').slice(-1);
    const next = [...digits];
    next[index] = digit;
    setDigits(next);
    if (digit && index < 5) inputs.current[index + 1]?.focus();
  }

  function handleKeyPress(index: number, key: string) {
    if (key === 'Backspace' && !digits[index] && index > 0) {
      const next = [...digits];
      next[index - 1] = '';
      setDigits(next);
      inputs.current[index - 1]?.focus();
    }
  }

  function handleResend() {
    setCountdown(60);
    setCanResend(false);
    setDigits(['', '', '', '', '', '']);
    setError('');
    inputs.current[0]?.focus();
  }

  async function handleVerify() {
    if (code.length < 6) { setError('Digite todos os 6 dígitos'); return; }
    setError('');
    setLoading(true);
    const ok = await verifyOTP(code);
    setLoading(false);
    if (!ok) setError('Código inválido. Tente novamente.');
  }

  const formatTime = (s: number) => `0:${s.toString().padStart(2, '0')}`;

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: '#0f172a' }}
      behavior="padding"
    >
      <ScrollView
        style={{ backgroundColor: '#0f172a' }}
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
        {/* Botão voltar */}
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 28 }}
        >
          <Ionicons name="arrow-back" size={20} color="#38bdf8" />
          <Text style={{ fontSize: 14, color: '#38bdf8', fontWeight: '600' }}>Voltar</Text>
        </TouchableOpacity>

        {/* Identidade */}
        <View style={{ marginBottom: 32 }}>
          <CityGrid />
          <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 10, marginTop: 20, marginBottom: 8 }}>
            <Text style={{ fontSize: 36, fontWeight: '900', color: '#f8fafc', letterSpacing: 4 }}>
              VERIFICAÇÃO
            </Text>
            <View style={{
              backgroundColor: '#38bdf8', borderRadius: 6,
              paddingHorizontal: 8, paddingVertical: 4, marginBottom: 6,
            }}>
              <Text style={{ fontSize: 10, fontWeight: '800', color: '#0f172a', letterSpacing: 2 }}>RP</Text>
            </View>
          </View>
          <Text style={{ fontSize: 13, color: '#64748b', letterSpacing: 0.3, lineHeight: 20 }}>
            Código enviado para{'\n'}
            <Text style={{ color: '#94a3b8', fontWeight: '600' }}>{pendingPhone ?? 'seu telefone'}</Text>
          </Text>
        </View>

        {/* Card */}
        <View style={{
          backgroundColor: '#1e293b', borderRadius: 20, padding: 24,
          borderWidth: 1, borderColor: '#334155',
          elevation: 8, shadowColor: '#000', shadowOpacity: 0.35,
          shadowRadius: 20, shadowOffset: { width: 0, height: 8 },
        }}>
          <Text style={{
            fontSize: 10, fontWeight: '700', color: '#38bdf8',
            letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 20,
          }}>
            Código de 6 dígitos
          </Text>

          {/* Inputs OTP */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 }}>
            {digits.map((digit, i) => (
              <TextInput
                key={i}
                ref={el => { inputs.current[i] = el; }}
                value={digit}
                onChangeText={v => handleChange(i, v)}
                onKeyPress={({ nativeEvent }) => handleKeyPress(i, nativeEvent.key)}
                onFocus={() => setError('')}
                maxLength={2}
                keyboardType="numeric"
                style={{
                  width: 44,
                  height: 56,
                  borderRadius: 12,
                  borderWidth: 1.5,
                  borderColor: digit ? '#38bdf8' : '#334155',
                  backgroundColor: '#0f172a',
                  color: '#f8fafc',
                  fontSize: 24,
                  fontWeight: '700',
                  textAlign: 'center',
                }}
                selectTextOnFocus
              />
            ))}
          </View>

          {/* Reenviar */}
          <View style={{ alignItems: 'center', marginBottom: error ? 16 : 24 }}>
            {canResend ? (
              <TouchableOpacity onPress={handleResend}>
                <Text style={{ fontSize: 13, color: '#38bdf8', fontWeight: '600' }}>
                  Reenviar código
                </Text>
              </TouchableOpacity>
            ) : (
              <Text style={{ fontSize: 13, color: '#475569' }}>
                Reenviar código em{' '}
                <Text style={{ color: '#64748b', fontWeight: '600' }}>{formatTime(countdown)}</Text>
              </Text>
            )}
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
            onPress={handleVerify}
            disabled={loading || code.length < 6}
            style={{
              backgroundColor: '#0ea5e9',
              borderRadius: 12, paddingVertical: 16,
              alignItems: 'center', flexDirection: 'row',
              justifyContent: 'center', gap: 8,
              opacity: loading || code.length < 6 ? 0.4 : 1,
            }}
          >
            {loading ? (
              <ActivityIndicator color="#0f172a" />
            ) : (
              <>
                <Text style={{ color: '#0f172a', fontSize: 16, fontWeight: '800' }}>Verificar</Text>
                <Ionicons name="arrow-forward" size={18} color="#0f172a" />
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Rodapé */}
        <Text style={{ fontSize: 12, color: '#475569', textAlign: 'center', marginTop: 24 }}>
          Número errado?{' '}
          <Text style={{ color: '#38bdf8', fontWeight: '600' }} onPress={() => navigation.goBack()}>
            Voltar e corrigir
          </Text>
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
