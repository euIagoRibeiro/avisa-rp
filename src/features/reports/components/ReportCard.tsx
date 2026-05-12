import { View, Text, TouchableOpacity, Image } from 'react-native';
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
  const photo = report.photos[0] ?? null;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.75}
      style={{
        backgroundColor: '#fff',
        borderRadius: 16,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#f0f0f0',
        elevation: 3,
        shadowColor: '#000',
        shadowOpacity: 0.08,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 2 },
      }}
    >
      {/* Left accent bar — colored by category */}
      <View
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: 4,
          backgroundColor: color,
        }}
      />

      {/* Header: icon + category/title + status badge */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'flex-start',
          paddingTop: 14,
          paddingRight: 14,
          paddingBottom: 10,
          paddingLeft: 18,
          gap: 10,
        }}
      >
        <View
          style={{
            width: 42,
            height: 42,
            borderRadius: 10,
            backgroundColor: bg,
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <Ionicons name={icon} size={20} color={color} />
        </View>

        <View style={{ flex: 1 }}>
          <Text
            style={{
              fontSize: 10,
              fontWeight: '700',
              color,
              letterSpacing: 0.8,
              textTransform: 'uppercase',
              marginBottom: 2,
            }}
          >
            {report.category}
          </Text>
          <Text
            style={{ fontSize: 14, fontWeight: '600', color: '#111827', lineHeight: 19 }}
            numberOfLines={2}
          >
            {report.title}
          </Text>
        </View>

        <View
          style={{
            backgroundColor: badge.bg,
            borderRadius: 999,
            paddingHorizontal: 8,
            paddingVertical: 3,
            flexShrink: 0,
          }}
        >
          <Text style={{ fontSize: 11, fontWeight: '700', color: badge.color }}>
            {report.status}
          </Text>
        </View>
      </View>

      {/* Photo thumbnail — shown only when report has photos */}
      {!!photo && (
        <View
          style={{
            marginHorizontal: 14,
            marginBottom: 10,
            borderRadius: 12,
            overflow: 'hidden',
            height: 120,
          }}
        >
          <Image
            source={{ uri: photo }}
            style={{ width: '100%', height: '100%' }}
            resizeMode="cover"
          />
          <View
            style={{
              position: 'absolute',
              bottom: 8,
              right: 8,
              backgroundColor: 'rgba(0,0,0,0.50)',
              borderRadius: 999,
              flexDirection: 'row',
              alignItems: 'center',
              paddingHorizontal: 8,
              paddingVertical: 3,
            }}
          >
            <Ionicons name="camera" size={11} color="#fff" />
            <Text style={{ color: '#fff', fontSize: 10, fontWeight: '600', marginLeft: 4 }}>
              {report.photos.length} foto{report.photos.length > 1 ? 's' : ''}
            </Text>
          </View>
        </View>
      )}

      {/* Address row */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          marginHorizontal: 14,
          marginBottom: report.description ? 8 : 10,
          backgroundColor: '#f9fafb',
          borderRadius: 10,
          paddingHorizontal: 10,
          paddingVertical: 7,
        }}
      >
        <Ionicons name="location-outline" size={13} color="#9ca3af" />
        <Text
          style={{ fontSize: 12, color: '#6b7280', marginLeft: 6, flex: 1 }}
          numberOfLines={1}
        >
          {report.address}
        </Text>
      </View>

      {/* Description preview */}
      {!!report.description && (
        <Text
          style={{
            fontSize: 12,
            color: '#9ca3af',
            fontStyle: 'italic',
            marginHorizontal: 14,
            marginBottom: 10,
          }}
          numberOfLines={2}
        >
          "{report.description}"
        </Text>
      )}

      {/* Footer: date + anonymous indicator + chevron */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: 14,
          paddingBottom: 12,
        }}
      >
        <Text style={{ fontSize: 11, color: '#9ca3af' }}>{formatDate(report.createdAt)}</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          {report.isAnonymous && (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Ionicons name="eye-off-outline" size={12} color="#9ca3af" />
              <Text style={{ fontSize: 11, color: '#9ca3af' }}>Anônimo</Text>
            </View>
          )}
          <Ionicons name="chevron-forward" size={16} color="#d1d5db" />
        </View>
      </View>
    </TouchableOpacity>
  );
}
