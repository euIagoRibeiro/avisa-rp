import { useRef, useEffect } from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import MapView, { Region, Marker, Heatmap } from 'react-native-maps';
import { Report, ReportStatus } from '../types';

const RP_INITIAL_REGION: Region = {
  latitude: -21.1767,
  longitude: -47.8208,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
};

function statusPinColor(status: ReportStatus): string {
  if (status === 'Pendente') return '#ef4444';
  if (status === 'Analisando') return '#f59e0b';
  return '#22c55e';
}

interface MapProps {
  coordinates: { latitude: number; longitude: number } | null;
  onRegionChange: (region: Region) => void;
  onLocationPress: () => void;
  reports: Report[];
  showHeatmap: boolean;
}

export function Map({ coordinates, onRegionChange, onLocationPress, reports, showHeatmap }: MapProps) {
  const mapRef = useRef<MapView>(null);

  useEffect(() => {
    if (!coordinates || !mapRef.current) return;
    mapRef.current.animateToRegion(
      { ...coordinates, latitudeDelta: 0.01, longitudeDelta: 0.01 },
      600,
    );
  }, [coordinates]);

  return (
    <View className="flex-1">
      <MapView
        ref={mapRef}
        style={{ flex: 1 }}
        initialRegion={RP_INITIAL_REGION}
        showsUserLocation
        onRegionChangeComplete={onRegionChange}
      >
        {showHeatmap ? (
          <Heatmap
            points={reports.map((r) => ({
              latitude: r.coordinates.lat,
              longitude: r.coordinates.lon,
              weight: 1,
            }))}
          />
        ) : (
          reports.map((r) => (
            <Marker
              key={r.id}
              coordinate={{ latitude: r.coordinates.lat, longitude: r.coordinates.lon }}
              anchor={{ x: 0.5, y: 1 }}
            >
              <Ionicons name="location" size={28} color={statusPinColor(r.status)} />
            </Marker>
          ))
        )}
      </MapView>

      <View pointerEvents="none" className="absolute inset-0 items-center justify-center">
        <View className="items-center justify-center w-10 h-10">
          <View className="absolute w-px h-10 bg-blue-600 opacity-70" />
          <View className="absolute w-10 h-px bg-blue-600 opacity-70" />
          <View className="w-2.5 h-2.5 rounded-full bg-blue-600 border-2 border-white" />
        </View>
      </View>

      <TouchableOpacity
        onPress={onLocationPress}
        className="absolute bottom-6 right-4 bg-white rounded-full w-14 h-14 items-center justify-center"
        style={{ elevation: 4 }}
      >
        <Ionicons name="locate-outline" size={24} color="#2563eb" />
      </TouchableOpacity>
    </View>
  );
}
