import { useRef, useState } from 'react';
import * as Location from 'expo-location';
import { Region } from 'react-native-maps';

interface Coordinates {
  latitude: number;
  longitude: number;
}

interface NominatimAddress {
  road?: string;
  pedestrian?: string;
  house_number?: string;
  suburb?: string;
  neighbourhood?: string;
}

interface NominatimResponse {
  display_name?: string;
  address?: NominatimAddress;
}

export interface LocationManagerResult {
  address: string;
  coordinates: Coordinates | null;
  isGeocoding: boolean;
  requestLocationPermission: () => Promise<void>;
  handleRegionChange: (region: Region) => void;
}

async function reverseGeocode(lat: number, lon: number): Promise<string> {
  const response = await fetch(
    `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`,
    { headers: { 'User-Agent': 'AvisaRP/1.0 (TCC)' } },
  );
  if (!response.ok) return 'Endereço não encontrado';
  const data = (await response.json()) as NominatimResponse;
  const road = data.address?.road ?? data.address?.pedestrian ?? '';
  const num = data.address?.house_number ? `, ${data.address.house_number}` : '';
  const sub = data.address?.suburb ?? data.address?.neighbourhood ?? '';
  if (road) return `${road}${num}${sub ? ` — ${sub}` : ''}`;
  return data.display_name ?? 'Endereço não encontrado';
}

export function useLocationManager(): LocationManagerResult {
  const [address, setAddress] = useState('Toque 📍 para localizar');
  const [coordinates, setCoordinates] = useState<Coordinates | null>(null);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  async function requestLocationPermission(): Promise<void> {
    const result = await Location.requestForegroundPermissionsAsync();
    if (!result.granted) {
      setAddress('Permissão de localização negada');
      return;
    }
    setIsGeocoding(true);
    try {
      const loc = await Location.getCurrentPositionAsync({});
      const coords = { latitude: loc.coords.latitude, longitude: loc.coords.longitude };
      setCoordinates(coords);
      setAddress(await reverseGeocode(coords.latitude, coords.longitude));
    } catch {
      setAddress('Não foi possível obter a localização');
    } finally {
      setIsGeocoding(false);
    }
  }

  function handleRegionChange(region: Region): void {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    setIsGeocoding(true);
    debounceRef.current = setTimeout(() => {
      reverseGeocode(region.latitude, region.longitude)
        .then(setAddress)
        .catch(() => setAddress('Endereço não encontrado'))
        .finally(() => setIsGeocoding(false));
    }, 500);
  }

  return { address, coordinates, isGeocoding, requestLocationPermission, handleRegionChange };
}
