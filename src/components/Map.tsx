import { useRef, useEffect } from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import MapView, { Region, UrlTile } from 'react-native-maps';

const RP_INITIAL_REGION: Region = {
  latitude: -21.1767,
  longitude: -47.8208,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
};

const CARTO_VOYAGER =
  'https://a.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png';

interface MapProps {
  coordinates: { latitude: number; longitude: number } | null;
  onRegionChange: (region: Region) => void;
  onLocationPress: () => void;
}

export function Map({ coordinates, onRegionChange, onLocationPress }: MapProps) {
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
        mapType="none"
        initialRegion={RP_INITIAL_REGION}
        showsUserLocation
        onRegionChangeComplete={onRegionChange}
      >
        <UrlTile urlTemplate={CARTO_VOYAGER} maximumZ={19} flipY={false} />
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
        className="absolute bottom-6 right-4 bg-white rounded-full w-12 h-12 items-center justify-center"
        style={{ elevation: 4 }}
      >
        <Text className="text-2xl">📍</Text>
      </TouchableOpacity>
    </View>
  );
}
