import { StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';

export default function App() {
  return (
    <View style={styles.root}>
      <Text style={styles.title}>BarberShop Admin</Text>
      <Text style={styles.sub}>Skeleton — owner dashboard coming soon</Text>
      <StatusBar style="dark" />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F6EEDF',
    padding: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0B1E3D',
  },
  sub: {
    marginTop: 8,
    fontSize: 14,
    color: 'rgba(11,30,61,0.55)',
    textAlign: 'center',
  },
});
