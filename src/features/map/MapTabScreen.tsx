import { View, Text, ActivityIndicator } from 'react-native';
import { useLocationManager } from '../../hooks/useLocationManager';
import { Map } from '../../components/Map';

export function MapTabScreen() {
  const { address, coordinates, isGeocoding, requestLocationPermission, handleRegionChange } =
    useLocationManager();

  return (
    <View className="flex-1">
      <Map
        coordinates={coordinates}
        onRegionChange={handleRegionChange}
        onLocationPress={requestLocationPermission}
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
    </View>
  );
}
