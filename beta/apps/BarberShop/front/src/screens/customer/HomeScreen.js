import { DevSettings, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { branch } from '../../data/brand';
import { useLocale } from '../../i18n/LocaleContext';
import { colors } from '../../theme';
import { ScreenScaffold } from '../../components/ScreenScaffold';
import appVersion from '../../lib/appVersion.json';

const LOGO = require('../../../assets/brand/logo-wide.jpg');

function reloadApp() {
  if (DevSettings && typeof DevSettings.reload === 'function') {
    DevSettings.reload();
    return;
  }
  console.info('Reload unavailable in this runtime');
}

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
        <Pressable
          onPress={() => {}}
          style={styles.bell}
          accessibilityRole="button"
          accessibilityLabel="Notifications"
        >
          <Ionicons name="notifications" size={19} color={colors.navy} />
          <View style={styles.bellDot} />
        </Pressable>
        <View style={styles.logoWrap}>
          <Image source={LOGO} style={styles.logo} resizeMode="contain" accessibilityLabel="מספרפי" />
        </View>
        <View style={styles.divider} />
        <View style={[styles.metaRow, rtl && styles.metaRowRtl]}>
          <Ionicons name="location" size={15} color={colors.gold} />
          <Text style={styles.metaText}>{addr}</Text>
          <Text style={styles.metaDot}>·</Text>
          <Text style={styles.openText}>{open}</Text>
        </View>
      </View>

      <Pressable style={styles.cta} onPress={() => {}}>
        <Ionicons name="cut" size={20} color={colors.navy} />
        <Text style={styles.ctaText}>{t.hubBook}</Text>
      </Pressable>

      <View style={styles.promoSlot} />

      <Text style={[styles.section, rtl && styles.textRtl]}>{t.what}</Text>
      <View style={styles.grid}>
        {TILES.map((tile) => (
          <Pressable key={tile.id} style={styles.tile} onPress={() => {}}>
            <View style={styles.tileIconBox}>
              <Ionicons name={tile.icon} size={22} color={colors.gold} />
            </View>
            <Text style={[styles.tileLabel, rtl && styles.textRtl]}>{t[tile.labelKey]}</Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.versionFooter}>
        <Text style={styles.versionText}>
          {appVersion.project} v{appVersion.version}
        </Text>
        {__DEV__ ? (
          <Pressable
            onPress={reloadApp}
            style={styles.reloadWrap}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            accessibilityRole="button"
            accessibilityLabel="Reload JavaScript"
          >
            <Ionicons name="refresh" size={24} color={colors.gold} />
          </Pressable>
        ) : null}
      </View>
    </ScreenScaffold>
  );
}

const styles = StyleSheet.create({
  hero: {
    position: 'relative',
    backgroundColor: '#fff',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(200,162,74,0.4)',
    paddingTop: 20,
    paddingBottom: 15,
    paddingHorizontal: 18,
    shadowColor: colors.navy,
    shadowOpacity: 0.08,
    shadowRadius: 13,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3,
    overflow: 'hidden',
  },
  bell: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 38,
    height: 38,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: colors.navySoft,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  bellDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: colors.gold,
    borderWidth: 1.5,
    borderColor: '#fff',
  },
  logoWrap: {
    alignItems: 'center',
    paddingVertical: 4,
  },
  logo: {
    width: '100%',
    maxWidth: 300,
    height: 72,
  },
  divider: {
    height: 1,
    marginVertical: 10,
    backgroundColor: 'rgba(200,162,74,0.55)',
    opacity: 0.85,
    alignSelf: 'center',
    width: '80%',
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
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
    shadowColor: colors.gold,
    shadowOpacity: 0.34,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 10 },
    elevation: 4,
  },
  ctaText: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.navy,
  },
  promoSlot: {
    minHeight: 12,
  },
  section: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.navy,
    marginTop: 2,
  },
  textRtl: { writingDirection: 'rtl', textAlign: 'right' },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 11,
    justifyContent: 'space-between',
  },
  tile: {
    width: '47%',
    backgroundColor: '#fff',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(11,30,61,0.06)',
    paddingVertical: 16,
    paddingHorizontal: 15,
    gap: 12,
    shadowColor: colors.navy,
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  tileIconBox: {
    width: 44,
    height: 44,
    borderRadius: 13,
    backgroundColor: 'rgba(228,201,123,0.22)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tileLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.navy,
  },
  versionFooter: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'center',
    paddingTop: 4,
  },
  versionText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.navyMuted,
  },
  reloadWrap: {
    width: 44,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
});
