import { useEffect } from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface SuccessToastProps {
  visible: boolean;
  message?: string;
  onHide: () => void;
}

export function SuccessToast({ visible, message = 'Relato enviado com sucesso!', onHide }: SuccessToastProps) {
  useEffect(() => {
    if (!visible) return;
    const timer = setTimeout(onHide, 3000);
    return () => clearTimeout(timer);
  }, [visible]);

  if (!visible) return null;

  return (
    <View
      style={{
        position: 'absolute',
        bottom: 16,
        left: 16,
        right: 16,
        backgroundColor: '#22c55e',
        borderRadius: 16,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 14,
        gap: 10,
        elevation: 6,
        shadowColor: '#000',
        shadowOpacity: 0.15,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
      }}
    >
      <Ionicons name="checkmark-circle" size={22} color="#fff" />
      <Text style={{ flex: 1, color: '#fff', fontSize: 14, fontWeight: '600' }}>{message}</Text>
    </View>
  );
}
