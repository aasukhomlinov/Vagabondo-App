import 'react-native-gesture-handler';
import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as Font from 'expo-font';

import { EventProvider } from './src/store/EventContext';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    Font.loadAsync({
      'LINESeedJP-Thin': require('./assets/fonts/LINESeedJP-Thin.ttf'),
      'LINESeedJP-Regular': require('./assets/fonts/LINESeedJP-Regular.ttf'),
      'LINESeedJP-Bold': require('./assets/fonts/LINESeedJP-Bold.ttf'),
      'LINESeedJP-ExtraBold': require('./assets/fonts/LINESeedJP-ExtraBold.ttf'),
    })
      .then(() => setFontsLoaded(true))
      .catch((e) => {
        console.error('[Font] Failed to load LINE Seed JP:', e);
        setFontsLoaded(true); // show app with system font fallback
      });
  }, []);

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
