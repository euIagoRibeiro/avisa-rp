import { useState } from 'react';
import * as Haptics from 'expo-haptics';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Switch,
  Image,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CATEGORIES } from '../constants/categories';
import { useIssueForm } from '../hooks/useIssueForm';

const CATEGORY_META: Record<string, { icon: string; color: string; bg: string; bgSelected: string }> = {
  'Buraco':             { icon: 'construct-outline',     color: '#ef4444', bg: '#fee2e2', bgSelected: '#fecaca' },
  'Iluminação Pública': { icon: 'bulb-outline',          color: '#f59e0b', bg: '#fef3c7', bgSelected: '#fde68a' },
  'Lixo':               { icon: 'trash-outline',         color: '#10b981', bg: '#d1fae5', bgSelected: '#a7f3d0' },
  'Poda de Árvore':     { icon: 'leaf-outline',          color: '#22c55e', bg: '#dcfce7', bgSelected: '#bbf7d0' },
  'Foco de Dengue':     { icon: 'water-outline',         color: '#0891b2', bg: '#cffafe', bgSelected: '#a5f3fc' },
  'Sinalização':        { icon: 'warning-outline',       color: '#a855f7', bg: '#f3e8ff', bgSelected: '#e9d5ff' },
  'Vazamento de Água':  { icon: 'rainy-outline',         color: '#3b82f6', bg: '#dbeafe', bgSelected: '#bfdbfe' },
  'Calçada Danificada': { icon: 'walk-outline',          color: '#f97316', bg: '#ffedd5', bgSelected: '#fed7aa' },
  'Outros':             { icon: 'help-circle-outline',   color: '#6b7280', bg: '#f3f4f6', bgSelected: '#e5e7eb' },
};

interface IssueModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  address: string;
  coordinates: { latitude: number; longitude: number } | null;
}

