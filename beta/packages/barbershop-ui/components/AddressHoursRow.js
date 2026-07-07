import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';
import { Icon } from './Icon';

/** Address + hours row — stub until live branch API is wired. */
export function AddressHoursRow({ address, hours, rtl = false }) {
  const addr = address || '—';
  const open = hours || '—';

  return (
    <View style={[styles.row, rtl && styles.rowRtl]}>
      <Icon name="pin" size={15} color={colors.gold} />
      <Text style={styles.addr}>{addr}</Text>
      <Text style={styles.dot}>·</Text>
      <Text style={styles.open}>{open}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
  },
  rowRtl: {
    flexDirection: 'row-reverse',
  },
  addr: {
    fontSize: 12.5,
    fontWeight: '600',
    color: 'rgba(11,30,61,0.7)',
  },
  dot: {
    color: 'rgba(11,30,61,0.25)',
  },
  open: {
    fontSize: 12.5,
    fontWeight: '700',
    color: colors.openGreen,
  },
});
