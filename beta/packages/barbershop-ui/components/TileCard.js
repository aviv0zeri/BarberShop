import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';
import { Icon } from './Icon';

export function TileCard({ icon, label, onPress, rtl = false }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.tile, pressed && styles.pressed]}
    >
      <View style={styles.iconBox}>
        <Icon name={icon} size={22} color={colors.gold} />
      </View>
      <Text style={[styles.label, rtl && styles.labelRtl]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tile: {
    width: '47%',
    backgroundColor: colors.white,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.navyBorder,
    paddingVertical: 16,
    paddingHorizontal: 15,
    gap: 12,
    shadowColor: colors.navy,
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  pressed: {
    opacity: 0.92,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 13,
    backgroundColor: 'rgba(228,201,123,0.22)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.navy,
  },
  labelRtl: {
    writingDirection: 'rtl',
    textAlign: 'right',
  },
});
