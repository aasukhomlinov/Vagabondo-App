import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import MapScreen from '../screens/MapScreen';
import EventsListScreen from '../screens/EventsListScreen';
import CreateEventScreen from '../screens/CreateEventScreen';
import EventDetailScreen from '../screens/EventDetailScreen';
import { colors, shadow } from '../theme';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// ---------------------------------------------------------------------------
// Tab bar icon components
// ---------------------------------------------------------------------------
function MapIcon({ focused }) {
  return (
    <View style={styles.iconWrap}>
      <Text style={[styles.iconEmoji, focused && styles.iconFocused]}>🗺️</Text>
      <Text style={[styles.iconLabel, focused && styles.labelFocused]}>Map</Text>
    </View>
  );
}

function ListIcon({ focused }) {
  return (
    <View style={styles.iconWrap}>
      <Text style={[styles.iconEmoji, focused && styles.iconFocused]}>📋</Text>
      <Text style={[styles.iconLabel, focused && styles.labelFocused]}>Events</Text>
    </View>
  );
}

// Custom center create button
function CreateButton({ onPress }) {
  return (
    <TouchableOpacity onPress={onPress} style={styles.createBtn} activeOpacity={0.85}>
      <Text style={styles.createBtnText}>+</Text>
    </TouchableOpacity>
  );
}

// Custom tab bar
function CustomTabBar({ state, descriptors, navigation }) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.tabBar, { paddingBottom: insets.bottom }]}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
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

        if (route.name === 'Create') {
          return (
            <View key={route.key} style={styles.tabItem}>
              <CreateButton onPress={onPress} />
            </View>
          );
        }

        const Icon = options.tabBarIcon;
        return (
          <TouchableOpacity
            key={route.key}
            onPress={onPress}
            style={styles.tabItem}
            activeOpacity={0.7}
          >
            {Icon && <Icon focused={isFocused} />}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

// ---------------------------------------------------------------------------
// Main tabs
// ---------------------------------------------------------------------------
function MainTabs() {
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen
        name="Map"
        component={MapScreen}
        options={{ tabBarIcon: ({ focused }) => <MapIcon focused={focused} /> }}
      />
      <Tab.Screen
        name="Create"
        component={CreateEventScreen}
        options={{ tabBarIcon: () => null }}
      />
      <Tab.Screen
        name="Events"
        component={EventsListScreen}
        options={{ tabBarIcon: ({ focused }) => <ListIcon focused={focused} /> }}
      />
    </Tab.Navigator>
  );
}

// ---------------------------------------------------------------------------
// Root navigator (tabs + modal screens)
// ---------------------------------------------------------------------------
export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="MainTabs" component={MainTabs} />
        <Stack.Screen
          name="EventDetail"
          component={EventDetailScreen}
          options={{
            presentation: 'card',
            animation: 'slide_from_right',
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    ...shadow.sm,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 8,
    paddingBottom: 4,
  },
  iconWrap: {
    alignItems: 'center',
    gap: 2,
  },
  iconEmoji: {
    fontSize: 22,
    opacity: 0.5,
  },
  iconFocused: {
    opacity: 1,
  },
  iconLabel: {
    fontSize: 11,
    color: colors.textLight,
    fontWeight: '500',
  },
  labelFocused: {
    color: colors.primary,
    fontWeight: '600',
  },
  createBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -20,
    ...shadow.md,
  },
  createBtnText: {
    fontSize: 32,
    color: '#FFFFFF',
    lineHeight: 38,
    fontWeight: '300',
  },
});