export function IssueModal({ visible, onClose, onSuccess, address, coordinates }: IssueModalProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const { form, setField, pickImage, isValid, submit, reset } = useIssueForm();
  const [submitting, setSubmitting] = useState(false);

  function handleClose() {
    reset();
    setStep(1);
    onClose();
  }

  async function handleSubmit() {
    if (!coordinates || !isValid()) return;
    setSubmitting(true);
    await submit(address, coordinates);
    setSubmitting(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onSuccess?.();
    handleClose();
  }

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={handleClose}>
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View className="flex-1 justify-end">
          <View className="bg-white rounded-t-3xl" style={{ maxHeight: '90%' }}>
            <View className="flex-row items-center justify-between px-5 pt-5 pb-3">
              <Text className="text-lg font-semibold text-gray-900">
                {step === 1 ? 'Confirmar local' : 'Novo relato'}
              </Text>
              <TouchableOpacity onPress={handleClose}>
                <Ionicons name="close" size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>

            {step === 1 ? (
              <View className="px-5 pb-8">
                <View className="bg-blue-50 rounded-2xl p-4 mb-6 flex-row items-start gap-3">
                  <Ionicons name="location" size={22} color="#2563eb" style={{ marginTop: 2 }} />
                  <View className="flex-1">
                    <Text className="text-blue-800 font-medium mb-0.5">Local do relato</Text>
                    <Text className="text-blue-700 text-sm">{address}</Text>
                  </View>
                </View>
                <Text className="text-gray-500 text-sm text-center mb-6">
                  O relato será registrado no local onde o mapa está centralizado.
                </Text>
                <View className="flex-row gap-3">
                  <TouchableOpacity
                    onPress={handleClose}
                    className="flex-1 py-3.5 rounded-2xl border border-gray-200 items-center"
                  >
                    <Text className="text-gray-600 font-medium">Cancelar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                      setStep(2);
                    }}
                    className="flex-1 py-3.5 rounded-2xl bg-blue-600 items-center"
                  >
                    <Text className="text-white font-medium">Confirmar →</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <ScrollView
                className="px-5"
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
              >
                <Text className="text-sm font-medium text-gray-700 mb-1.5">
                  Título <Text className="text-red-500">*</Text>
                </Text>
                <TextInput
                  value={form.title}
                  onChangeText={(v) => setField('title', v)}
                  placeholder="Ex: Buraco na calçada"
                  placeholderTextColor="#9ca3af"
                  className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 text-sm mb-4"
                  maxLength={80}
                />

                <Text className="text-sm font-medium text-gray-700 mb-1.5">
                  Categoria <Text className="text-red-500">*</Text>
                </Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  className="mb-4"
                  contentContainerStyle={{ gap: 10, paddingRight: 4 }}
                >
                  {CATEGORIES.map((cat) => {
                    const meta = CATEGORY_META[cat];
                    const selected = form.category === cat;
                    return (
                      <TouchableOpacity
                        key={cat}
                        onPress={() => setField('category', cat)}
                        style={{
                          width: 80,
                          height: 72,
                          borderRadius: 16,
                          backgroundColor: selected ? meta.bgSelected : meta.bg,
                          borderWidth: 2,
                          borderColor: selected ? '#2563eb' : 'transparent',
                          alignItems: 'center',
                          justifyContent: 'center',
                          paddingHorizontal: 6,
                        }}
                      >
                        <Ionicons name={meta.icon as any} size={22} color={meta.color} />
                        <Text
                          numberOfLines={2}
                          style={{
                            fontSize: 11,
                            fontWeight: '600',
                            color: meta.color,
                            textAlign: 'center',
                            marginTop: 4,
                          }}
                        >
                          {cat}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>

                <Text className="text-sm font-medium text-gray-700 mb-1.5">Descrição</Text>
                <TextInput
                  value={form.description}
                  onChangeText={(v) => setField('description', v)}
                  placeholder="Descreva o problema com mais detalhes (opcional)"
                  placeholderTextColor="#9ca3af"
                  multiline
                  numberOfLines={3}
                  className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 text-sm mb-4"
                  style={{ textAlignVertical: 'top' }}
                  maxLength={500}
                />

                <Text className="text-sm font-medium text-gray-700 mb-1.5">Foto</Text>
                {form.photo ? (
                  <View className="mb-4 relative">
                    <Image
                      source={{ uri: form.photo }}
                      className="w-full h-40 rounded-xl"
                      resizeMode="cover"
                    />
                    <TouchableOpacity
                      onPress={() => setField('photo', null)}
                      className="absolute top-2 right-2 bg-black/50 rounded-full w-7 h-7 items-center justify-center"
                    >
                      <Ionicons name="close" size={16} color="white" />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity
                    onPress={pickImage}
                    className="border border-dashed border-gray-300 rounded-xl py-5 items-center mb-4"
                  >
                    <Ionicons name="image-outline" size={28} color="#9ca3af" />
                    <Text className="text-gray-400 text-sm mt-1">Adicionar foto</Text>
                  </TouchableOpacity>
                )}

                <View className="flex-row items-center justify-between py-3 mb-6">
                  <View>
                    <Text className="text-sm font-medium text-gray-700">Enviar anonimamente</Text>
                    <Text className="text-xs text-gray-400 mt-0.5">Seu nome não será exibido</Text>
                  </View>
                  <Switch
                    value={form.isAnonymous}
                    onValueChange={(v) => setField('isAnonymous', v)}
                    trackColor={{ false: '#e5e7eb', true: '#93c5fd' }}
                    thumbColor={form.isAnonymous ? '#2563eb' : '#f9fafb'}
                  />
                </View>

                <TouchableOpacity
                  onPress={handleSubmit}
                  disabled={!isValid() || submitting}
                  className={`py-4 rounded-2xl items-center mb-8 ${
                    isValid() && !submitting ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                >
                  {submitting ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <Text
                      className={`font-semibold text-base ${
                        isValid() ? 'text-white' : 'text-gray-400'
                      }`}
                    >
                      Enviar Relato
                    </Text>
                  )}
                </TouchableOpacity>
              </ScrollView>
            )}
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
