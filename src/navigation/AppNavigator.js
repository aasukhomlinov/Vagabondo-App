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
// Custom tab bar — matching the design exactly
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
                <Ionicons name="add" size={26} color={colors.white} />
              </View>
            </TouchableOpacity>
          );
        }

        const iconName = {
          Feed: isFocused ? 'compass' : 'compass-outline',
          MapTab: isFocused ? 'map' : 'map-outline',
          Profile: isFocused ? 'person' : 'person-outline',
        }[route.name];

        return (
          <TouchableOpacity
            key={route.key}
            onPress={onPress}
            style={styles.tabItem}
            activeOpacity={0.7}
          >
            <View style={[styles.iconWrap, isFocused && styles.iconWrapActive]}>
              <Ionicons
                name={iconName}
                size={22}
                color={isFocused ? colors.black : colors.grayMid}
              />
            </View>
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
    borderTopWidth: 1,
    borderTopColor: colors.grayBorder,
    paddingTop: 8,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrap: {
    width: 44,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapActive: {
    backgroundColor: colors.tabActiveBg,
  },
  createBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.black,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow.md,
  },
});
