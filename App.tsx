import "./global.css";
import { StatusBar } from "expo-status-bar";
import { Text, View } from "react-native";

export default function App() {
  return (
    <View className="flex-1 items-center justify-center bg-white">
      <Text className="text-3xl font-bold text-gray-800">Avisa RP</Text>
      <Text className="text-sm text-gray-500 mt-2">
        Seu canal com a Prefeitura
      </Text>
      <StatusBar style="auto" />
    </View>
  );
}
