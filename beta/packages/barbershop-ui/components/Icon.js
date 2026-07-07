import { Ionicons } from '@expo/vector-icons';

/** Map handoff icon names → Ionicons (subset used on customer home). */
const MAP = {
  navigate: 'navigate',
  calendar: 'calendar',
  whatsapp: 'logo-whatsapp',
  bag: 'bag',
  bell: 'notifications',
  pin: 'location',
  scissors: 'cut',
  home: 'home',
  user: 'person',
  cut: 'cut',
};

export function Icon({ name, size = 20, color = '#0B1E3D', style }) {
  const ion = MAP[name] || name;
  return <Ionicons name={ion} size={size} color={color} style={style} />;
}
