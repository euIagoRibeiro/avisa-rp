import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Report, ReportStatus } from '../../../types';

const CATEGORY_ICON: Record<string, string> = {
  'Buraco':             'construct-outline',
  'Iluminação Pública': 'bulb-outline',
  'Lixo':               'trash-outline',
  'Poda de Árvore':     'leaf-outline',
  'Foco de Dengue':     'water-outline',
  'Sinalização':        'warning-outline',
  'Vazamento de Água':  'rainy-outline',
  'Calçada Danificada': 'walk-outline',
  'Outros':             'help-circle-outline',
};

const CATEGORY_COLOR: Record<string, string> = {
  'Buraco':             '#ef4444',
  'Iluminação Pública': '#f59e0b',
  'Lixo':               '#10b981',
  'Poda de Árvore':     '#22c55e',
  'Foco de Dengue':     '#0891b2',
  'Sinalização':        '#a855f7',
  'Vazamento de Água':  '#3b82f6',
  'Calçada Danificada': '#f97316',
  'Outros':             '#6b7280',
};

const CATEGORY_BG: Record<string, string> = {
  'Buraco':             '#fee2e2',
  'Iluminação Pública': '#fef3c7',
  'Lixo':               '#d1fae5',
  'Poda de Árvore':     '#dcfce7',
  'Foco de Dengue':     '#cffafe',
  'Sinalização':        '#f3e8ff',
  'Vazamento de Água':  '#dbeafe',
  'Calçada Danificada': '#ffedd5',
  'Outros':             '#f3f4f6',
};

function statusBadge(status: ReportStatus) {
  if (status === 'Pendente')   return { color: '#ef4444', bg: '#fee2e2' };
  if (status === 'Analisando') return { color: '#f59e0b', bg: '#fef3c7' };
  return                              { color: '#22c55e', bg: '#dcfce7' };
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

interface ReportCardProps {
  report: Report;
  onPress?: () => void;
}

export function ReportCard({ report, onPress }: ReportCardProps) {
  const icon  = (CATEGORY_ICON[report.category]  ?? 'help-circle-outline') as any;
  const color =  CATEGORY_COLOR[report.category] ?? '#6b7280';
  const bg    =  CATEGORY_BG[report.category]    ?? '#f3f4f6';
  const badge = statusBadge(report.status);

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
      className="bg-white rounded-2xl p-4 flex-row items-start gap-3"
      style={{
        elevation: 1,
        shadowColor: '#000',
        shadowOpacity: 0.06,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 1 },
      }}
    >
      <View
        className="w-10 h-10 rounded-full items-center justify-center flex-shrink-0"
        style={{ backgroundColor: bg }}
      >
        <Ionicons name={icon} size={20} color={color} />
      </View>

      <View className="flex-1">
        <View className="flex-row items-start justify-between gap-2 mb-0.5">
          <Text className="text-gray-900 font-semibold text-sm flex-1" numberOfLines={2}>
            {report.title}
          </Text>
          <View className="rounded-full px-2 py-0.5 flex-shrink-0" style={{ backgroundColor: badge.bg }}>
            <Text style={{ color: badge.color, fontSize: 11, fontWeight: '600' }}>
              {report.status}
            </Text>
          </View>
        </View>
        <Text className="text-gray-500 text-xs mb-0.5" numberOfLines={1}>
          {report.address}
        </Text>
        <Text className="text-gray-400 text-xs">{formatDate(report.createdAt)}</Text>
      </View>
    </TouchableOpacity>
  );
}
