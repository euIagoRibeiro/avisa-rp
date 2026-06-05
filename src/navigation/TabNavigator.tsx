import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MapTabScreen } from '../features/map/MapTabScreen';
import { ReportsScreen } from '../screens/ReportsScreen';
import { ProfileScreen } from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator();

type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

function BrandTitle() {
  return (
    <View style={styles.brandContainer}>
      <Text style={styles.brandText}>AVISA</Text>
      <View style={styles.brandPill}>
        <Text style={styles.brandPillText}>RP</Text>
      </View>
    </View>
  );
}

export function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerTitle: () => <BrandTitle />,
        headerTitleAlign: 'left',
        headerStyle: styles.header,
        headerShadowVisible: false,
        tabBarIcon: ({ color, size }) => {
          let icon: IoniconsName;
          if (route.name === 'Mapa') {
            icon = 'map-outline';
          } else if (route.name === 'Relatos') {
            icon = 'list-outline';
          } else {
            icon = 'person-outline';
          }
          return <Ionicons name={icon} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#0ea5e9',
        tabBarInactiveTintColor: '#94a3b8',
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabBarLabel,
      })}
    >
      <Tab.Screen name="Mapa" component={MapTabScreen} />
      <Tab.Screen name="Relatos" component={ReportsScreen} />
      <Tab.Screen name="Perfil" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: 'white',
  },
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  brandText: {
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 3,
    color: '#0f172a',
  },
  brandPill: {
    backgroundColor: '#0ea5e9',
    borderRadius: 99,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  brandPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: 'white',
    letterSpacing: 0.5,
  },
  tabBar: {
    borderTopColor: '#e2e8f0',
    borderTopWidth: 1,
    backgroundColor: 'white',
  },
  tabBarLabel: {
    fontWeight: '600',
    fontSize: 12,
  },
});
