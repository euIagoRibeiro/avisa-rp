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
import { ReportStatus } from '../types';

const FILTERS: Array<{ label: string; value: ReportStatus | 'Todos' }> = [
  { label: 'Todos',      value: 'Todos' },
  { label: 'Pendente',   value: 'Pendente' },
  { label: 'Analisando', value: 'Analisando' },
  { label: 'Resolvido',  value: 'Resolvido' },
];

export function ReportsScreen() {
  const { reports, loading } = useReports();
  const { user } = useAuth();
  const { filtered, search, setSearch, activeFilter, setActiveFilter, stats } = useReportsFilter(
    reports,
    user!.id,
    user!.role === 'admin',
  );

  function countFor(value: ReportStatus | 'Todos'): number {
    if (value === 'Todos')      return stats.total;
    if (value === 'Pendente')   return stats.pendente;
    if (value === 'Analisando') return stats.analisando;
    return stats.resolvido;
  }

  return (
    <View className="flex-1 bg-gray-50">
      {/* Search bar */}
      <View className="bg-white px-4 pt-3 pb-3 border-b border-gray-100">
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

      {/* Filter tabs */}
      <View className="bg-white border-b border-gray-100">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 10, gap: 8 }}
        >
          {FILTERS.map(({ label, value }) => (
            <TouchableOpacity
              key={value}
              onPress={() => setActiveFilter(value)}
              className={`px-3.5 py-1.5 rounded-full border ${
                activeFilter === value ? 'bg-blue-600 border-blue-600' : 'bg-white border-gray-200'
              }`}
            >
              <Text
                className={`text-sm font-medium ${
                  activeFilter === value ? 'text-white' : 'text-gray-600'
                }`}
              >
                {label} ({countFor(value)})
              </Text>
            </TouchableOpacity>
          ))}
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
          renderItem={({ item }) => <ReportCard report={item} />}
          contentContainerStyle={{ padding: 16 }}
          ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
          ListEmptyComponent={<EmptyState />}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}
