import 'react-native-gesture-handler';
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { EventProvider } from './src/store/EventContext';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  return (
    <SafeAreaProvider>
      <EventProvider>
        <AppNavigator />
        <StatusBar style="dark" />
      </EventProvider>
    </SafeAreaProvider>
  );
}
