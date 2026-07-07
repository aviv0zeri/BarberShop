import { StyleSheet, Text } from 'react-native';
import { useLocale } from '../../i18n/LocaleContext';
import { colors } from '../../theme';
import { PlaceholderCard, ScreenScaffold } from '../../components/ScreenScaffold';

export function AppointmentsScreen() {
  const { t, rtl } = useLocale();

  return (
    <ScreenScaffold>
      <Text style={[styles.title, rtl && styles.rtl]}>{t.appts}</Text>
      <PlaceholderCard title={t.noAppts} body="handoff/app/customer.jsx appointments tab — cancel, undo, reschedule" />
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
});
