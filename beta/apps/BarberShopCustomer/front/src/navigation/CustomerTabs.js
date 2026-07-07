import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { CustomerTabBar } from '../components/CustomerTabBar';
import { HomeScreen } from '../screens/customer/HomeScreen';
import { ShopScreen } from '../screens/customer/ShopScreen';
import { AppointmentsScreen } from '../screens/customer/AppointmentsScreen';
import { ProfileScreen } from '../screens/customer/ProfileScreen';
import { colors } from '../theme';

const Tab = createBottomTabNavigator();

export function CustomerTabs() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        tabBar={(props) => <CustomerTabBar {...props} />}
        screenOptions={{
          headerShown: false,
          sceneStyle: { backgroundColor: colors.creamBg },
        }}
      >
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen name="Shop" component={ShopScreen} />
        <Tab.Screen name="Appointments" component={AppointmentsScreen} />
        <Tab.Screen name="Profile" component={ProfileScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
