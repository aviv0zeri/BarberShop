import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { LocaleProvider } from './src/i18n/LocaleContext';
import { CustomerTabs } from './src/navigation/CustomerTabs';

export default function App() {
  return (
    <SafeAreaProvider>
      <LocaleProvider initialLang="en">
        <CustomerTabs />
        <StatusBar style="dark" />
      </LocaleProvider>
    </SafeAreaProvider>
  );
}
