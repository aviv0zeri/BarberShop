import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, I18nManager } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

// Design tokens from handoff/README.md
const colors = {
  navy: '#0B1E3D',
  gold: '#C8A24A',
  creamBg: '#F6EEDF',
  creamCard: '#FBF5EA',
  creamLine: '#E7DABE',
};

export default function App() {
  const rtl = I18nManager.isRTL;

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <Text style={styles.brandHe}>מספרפי</Text>
          <Text style={styles.brandEn}>BARBER SHOP</Text>
          <Text style={styles.tagline}>מספרה לגברים וילדים · 2001</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>BarberShop v2.0.0</Text>
          <Text style={styles.cardBody}>
            Expo shell — design reference in handoff/. Next: port ui.jsx + data.jsx, then booking
            and cart scheduler.
          </Text>
          <Text style={styles.hint}>
            {rtl ? 'RTL פעיל' : 'LTR'} · Run prompter → Metro + Simulator
          </Text>
        </View>
        <StatusBar style="dark" />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.creamBg },
  header: {
    padding: 24,
    paddingTop: 16,
    backgroundColor: colors.navy,
    borderBottomWidth: 3,
    borderBottomColor: colors.gold,
  },
  brandHe: {
    fontSize: 36,
    fontWeight: '700',
    color: colors.gold,
    textAlign: 'center',
  },
  brandEn: {
    fontSize: 14,
    letterSpacing: 4,
    color: colors.creamCard,
    textAlign: 'center',
    marginTop: 4,
  },
  tagline: {
    fontSize: 13,
    color: colors.creamLine,
    textAlign: 'center',
    marginTop: 8,
  },
  card: {
    margin: 20,
    padding: 20,
    backgroundColor: colors.creamCard,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.creamLine,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.navy,
    marginBottom: 10,
  },
  cardBody: {
    fontSize: 15,
    color: colors.navy,
    lineHeight: 22,
    opacity: 0.85,
  },
  hint: {
    marginTop: 16,
    fontSize: 12,
    color: colors.gold,
    fontWeight: '600',
  },
});
