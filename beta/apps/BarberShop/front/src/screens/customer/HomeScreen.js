import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { brand, branch } from '../../data/brand';
import { useLocale } from '../../i18n/LocaleContext';
import { colors } from '../../theme';
import { PlaceholderCard, ScreenScaffold } from '../../components/ScreenScaffold';

const TILES = [
  { id: 'nav', icon: 'navigate', labelKey: 'hubNav' },
  { id: 'visits', icon: 'calendar', labelKey: 'hubVisits' },
  { id: 'contact', icon: 'logo-whatsapp', labelKey: 'hubContact' },
  { id: 'shop', icon: 'bag', labelKey: 'hubShop' },
];

export function HomeScreen() {
  const { lang, t, rtl } = useLocale();
  const addr = lang === 'he' ? branch.addrHe : branch.addrEn;
  const open = lang === 'he' ? branch.openHe : branch.openEn;

  return (
    <ScreenScaffold>
      <View style={styles.hero}>
        <View style={styles.heroInner}>
          <Text style={styles.brandHe}>{brand.he}</Text>
          <Text style={styles.brandEn}>{brand.en}</Text>
          <View style={styles.divider} />
          <View style={[styles.metaRow, rtl && styles.metaRowRtl]}>
            <Ionicons name="location" size={15} color={colors.gold} />
            <Text style={styles.metaText}>{addr}</Text>
            <Text style={styles.metaDot}>·</Text>
            <Text style={styles.openText}>{open}</Text>
          </View>
        </View>
      </View>

      <Pressable style={styles.cta} onPress={() => {}}>
        <Ionicons name="cut" size={20} color={colors.navy} />
        <Text style={styles.ctaText}>{t.hubBook}</Text>
      </Pressable>

      <Text style={[styles.section, rtl && styles.textRtl]}>{t.what}</Text>
      <View style={styles.grid}>
        {TILES.map((tile) => (
          <Pressable key={tile.id} style={styles.tile} onPress={() => {}}>
            <Ionicons name={tile.icon} size={22} color={colors.gold} />
            <Text style={[styles.tileLabel, rtl && styles.textRtl]}>{t[tile.labelKey]}</Text>
          </Pressable>
        ))}
      </View>

      <PlaceholderCard title={t.comingSoon} body="handoff/app/customer.jsx → booking flow next" />
    </ScreenScaffold>
  );
}

const styles = StyleSheet.create({
  hero: {
    backgroundColor: '#fff',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(200,162,74,0.4)',
    padding: 20,
    shadowColor: colors.navy,
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  heroInner: { alignItems: 'center' },
  brandHe: {
    fontSize: 34,
    fontWeight: '700',
    color: colors.gold,
    textAlign: 'center',
  },
  brandEn: {
    fontSize: 13,
    letterSpacing: 3,
    color: colors.navyMuted,
    marginTop: 4,
    textAlign: 'center',
  },
  divider: {
    height: 1,
    width: '80%',
    marginVertical: 12,
    backgroundColor: 'rgba(200,162,74,0.55)',
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  metaRowRtl: { flexDirection: 'row-reverse' },
  metaText: { fontSize: 12.5, fontWeight: '600', color: 'rgba(11,30,61,0.7)' },
  metaDot: { color: 'rgba(11,30,61,0.25)' },
  openText: { fontSize: 12.5, fontWeight: '700', color: colors.openGreen },
  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: colors.gold,
    borderRadius: 16,
    paddingVertical: 16,
    marginTop: 4,
  },
  ctaText: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.navy,
  },
  section: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.navy,
    marginTop: 6,
  },
  textRtl: { writingDirection: 'rtl', textAlign: 'right' },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 11,
  },
  tile: {
    width: '47%',
    backgroundColor: '#fff',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.navySoft,
    padding: 16,
    gap: 12,
  },
  tileLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.navy,
  },
});
