import { useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import { CityGrid } from '../components/CityGrid';
import { AuthStackParamList } from '../navigation/types';

type NavProp = NativeStackNavigationProp<AuthStackParamList, 'Register'>;

function maskPhone(raw: string): string {
  const d = raw.replace(/\D/g, '').slice(0, 11);
  if (d.length <= 2) return d.length ? `(${d}` : '';
  if (d.length <= 7) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

export function RegisterScreen() {
  const navigation = useNavigation<NavProp>();
  const { register } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const emailRef = useRef<TextInput>(null);
  const phoneRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);
  const confirmRef = useRef<TextInput>(null);

  function validate(): string | null {
    if (name.trim().length < 3) return 'Nome deve ter pelo menos 3 caracteres';
    if (!email.includes('@') || !email.includes('.')) return 'Email inválido';
    if (phone.replace(/\D/g, '').length < 11) return 'Telefone deve ter 11 dígitos';
    if (password.length < 6) return 'Senha deve ter pelo menos 6 caracteres';
    if (password !== confirmPassword) return 'As senhas não coincidem';
    if (!acceptedTerms) return 'Aceite os termos de uso para continuar';
    return null;
  }

  async function handleRegister() {
    const err = validate();
    if (err) { setError(err); return; }
    setError('');
    setLoading(true);
    try {
      await register({ name: name.trim(), email: email.trim(), phone, password });
      setLoading(false);
      navigation.navigate('OTP');
    } catch (err) {
      setLoading(false);
      setError(err instanceof Error ? err.message : 'Erro ao cadastrar. Tente novamente.');
    }
  }

  const inputStyle = (field: string) => ({
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: focusedField === field ? '#38bdf8' : '#334155',
    borderRadius: 12,
    paddingHorizontal: 14,
    marginBottom: 16,
  });

  const iconColor = (field: string) => focusedField === field ? '#38bdf8' : '#475569';

  const labelStyle = {
    fontSize: 10, fontWeight: '700' as const, color: '#38bdf8',
    letterSpacing: 1.2, textTransform: 'uppercase' as const, marginBottom: 8,
  };

  const textInputStyle = {
    flex: 1, fontSize: 15, color: '#f8fafc', paddingVertical: 13, paddingLeft: 10,
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: '#0f172a' }}
      behavior="padding"
    >
      <ScrollView
        style={{ backgroundColor: '#0f172a' }}
        contentContainerStyle={{
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
        <View style={{ marginBottom: 28 }}>
          <CityGrid />
          <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 10, marginTop: 20, marginBottom: 8 }}>
            <Text style={{ fontSize: 36, fontWeight: '900', color: '#f8fafc', letterSpacing: 4 }}>
              CADASTRO
            </Text>
            <View style={{
              backgroundColor: '#38bdf8', borderRadius: 6,
              paddingHorizontal: 8, paddingVertical: 4, marginBottom: 6,
            }}>
              <Text style={{ fontSize: 10, fontWeight: '800', color: '#0f172a', letterSpacing: 2 }}>RP</Text>
            </View>
          </View>
          <Text style={{ fontSize: 13, color: '#64748b', letterSpacing: 0.3 }}>
            Crie sua conta para começar a relatar
          </Text>
        </View>

        {/* Card do formulário */}
        <View style={{
          backgroundColor: '#1e293b', borderRadius: 20, padding: 24,
          borderWidth: 1, borderColor: '#334155',
          elevation: 8, shadowColor: '#000', shadowOpacity: 0.35,
          shadowRadius: 20, shadowOffset: { width: 0, height: 8 },
        }}>
          {/* Nome */}
          <Text style={labelStyle}>Nome Completo</Text>
          <View style={inputStyle('name')}>
            <Ionicons name="person-outline" size={18} color={iconColor('name')} />
            <TextInput
              style={textInputStyle}
              placeholder="João Silva"
              placeholderTextColor="#475569"
              value={name}
              onChangeText={setName}
              onFocus={() => setFocusedField('name')}
              onBlur={() => setFocusedField(null)}
              returnKeyType="next"
              onSubmitEditing={() => emailRef.current?.focus()}
              autoCapitalize="words"
            />
          </View>

          {/* Email */}
          <Text style={labelStyle}>Email</Text>
          <View style={inputStyle('email')}>
            <Ionicons name="mail-outline" size={18} color={iconColor('email')} />
            <TextInput
              ref={emailRef}
              style={textInputStyle}
              placeholder="seu@email.com"
              placeholderTextColor="#475569"
              value={email}
              onChangeText={setEmail}
              onFocus={() => setFocusedField('email')}
              onBlur={() => setFocusedField(null)}
              returnKeyType="next"
              onSubmitEditing={() => phoneRef.current?.focus()}
              autoCapitalize="none"
              keyboardType="email-address"
              autoComplete="email"
            />
          </View>

          {/* Telefone */}
          <Text style={labelStyle}>Telefone</Text>
          <View style={inputStyle('phone')}>
            <Ionicons name="call-outline" size={18} color={iconColor('phone')} />
            <TextInput
              ref={phoneRef}
              style={textInputStyle}
              placeholder="(16) 99999-9999"
              placeholderTextColor="#475569"
              value={phone}
              onChangeText={(v) => setPhone(maskPhone(v))}
              onFocus={() => setFocusedField('phone')}
              onBlur={() => setFocusedField(null)}
              returnKeyType="next"
              onSubmitEditing={() => passwordRef.current?.focus()}
              keyboardType="phone-pad"
            />
          </View>

          {/* Senha */}
          <Text style={labelStyle}>Senha</Text>
          <View style={inputStyle('password')}>
            <Ionicons name="lock-closed-outline" size={18} color={iconColor('password')} />
            <TextInput
              ref={passwordRef}
              style={textInputStyle}
              placeholder="••••••••"
              placeholderTextColor="#475569"
              value={password}
              onChangeText={setPassword}
              onFocus={() => setFocusedField('password')}
              onBlur={() => setFocusedField(null)}
              returnKeyType="next"
              onSubmitEditing={() => confirmRef.current?.focus()}
              secureTextEntry={!showPassword}
              autoComplete="new-password"
            />
            <TouchableOpacity onPress={() => setShowPassword(p => !p)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={18} color={iconColor('password')} />
            </TouchableOpacity>
          </View>

          {/* Confirmar senha */}
          <Text style={labelStyle}>Confirmar Senha</Text>
          <View style={{ ...inputStyle('confirm'), marginBottom: 20 }}>
            <Ionicons name="lock-closed-outline" size={18} color={iconColor('confirm')} />
            <TextInput
              ref={confirmRef}
              style={textInputStyle}
              placeholder="••••••••"
              placeholderTextColor="#475569"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              onFocus={() => setFocusedField('confirm')}
              onBlur={() => setFocusedField(null)}
              returnKeyType="done"
              secureTextEntry={!showConfirm}
              autoComplete="new-password"
            />
            <TouchableOpacity onPress={() => setShowConfirm(p => !p)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Ionicons name={showConfirm ? 'eye-off-outline' : 'eye-outline'} size={18} color={iconColor('confirm')} />
            </TouchableOpacity>
          </View>

          {/* Termos de uso */}
          <TouchableOpacity
            onPress={() => setAcceptedTerms(p => !p)}
            style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: error ? 16 : 24 }}
            activeOpacity={0.7}
          >
            <View style={{
              width: 20, height: 20, borderRadius: 5, borderWidth: 1.5,
              borderColor: acceptedTerms ? '#38bdf8' : '#475569',
              backgroundColor: acceptedTerms ? '#38bdf8' : 'transparent',
              alignItems: 'center', justifyContent: 'center',
            }}>
              {acceptedTerms && <Ionicons name="checkmark" size={13} color="#0f172a" />}
            </View>
            <Text style={{ fontSize: 13, color: '#94a3b8', flex: 1 }}>
              Li e aceito os{' '}
              <Text
                style={{ color: '#38bdf8', fontWeight: '600' }}
                onPress={() => Alert.alert('Termos de Uso', 'Os termos de uso estarão disponíveis em breve.')}
              >
                Termos de Uso
              </Text>
            </Text>
          </TouchableOpacity>

          {/* Erro */}
          {!!error && (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 20 }}>
              <Ionicons name="alert-circle-outline" size={15} color="#f87171" />
              <Text style={{ fontSize: 13, color: '#f87171', flex: 1 }}>{error}</Text>
            </View>
          )}

          {/* Botão */}
          <TouchableOpacity
            onPress={handleRegister}
            disabled={loading}
            style={{
              backgroundColor: '#0ea5e9',
              borderRadius: 12, paddingVertical: 16,
              alignItems: 'center', flexDirection: 'row',
              justifyContent: 'center', gap: 8,
              opacity: loading ? 0.6 : 1,
            }}
          >
            {loading ? (
              <ActivityIndicator color="#0f172a" />
            ) : (
              <>
                <Text style={{ color: '#0f172a', fontSize: 16, fontWeight: '800' }}>Criar conta</Text>
                <Ionicons name="arrow-forward" size={18} color="#0f172a" />
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Link para login */}
        <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 4, marginTop: 24 }}>
          <Text style={{ fontSize: 13, color: '#64748b' }}>Já tenho uma conta.</Text>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={{ fontSize: 13, color: '#38bdf8', fontWeight: '600' }}>Entrar</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
