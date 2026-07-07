import { StyleSheet, View } from 'react-native';
import { colors } from '../theme/colors';

/** Placeholder — punch-card / promo slot from handoff customer home (Round 10). */
export function PromoBanner({ children, style }) {
  if (!children) {
    return <View style={[styles.empty, style]} accessibilityElementsHidden />;
  }
  return <View style={[styles.filled, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  empty: {
    minHeight: 12,
  },
  filled: {
    borderRadius: 18,
    padding: 14,
    backgroundColor: colors.creamCard,
    borderWidth: 1,
    borderColor: colors.creamLine,
  },
});
