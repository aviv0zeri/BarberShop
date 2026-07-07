import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';
import { Icon } from './Icon';

const KINDS = {
  primary: {
    backgroundColor: colors.navy,
    textColor: colors.paper,
    shadowOpacity: 0.28,
    shadowColor: colors.navy,
  },
  gold: {
    backgroundColor: colors.gold,
    textColor: colors.navy,
    shadowOpacity: 0.34,
    shadowColor: colors.gold,
  },
  ghost: {
    backgroundColor: 'transparent',
    textColor: colors.navy,
    borderWidth: 1.5,
    borderColor: 'rgba(11,30,61,0.16)',
    shadowOpacity: 0,
  },
};

export function Button({
  children,
  onPress,
  kind = 'primary',
  disabled = false,
  icon,
  style,
  textStyle,
}) {
  const palette = KINDS[kind] ?? KINDS.primary;

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.base,
        {
          backgroundColor: palette.backgroundColor,
          borderWidth: palette.borderWidth ?? 0,
          borderColor: palette.borderColor,
          opacity: disabled ? 0.4 : 1,
          transform: pressed && !disabled ? [{ scale: 0.975 }] : undefined,
          shadowOpacity: palette.shadowOpacity,
          shadowColor: palette.shadowColor,
        },
        style,
      ]}
    >
      {icon ? (
        <View style={styles.iconWrap}>
          <Icon name={icon} size={19} color={palette.textColor} />
        </View>
      ) : null}
      <Text style={[styles.label, { color: palette.textColor }, textStyle]}>{children}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    width: '100%',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 16,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 10 },
    elevation: 4,
  },
  iconWrap: {
    marginEnd: 2,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
});
