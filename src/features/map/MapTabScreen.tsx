import { useState } from 'react';
import { View, Text, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useLocationManager } from '../../hooks/useLocationManager';
import { useReports } from '../../context/ReportsContext';
import { Map } from '../../components/Map';

export function MapTabScreen() {
  const { address, coordinates, isGeocoding, requestLocationPermission, handleRegionChange } =
    useLocationManager();
  const { reports } = useReports();
  const [showHeatmap, setShowHeatmap] = useState(false);

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
        className="absolute top-3 left-4 right-4 bg-white rounded-xl px-4 py-3"
        style={{ elevation: 4 }}
      >
        {isGeocoding ? (
          <ActivityIndicator size="small" color="#2563eb" />
        ) : (
          <Text className="text-gray-700 text-sm" numberOfLines={2}>
            {address}
          </Text>
        )}
      </View>

      <TouchableOpacity
        onPress={() => setShowHeatmap((prev) => !prev)}
        className="absolute bottom-6 left-4 bg-white rounded-full px-4 h-12 items-center justify-center"
        style={{ elevation: 4 }}
      >
        <Text className="text-blue-600 font-medium text-sm">
          {showHeatmap ? 'Marcadores' : 'Heatmap'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
