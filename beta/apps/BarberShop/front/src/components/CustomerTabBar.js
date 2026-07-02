import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme';
import { useLocale } from '../i18n/LocaleContext';

const TAB_META = [
  { id: 'Home', icon: 'home', labelKey: 'home' },
  { id: 'Shop', icon: 'bag', labelKey: 'shop' },
  { id: 'Appointments', icon: 'calendar', labelKey: 'appts' },
  { id: 'Profile', icon: 'person', labelKey: 'profile' },
];

export function CustomerTabBar({ state, descriptors, navigation }) {
  const insets = useSafeAreaInsets();
  const { t, rtl } = useLocale();
  const tabs = rtl ? [...TAB_META].reverse() : TAB_META;

  return (
    <View style={[styles.bar, { paddingBottom: Math.max(insets.bottom, 12) }]}>
      {tabs.map((tab) => {
        const routeIndex = state.routes.findIndex((r) => r.name === tab.id);
        const route = state.routes[routeIndex];
        const focused = state.index === routeIndex;
        const { options } = descriptors[route.key];

        return (
          <Pressable
            key={tab.id}
            accessibilityRole="button"
            accessibilityState={focused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            onPress={() => {
              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });
              if (!focused && !event.defaultPrevented) {
                navigation.navigate(route.name);
              }
            }}
            style={styles.tab}
          >
            <Ionicons
              name={focused ? tab.icon : `${tab.icon}-outline`}
              size={23}
              color={focused ? colors.gold : colors.navyMuted}
            />
            <Text style={[styles.label, focused && styles.labelOn]}>{t[tab.labelKey]}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingTop: 10,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(251,249,245,0.92)',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.navySoft,
  },
  tab: {
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  label: {
    fontSize: 10.5,
    fontWeight: '500',
    color: colors.navyMuted,
  },
  labelOn: {
    fontWeight: '700',
    color: colors.navy,
  },
});
