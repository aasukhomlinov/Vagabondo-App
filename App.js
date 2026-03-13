import 'react-native-gesture-handler';
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts } from 'expo-font';

import { EventProvider } from './src/store/EventContext';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  const [fontsLoaded] = useFonts({
    'LINESeedJP-Thin': require('./assets/fonts/LINESeedJP-Thin.ttf'),
    'LINESeedJP-Regular': require('./assets/fonts/LINESeedJP-Regular.ttf'),
    'LINESeedJP-Bold': require('./assets/fonts/LINESeedJP-Bold.ttf'),
    'LINESeedJP-ExtraBold': require('./assets/fonts/LINESeedJP-ExtraBold.ttf'),
  });

  if (!fontsLoaded) return null;

  return (
    <SafeAreaProvider>
      <EventProvider>
        <AppNavigator />
        <StatusBar style="dark" />
      </EventProvider>
    </SafeAreaProvider>
  );
}
