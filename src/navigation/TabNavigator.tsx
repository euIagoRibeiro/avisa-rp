import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { TouchableOpacity, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { MapTabScreen } from '../screens/MapTabScreen';
import { ReportsScreen } from '../screens/ReportsScreen';

const Tab = createBottomTabNavigator();

type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

function LogoutButton() {
  const { logout } = useAuth();
  return (
    <TouchableOpacity onPress={logout} className="mr-4">
      <Text className="text-blue-600 text-base">Sair</Text>
    </TouchableOpacity>
  );
}

export function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerRight: () => <LogoutButton />,
        tabBarIcon: ({ color, size }) => {
          const icon: IoniconsName =
            route.name === 'Mapa' ? 'map-outline' : 'list-outline';
          return <Ionicons name={icon} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#2563eb',
        tabBarInactiveTintColor: '#9ca3af',
      })}
    >
      <Tab.Screen name="Mapa" component={MapTabScreen} />
      <Tab.Screen name="Relatos" component={ReportsScreen} />
    </Tab.Navigator>
  );
}
