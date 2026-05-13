import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useReports } from '../context/ReportsContext';
import { useAuth } from '../context/AuthContext';
import { useReportsFilter } from '../hooks/useReportsFilter';
import { ReportCard } from '../features/reports/components/ReportCard';
import { EmptyState } from '../features/reports/components/EmptyState';
import { ReportDetailModal } from '../components/ReportDetailModal';
import { Report, ReportStatus } from '../types';

const FILTERS: Array<{ label: string; value: ReportStatus | 'Todos'; dot?: string }> = [
  { label: 'Todos',      value: 'Todos' },
  { label: 'Pendente',   value: 'Pendente',   dot: '#ef4444' },
  { label: 'Analisando', value: 'Analisando', dot: '#f59e0b' },
  { label: 'Resolvido',  value: 'Resolvido',  dot: '#22c55e' },
];

export function ReportsScreen() {
  const { reports, loading } = useReports();
  const { user } = useAuth();
  const isAdmin = user!.role === 'admin';
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const { filtered, search, setSearch, activeFilter, setActiveFilter, stats } = useReportsFilter(
    reports,
    user!.id,
    isAdmin,
  );

  function countFor(value: ReportStatus | 'Todos'): number {
    if (value === 'Todos')      return stats.total;
    if (value === 'Pendente')   return stats.pendente;
    if (value === 'Analisando') return stats.analisando;
    return stats.resolvido;
  }

  return (
    <View className="flex-1 bg-gray-50">
      {/* Contextual header */}
      <View className="bg-white px-4 pt-4 pb-3 border-b border-gray-100">
        {/* Title + total count */}
        <View className="mb-3">
          <Text className="text-xl font-bold text-gray-900">
            {isAdmin ? 'Painel Admin' : 'Meus Relatos'}
          </Text>
          <Text className="text-xs text-gray-400 mt-0.5">
            {stats.total} {stats.total === 1 ? 'relato registrado' : 'relatos registrados'}
          </Text>
        </View>

        {/* Admin stats — quick overview of pending/resolved counts */}
        {isAdmin && (
          <View className="flex-row gap-2 mb-3">
            <View className="flex-1 bg-gray-50 rounded-xl p-2.5 items-center border border-gray-100">
              <Text className="text-xl font-black text-gray-800">{stats.total}</Text>
              <Text className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide">Total</Text>
            </View>
            <View className="flex-1 bg-red-50 rounded-xl p-2.5 items-center border border-red-100">
              <Text className="text-xl font-black text-red-600">{stats.pendente}</Text>
              <Text className="text-[10px] text-red-400 font-semibold uppercase tracking-wide">Pendentes</Text>
            </View>
            <View className="flex-1 bg-green-50 rounded-xl p-2.5 items-center border border-green-100">
              <Text className="text-xl font-black text-green-600">{stats.resolvido}</Text>
              <Text className="text-[10px] text-green-400 font-semibold uppercase tracking-wide">Resolvidos</Text>
            </View>
          </View>
        )}

        {/* Search bar */}
        <View className="flex-row items-center bg-gray-100 rounded-xl px-3 py-2.5 gap-2">
          <Ionicons name="search-outline" size={18} color="#9ca3af" />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Buscar por título, categoria ou endereço"
            placeholderTextColor="#9ca3af"
            className="flex-1 text-sm text-gray-900"
            returnKeyType="search"
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Ionicons name="close-circle" size={18} color="#9ca3af" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Filter chips */}
      <View className="bg-white border-b border-gray-100">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 10, gap: 8 }}
        >
          {FILTERS.map(({ label, value, dot }) => {
            const active = activeFilter === value;
            return (
              <TouchableOpacity
                key={value}
                onPress={() => setActiveFilter(value)}
                className={`flex-row items-center px-3.5 py-1.5 rounded-full border ${
                  active ? 'bg-blue-600 border-blue-600' : 'bg-white border-gray-200'
                }`}
              >
                {!!dot && !active && (
                  <View
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: 3,
                      backgroundColor: dot,
                      marginRight: 5,
                    }}
                  />
                )}
                <Text
                  className={`text-sm font-medium ${
                    active ? 'text-white' : 'text-gray-600'
                  }`}
                >
                  {label} ({countFor(value)})
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* List */}
      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#2563eb" />
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(r) => r.id}
          renderItem={({ item }) => (
            <ReportCard report={item} onPress={() => setSelectedReport(item)} />
          )}
          contentContainerStyle={{ padding: 16 }}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
          ListEmptyComponent={<EmptyState />}
          showsVerticalScrollIndicator={false}
        />
      )}
      <ReportDetailModal
        report={selectedReport}
        onClose={() => setSelectedReport(null)}
      />
    </View>
  );
}
