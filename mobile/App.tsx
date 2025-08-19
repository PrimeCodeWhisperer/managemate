import React from 'react';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useColorScheme } from 'react-native';
import ShiftsScreen from './src/screens/ShiftsScreen';
import AvailabilityScreen from './src/screens/AvailabilityScreen';
import { light, dark } from './src/theme/colors';

const Tab = createBottomTabNavigator();

const LightTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: light.background,
    primary: light.primary,
    text: light.foreground,
    card: light.background,
    border: light.secondary,
  },
};

const DarkThemeCustom = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: dark.background,
    primary: dark.primary,
    text: dark.foreground,
    card: dark.background,
    border: dark.secondary,
  },
};

export default function App() {
  const scheme = useColorScheme();
  return (
    <NavigationContainer theme={scheme === 'dark' ? DarkThemeCustom : LightTheme}>
      <Tab.Navigator>
        <Tab.Screen name="Shifts" component={ShiftsScreen} />
        <Tab.Screen name="Availability" component={AvailabilityScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
