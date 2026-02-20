import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Platform,
  ActivityIndicator,
} from 'react-native';
import MapView, { Marker, Callout } from 'react-native-maps';
import * as Location from 'expo-location';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

import { useEvents } from '../store/EventContext';
import { colors, categories, shadow, spacing, radius, typography } from '../theme';
import { DEFAULT_LOCATION, DEFAULT_DELTA, formatTimeAgo } from '../utils/helpers';

export default function MapScreen() {
  const { events } = useEvents();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const mapRef = useRef(null);

  const [userLocation, setUserLocation] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [locationLoading, setLocationLoading] = useState(true);
  const previewAnim = useRef(new Animated.Value(0)).current;

  // Request location on mount
  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          const loc = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          });
          setUserLocation({
            latitude: loc.coords.latitude,
            longitude: loc.coords.longitude,
          });
        }
      } catch {
        // fall through to default location
      } finally {
        setLocationLoading(false);
      }
    })();
  }, []);

  const initialRegion = {
    ...(userLocation || DEFAULT_LOCATION),
    ...DEFAULT_DELTA,
  };

  const showPreview = useCallback((event) => {
    setSelectedEvent(event);
    Animated.spring(previewAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 80,
      friction: 10,
    }).start();
  }, [previewAnim]);

  const hidePreview = useCallback(() => {
    Animated.timing(previewAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => setSelectedEvent(null));
  }, [previewAnim]);

  const handleMarkerPress = useCallback((event) => {
    showPreview(event);
  }, [showPreview]);

  const handleMapPress = useCallback(() => {
    if (selectedEvent) hidePreview();
  }, [selectedEvent, hidePreview]);

  const goToUserLocation = useCallback(() => {
    if (userLocation && mapRef.current) {
      mapRef.current.animateToRegion(
        { ...userLocation, ...DEFAULT_DELTA },
        600
      );
    }
  }, [userLocation]);

  const previewTranslateY = previewAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [200, 0],
  });

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={initialRegion}
        showsUserLocation={!!userLocation}
        showsMyLocationButton={false}
        onPress={handleMapPress}
      >
        {events.map((event) => {
          const cat = categories[event.category] || categories.other;
          return (
            <Marker
              key={event.id}
              coordinate={event.location}
              onPress={() => handleMarkerPress(event)}
            >
              <View style={[styles.pin, { backgroundColor: cat.color }]}>
                <Text style={styles.pinEmoji}>{cat.emoji}</Text>
              </View>
              <View style={[styles.pinTail, { borderTopColor: cat.color }]} />
            </Marker>
          );
        })}
      </MapView>

      {/* Header overlay */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <View style={styles.headerInner}>
          <Text style={styles.appName}>Vagabondo</Text>
          <Text style={styles.eventCount}>{events.length} events nearby</Text>
        </View>
      </View>

      {/* My location button */}
      {userLocation && (
        <TouchableOpacity
          style={[styles.locationBtn, { bottom: 120 + insets.bottom }]}
          onPress={goToUserLocation}
          activeOpacity={0.8}
        >
          <Text style={styles.locationBtnIcon}>📍</Text>
        </TouchableOpacity>
      )}

      {/* Event preview card */}
      {selectedEvent && (
        <Animated.View
          style={[
            styles.previewCard,
            {
              bottom: 80 + insets.bottom,
              transform: [{ translateY: previewTranslateY }],
              opacity: previewAnim,
            },
          ]}
        >
          <EventPreview
            event={selectedEvent}
            onClose={hidePreview}
            onOpen={() => {
              hidePreview();
              navigation.navigate('EventDetail', { eventId: selectedEvent.id });
            }}
          />
        </Animated.View>
      )}

      {locationLoading && (
        <View style={styles.locationLoadingBadge}>
          <ActivityIndicator size="small" color={colors.primary} />
          <Text style={styles.locationLoadingText}>Finding you…</Text>
        </View>
      )}
    </View>
  );
}

function EventPreview({ event, onClose, onOpen }) {
  const cat = categories[event.category] || categories.other;
  return (
    <View style={styles.preview}>
      <TouchableOpacity style={styles.previewClose} onPress={onClose} hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}>
        <Text style={styles.previewCloseText}>✕</Text>
      </TouchableOpacity>
      <View style={styles.previewBadge}>
        <Text style={[styles.previewBadgeEmoji]}>{cat.emoji}</Text>
        <Text style={[styles.previewBadgeLabel, { color: cat.color }]}>{cat.label}</Text>
      </View>
      <Text style={styles.previewTitle} numberOfLines={2}>{event.title}</Text>
      <Text style={styles.previewMeta}>
        <Text style={styles.previewAuthor}>by {event.authorName}</Text>
        {'  ·  '}
        <Text>{formatTimeAgo(event.createdAt)}</Text>
      </Text>
      <View style={styles.previewFooter}>
        <View style={styles.previewStats}>
          <Text style={styles.previewStat}>🙋 {event.goingCount} going</Text>
          <Text style={styles.previewStat}>💬 {event.replies.length} replies</Text>
        </View>
        <TouchableOpacity style={styles.previewOpenBtn} onPress={onOpen} activeOpacity={0.8}>
          <Text style={styles.previewOpenText}>View →</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },

  map: { ...StyleSheet.absoluteFillObject },

  // Header
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
  },
  headerInner: {
    backgroundColor: colors.card,
    borderRadius: radius.xl,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...shadow.md,
  },
  appName: {
    ...typography.h3,
    color: colors.primary,
    letterSpacing: -0.5,
  },
  eventCount: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },

  // Map pin
  pin: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFF',
    ...shadow.sm,
  },
  pinEmoji: { fontSize: 16 },
  pinTail: {
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    alignSelf: 'center',
    marginTop: -1,
  },

  // Location button
  locationBtn: {
    position: 'absolute',
    right: spacing.md,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow.md,
  },
  locationBtnIcon: { fontSize: 20 },

  // Preview card
  previewCard: {
    position: 'absolute',
    left: spacing.md,
    right: spacing.md,
  },
  preview: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.md,
    ...shadow.lg,
  },
  previewClose: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewCloseText: { fontSize: 14, color: colors.textLight },
  previewBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 6,
  },
  previewBadgeEmoji: { fontSize: 14 },
  previewBadgeLabel: { ...typography.label },
  previewTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: 4,
    paddingRight: 20,
  },
  previewMeta: { ...typography.caption, color: colors.textSecondary, marginBottom: spacing.sm },
  previewAuthor: { fontWeight: '600', color: colors.text },
  previewFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  previewStats: { flexDirection: 'row', gap: spacing.md },
  previewStat: { ...typography.bodySmall, color: colors.textSecondary },
  previewOpenBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radius.full,
  },
  previewOpenText: { ...typography.label, color: '#FFF' },

  // Location loading
  locationLoadingBadge: {
    position: 'absolute',
    bottom: 90,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.card,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radius.full,
    ...shadow.sm,
  },
  locationLoadingText: { ...typography.caption, color: colors.textSecondary },
});
