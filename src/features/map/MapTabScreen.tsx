import { useState } from 'react';
import { View, Text, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocationManager } from '../../hooks/useLocationManager';
import { useReports } from '../../context/ReportsContext';
import { useAuth } from '../../context/AuthContext';
import { Map } from '../../components/Map';
import { IssueModal } from '../../components/IssueModal';

export function MapTabScreen() {
  const { address, coordinates, isGeocoding, requestLocationPermission, handleRegionChange } =
    useLocationManager();
  const { reports } = useReports();
  const { user } = useAuth();
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <View className="flex-1">
      <Map
        coordinates={coordinates}
        onRegionChange={handleRegionChange}
        onLocationPress={requestLocationPermission}
        reports={reports}
        showHeatmap={showHeatmap}
      />

      <View
        className="absolute top-3 left-4 right-4 bg-white rounded-2xl px-4 py-3.5 flex-row items-center gap-2"
        style={{
          elevation: 4,
          shadowColor: '#000',
          shadowOpacity: 0.08,
          shadowRadius: 8,
          shadowOffset: { width: 0, height: 2 },
        }}
      >
        <Ionicons name="navigate-outline" size={18} color="#9ca3af" />
        {isGeocoding ? (
          <ActivityIndicator size="small" color="#2563eb" />
        ) : (
          <Text className="text-gray-700 text-base flex-1" numberOfLines={1}>
            {address}
          </Text>
        )}
      </View>

      {user?.role === 'cidadao' && (
        <TouchableOpacity
          onPress={() => setModalVisible(true)}
          className="absolute right-4 bg-blue-600 rounded-full w-14 h-14 items-center justify-center"
          style={{ bottom: 152, elevation: 4 }}
        >
          <Ionicons name="add-outline" size={28} color="white" />
        </TouchableOpacity>
      )}

      <TouchableOpacity
        onPress={() => setShowHeatmap((prev) => !prev)}
        className="absolute right-4 bg-white rounded-full w-14 h-14 items-center justify-center"
        style={{ bottom: 88, elevation: 4 }}
      >
        <Ionicons
          name={showHeatmap ? 'pin-outline' : 'radio-outline'}
          size={24}
          color="#2563eb"
        />
      </TouchableOpacity>

      <IssueModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        address={address}
        coordinates={coordinates}
      />
    </View>
  );
}
