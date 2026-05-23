import { useState } from 'react';
import { View, Text, ActivityIndicator, TouchableOpacity, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { useLocationManager } from '../../hooks/useLocationManager';
import { useReports } from '../../context/ReportsContext';
import { useAuth } from '../../context/AuthContext';
import { Map } from '../../components/Map';
import { IssueModal } from '../../components/IssueModal';
import { SuccessToast } from '../../components/SuccessToast';

export function MapTabScreen() {
  const { address, coordinates, isGeocoding, requestLocationPermission, handleRegionChange } =
    useLocationManager();
  const { reports } = useReports();
  const { user } = useAuth();
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [showToast, setShowToast] = useState(false);

  return (
    <View className="flex-1">
      <Map
        coordinates={coordinates}
        onRegionChange={handleRegionChange}
        onLocationPress={requestLocationPermission}
        reports={reports}
        showHeatmap={showHeatmap}
      />

      <View style={styles.addressBar}>
        <View style={styles.iconColumn}>
          <Ionicons name="navigate-outline" size={18} color="#0ea5e9" />
        </View>
        <View style={styles.separator} />
        <View style={styles.textArea}>
          {isGeocoding ? (
            <ActivityIndicator size="small" color="#0ea5e9" />
          ) : (
            <Text style={styles.addressText} numberOfLines={1} ellipsizeMode="tail">
              {address}
            </Text>
          )}
        </View>
      </View>

      {user?.role === 'cidadao' && (
        <TouchableOpacity
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setModalVisible(true);
          }}
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
        onSuccess={() => setShowToast(true)}
        address={address}
        coordinates={coordinates}
      />
      <SuccessToast
        visible={showToast}
        onHide={() => setShowToast(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  addressBar: {
    position: 'absolute',
    top: 12,
    left: 16,
    right: 16,
    backgroundColor: 'white',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    elevation: 8,
    shadowColor: '#64748b',
    shadowOpacity: 0.22,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 2 },
    flexDirection: 'row',
    alignItems: 'stretch',
    overflow: 'hidden',
  },
  iconColumn: {
    width: 48,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
  },
  separator: {
    width: 1,
    backgroundColor: '#e2e8f0',
  },
  textArea: {
    flex: 1,
    flexShrink: 1,
    paddingHorizontal: 12,
    paddingVertical: 14,
    justifyContent: 'center',
    backgroundColor: 'white',
  },
  addressText: {
    fontSize: 16,
    color: '#0f172a',
    fontWeight: '500',
  },
});
