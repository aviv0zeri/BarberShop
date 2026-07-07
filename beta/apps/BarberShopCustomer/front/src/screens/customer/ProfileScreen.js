import { Pressable, StyleSheet, Text } from 'react-native';
import appVersion from '../../lib/appVersion.json';
import { useLocale } from '../../i18n/LocaleContext';
import { colors } from '../../theme';
import { PlaceholderCard, ScreenScaffold } from '../../components/ScreenScaffold';

export function ProfileScreen() {
  const { t, rtl, toggleLang } = useLocale();

  return (
    <ScreenScaffold>
      <Text style={[styles.title, rtl && styles.rtl]}>{t.profileTitle}</Text>
      <PlaceholderCard title={t.comingSoon} body="handoff/app/customer.jsx profile + auth" />
      <Pressable style={styles.langBtn} onPress={toggleLang}>
        <Text style={styles.langBtnText}>{t.langToggle}</Text>
      </Pressable>
      <Text style={styles.version}>
        {t.versionLabel} {appVersion.version}
      </Text>
    </ScreenScaffold>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.navy,
  },
  rtl: { writingDirection: 'rtl', textAlign: 'right' },
  langBtn: {
    alignSelf: 'flex-start',
    backgroundColor: colors.navy,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  langBtnText: {
    color: colors.creamCard,
    fontWeight: '600',
    fontSize: 14,
  },
  version: {
    marginTop: 8,
    fontSize: 12,
    color: colors.navyMuted,
  },
});
