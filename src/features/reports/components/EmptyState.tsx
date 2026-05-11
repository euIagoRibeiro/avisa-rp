import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface EmptyStateProps {
  message?: string;
}

export function EmptyState({ message = 'Nenhum relato encontrado' }: EmptyStateProps) {
  return (
    <View className="flex-1 items-center justify-center py-20">
      <Ionicons name="clipboard-outline" size={48} color="#d1d5db" />
      <Text className="text-gray-500 text-base font-medium mt-4">{message}</Text>
      <Text className="text-gray-400 text-sm mt-1">Tente ajustar os filtros ou a busca</Text>
    </View>
  );
}
