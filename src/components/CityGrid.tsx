import { View } from 'react-native';

const PATTERN = [
  [true, false, true],
  [false, true, false],
  [true, false, true],
] as const;

export function CityGrid() {
  return (
    <View style={{ gap: 4 }}>
      {PATTERN.map((row, i) => (
        <View key={i} style={{ flexDirection: 'row', gap: 4 }}>
          {row.map((filled, j) => (
            <View
              key={j}
              style={{
                width: 10,
                height: 10,
                borderRadius: 2,
                backgroundColor: filled ? '#38bdf8' : 'rgba(56,189,248,0.12)',
              }}
            />
          ))}
        </View>
      ))}
    </View>
  );
}
