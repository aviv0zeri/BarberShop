import { DevSettings, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  AddressHoursRow,
  Button,
  NotificationBell,
  PromoBanner,
  TileCard,
  colors,
  customerHomeTiles,
} from '@barbershop/ui';
import { branch } from '../../data/brand';
import { useLocale } from '../../i18n/LocaleContext';
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

export function HomeScreen() {
  const { lang, t, rtl } = useLocale();
  const addr = lang === 'he' ? branch.addrHe : branch.addrEn;
  const open = lang === 'he' ? branch.openHe : branch.openEn;

  return (
    <ScreenScaffold>
      <View style={styles.hero}>
        <NotificationBell onPress={() => {}} />
        <View style={styles.logoWrap}>
          <Image source={LOGO} style={styles.logo} resizeMode="contain" accessibilityLabel="מספרפי" />
        </View>
        <View style={styles.divider} />
        <AddressHoursRow address={addr} hours={open} rtl={rtl} />
      </View>

      <Button kind="gold" icon="scissors" onPress={() => {}}>
        {t.hubBook}
      </Button>

      <PromoBanner />

      <Text style={[styles.section, rtl && styles.textRtl]}>{t.what}</Text>
      <View style={styles.grid}>
        {customerHomeTiles.tiles.map((tile) => (
          <TileCard
            key={tile.id}
            icon={tile.icon}
            label={t[tile.labelKey]}
            rtl={rtl}
            onPress={() => {}}
          />
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
    backgroundColor: colors.white,
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
  section: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.navy,
    marginTop: 2,
  },
  textRtl: {
    writingDirection: 'rtl',
    textAlign: 'right',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 11,
    justifyContent: 'space-between',
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
