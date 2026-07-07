import { StyleSheet, Text } from 'react-native';
import { useLocale } from '../../i18n/LocaleContext';
import { colors } from '../../theme';
import { PlaceholderCard, ScreenScaffold } from '../../components/ScreenScaffold';

export function ShopScreen() {
  const { t, rtl } = useLocale();

  return (
    <ScreenScaffold>
      <Text style={[styles.title, rtl && styles.rtl]}>{t.shopTitle}</Text>
      <Text style={[styles.sub, rtl && styles.rtl]}>{t.shopSub}</Text>
      <PlaceholderCard title={t.comingSoon} body="handoff/app/customer.jsx shop tab + handoff/app/data.jsx products" />
    </ScreenScaffold>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.navy,
  },
  sub: {
    fontSize: 14,
    color: colors.navyMuted,
    marginBottom: 4,
  },
  rtl: { writingDirection: 'rtl', textAlign: 'right' },
});
