import './global.css';
import { View, Text, TouchableOpacity, Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { ReportsProvider, useReports } from './src/context/ReportsContext';
import { LoginScreen } from './src/screens/LoginScreen';
import { TabNavigator } from './src/navigation/TabNavigator';

function ErrorBanner() {
  const { error, clearError } = useReports();
  if (!error) return null;
  return (
    <View
      style={{
        position: 'absolute',
        top: Platform.OS === 'android' ? 0 : 44,
        left: 0,
        right: 0,
        backgroundColor: '#ef4444',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        gap: 10,
        zIndex: 999,
      }}
    >
      <Ionicons name="warning-outline" size={18} color="#fff" />
      <Text style={{ flex: 1, color: '#fff', fontSize: 14, fontWeight: '600' }}>
        {error}
      </Text>
      <TouchableOpacity onPress={clearError}>
        <Ionicons name="close" size={20} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

function RootNavigator() {
  const { user } = useAuth();
  return (
    <View style={{ flex: 1 }}>
      {user ? <TabNavigator /> : <LoginScreen />}
      <ErrorBanner />
    </View>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <ReportsProvider>
          <NavigationContainer>
            <RootNavigator />
            <StatusBar style="auto" />
          </NavigationContainer>
        </ReportsProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
