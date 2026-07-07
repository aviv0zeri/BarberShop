import { Pressable, StyleSheet, View } from 'react-native';
import { colors } from '../theme/colors';
import { Icon } from './Icon';

export function NotificationBell({ onPress, showDot = true, style }) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.bell, style]}
      accessibilityRole="button"
      accessibilityLabel="Notifications"
    >
      <Icon name="bell" size={19} color={colors.navy} />
      {showDot ? <View style={styles.dot} /> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  bell: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 38,
    height: 38,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: colors.navySoft,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  dot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: colors.gold,
    borderWidth: 1.5,
    borderColor: colors.white,
  },
});
