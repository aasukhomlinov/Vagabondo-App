import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import MapScreen from '../screens/MapScreen';
import EventsListScreen from '../screens/EventsListScreen';
import CreateEventScreen from '../screens/CreateEventScreen';
import EventDetailScreen from '../screens/EventDetailScreen';
import { colors, shadow } from '../theme';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// ---------------------------------------------------------------------------
// Custom tab bar — matches mockup: pen | book | person | + (black circle)
// ---------------------------------------------------------------------------
function CustomTabBar({ state, descriptors, navigation }) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.tabBar, { paddingBottom: Math.max(insets.bottom, 8) }]}>
      {state.routes.map((route, index) => {
        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });
          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        // Create button — large black circle, rightmost
        if (route.name === 'Create') {
          return (
            <TouchableOpacity
              key={route.key}
              onPress={onPress}
              style={styles.tabItem}
              activeOpacity={0.8}
            >
              <View style={styles.createBtn}>
                <Ionicons name="add" size={28} color={colors.white} />
              </View>
            </TouchableOpacity>
          );
        }

        // Mockup icons: pen/compose, open book/map, person
        const iconName = {
          Feed: isFocused ? 'create' : 'create-outline',
          MapTab: isFocused ? 'book' : 'book-outline',
          Profile: isFocused ? 'person' : 'person-outline',
        }[route.name];

        return (
          <TouchableOpacity
            key={route.key}
            onPress={onPress}
            style={styles.tabItem}
            activeOpacity={0.7}
          >
            <Ionicons
              name={iconName}
              size={24}
              color={isFocused ? colors.black : colors.grayMid}
            />
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

// ---------------------------------------------------------------------------
// Main tabs — 4 tabs matching the design: Feed | Map | Profile | +
// ---------------------------------------------------------------------------
function MainTabs() {
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen name="Feed" component={EventsListScreen} />
      <Tab.Screen name="MapTab" component={MapScreen} />
      <Tab.Screen name="Profile" component={EventsListScreen} />
      <Tab.Screen name="Create" component={CreateEventScreen} />
    </Tab.Navigator>
  );
}

// ---------------------------------------------------------------------------
// Root navigator
// ---------------------------------------------------------------------------
export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="MainTabs" component={MainTabs} />
        <Stack.Screen
          name="EventDetail"
          component={EventDetailScreen}
          options={{ animation: 'slide_from_right' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.grayBorder,
    paddingTop: 10,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  createBtn: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.black,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow.md,
  },
});
