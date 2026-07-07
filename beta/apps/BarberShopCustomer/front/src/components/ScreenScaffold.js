import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../theme';

const TOP_SAFE_GAP = 12;

export function ScreenScaffold({ children, scroll = true, style }) {
  const insets = useSafeAreaInsets();
  const padTop = insets.top + TOP_SAFE_GAP;
  const padBottom = 88 + insets.bottom;

  if (!scroll) {
    return (
      <View
        style={[
          styles.root,
          styles.content,
          { paddingTop: padTop, paddingBottom: padBottom },
          style,
        ]}
      >
        {children}
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={[styles.content, { paddingTop: padTop, paddingBottom: padBottom }, style]}
      showsVerticalScrollIndicator={false}
    >
      {children}
    </ScrollView>
  );
}

export function PlaceholderCard({ title, body }) {
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{title}</Text>
      {body ? <Text style={styles.cardBody}>{body}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.creamBg,
  },
  content: {
    paddingHorizontal: 18,
    gap: 14,
  },
  card: {
    backgroundColor: colors.creamCard,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.creamLine,
    padding: 18,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.navy,
    marginBottom: 6,
  },
  cardBody: {
    fontSize: 14,
    lineHeight: 21,
    color: colors.navy,
    opacity: 0.8,
  },
});
