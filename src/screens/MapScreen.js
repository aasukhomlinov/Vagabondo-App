import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  ActivityIndicator,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

import { useEvents } from '../store/EventContext';
import { colors, spacing, radius, typography, shadow } from '../theme';
import { DEFAULT_LOCATION, DEFAULT_DELTA, formatEventDate } from '../utils/helpers';
import AppHeader from '../components/AppHeader';
import EventPosterCard, { AttendeeStack } from '../components/EventPosterCard';

// Height of the bottom sheet content (poster + info row)
const SHEET_HEIGHT = 320;

export default function MapScreen() {
  const { events, toggleLiked, isLiked } = useEvents();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const mapRef = useRef(null);

  const [userLocation, setUserLocation] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [locationLoading, setLocationLoading] = useState(true);

  const sheetAnim = useRef(new Animated.Value(SHEET_HEIGHT)).current;

  // Location
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
      } catch { /* use default */ }
      finally { setLocationLoading(false); }
    })();
  }, []);

  const openSheet = useCallback((event) => {
    setSelectedEvent(event);
    Animated.spring(sheetAnim, {
      toValue: 0,
      useNativeDriver: true,
      tension: 70,
      friction: 12,
    }).start();
  }, [sheetAnim]);

  const closeSheet = useCallback(() => {
    Animated.timing(sheetAnim, {
      toValue: SHEET_HEIGHT,
      duration: 220,
      useNativeDriver: true,
    }).start(() => setSelectedEvent(null));
  }, [sheetAnim]);

  const handleMapPress = useCallback(() => {
    if (selectedEvent) closeSheet();
  }, [selectedEvent, closeSheet]);

  const goToUserLocation = useCallback(() => {
    if (userLocation && mapRef.current) {
      mapRef.current.animateToRegion({ ...userLocation, ...DEFAULT_DELTA }, 600);
    }
  }, [userLocation]);

  const initialRegion = { ...(userLocation || DEFAULT_LOCATION), ...DEFAULT_DELTA };

  return (
    <View style={styles.container}>
      {/* Map — full screen */}
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFillObject}
        initialRegion={initialRegion}
        showsUserLocation={!!userLocation}
        showsMyLocationButton={false}
        onPress={handleMapPress}
      >
        {events.map((event) => (
          <EventPin
            key={event.id}
            event={event}
            selected={selectedEvent?.id === event.id}
            onPress={() => openSheet(event)}
          />
        ))}
      </MapView>

      {/* Header overlay */}
      <View style={[styles.headerWrap, { paddingTop: insets.top }]}>
        <AppHeader city="Rome" onCityPress={() => {}} onCategoryPress={() => {}} onTimePress={() => {}} />
      </View>

      {/* My location button */}
      {userLocation && (
        <TouchableOpacity
          style={[styles.locationBtn, { bottom: SHEET_HEIGHT + 80 + insets.bottom }]}
          onPress={goToUserLocation}
          activeOpacity={0.85}
        >
          <Ionicons name="locate-outline" size={20} color={colors.black} />
        </TouchableOpacity>
      )}

      {/* Location loading badge */}
      {locationLoading && (
        <View style={[styles.loadingBadge, { top: insets.top + 70 }]}>
          <ActivityIndicator size="small" color={colors.black} />
        </View>
      )}

      {/* Bottom sheet — slides up on pin tap */}
      <Animated.View
        style={[
          styles.sheet,
          { bottom: insets.bottom + 60, transform: [{ translateY: sheetAnim }] },
        ]}
        pointerEvents={selectedEvent ? 'box-none' : 'none'}
      >
        {selectedEvent && (
          <BottomSheet
            event={selectedEvent}
            liked={isLiked(selectedEvent.id)}
            onLike={() => toggleLiked(selectedEvent.id)}
            onClose={closeSheet}
            onOpen={() => {
              closeSheet();
              navigation.navigate('EventDetail', { eventId: selectedEvent.id });
            }}
          />
        )}
      </Animated.View>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Map pin — outline (unselected) or solid black (selected)
// ---------------------------------------------------------------------------
function EventPin({ event, selected, onPress }) {
  return (
    <Marker coordinate={event.location} onPress={onPress} tracksViewChanges={false}>
      <View style={styles.pinWrap}>
        <Ionicons
          name={selected ? 'location' : 'location-outline'}
          size={selected ? 40 : 32}
          color={selected ? colors.black : colors.black}
        />
      </View>
    </Marker>
  );
}

// ---------------------------------------------------------------------------
// Bottom sheet content
// ---------------------------------------------------------------------------
function BottomSheet({ event, liked, onLike, onClose, onOpen }) {
  return (
    <View style={styles.sheetInner}>
      {/* Poster card with X and heart overlaid */}
      <View style={styles.posterWrap}>
        <EventPosterCard event={event} height={200} style={styles.posterRadius} />

        {/* X button */}
        <TouchableOpacity style={styles.closeBtn} onPress={onClose} activeOpacity={0.8}>
          <Ionicons name="close" size={16} color={colors.black} />
        </TouchableOpacity>

        {/* Heart button */}
        <TouchableOpacity style={styles.heartBtn} onPress={onLike} activeOpacity={0.8}>
          <Ionicons
            name={liked ? 'heart' : 'heart-outline'}
            size={18}
            color={liked ? colors.liked : colors.black}
          />
        </TouchableOpacity>
      </View>

      {/* Info row below poster */}
      <TouchableOpacity style={styles.infoRow} onPress={onOpen} activeOpacity={0.9}>
        <View style={styles.infoLeft}>
          <Text style={styles.infoTitle} numberOfLines={1}>{event.title}</Text>
          <View style={styles.infoMeta}>
            <Ionicons name="location-outline" size={12} color={colors.gray} />
            <Text style={styles.infoMetaText}>{event.venue}</Text>
            <Text style={styles.infoMetaDot}>·</Text>
            <Ionicons name="calendar-outline" size={12} color={colors.gray} />
            <Text style={styles.infoMetaText}>{formatEventDate(event.dateTime)}</Text>
            <Text style={styles.infoMetaDot}>·</Text>
            <AttendeeStack
              colors={event.attendeeColors || []}
              count={event.goingCount}
              textColor={colors.black}
            />
          </View>
        </View>
        <Ionicons name="chevron-forward" size={18} color={colors.black} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white },

  headerWrap: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.white,
    ...{
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 8,
      elevation: 4,
    },
  },

  locationBtn: {
    position: 'absolute',
    right: spacing.md,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow.md,
  },

  loadingBadge: {
    position: 'absolute',
    right: spacing.md,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow.sm,
  },

  // Pin
  pinWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Bottom sheet
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
  },
  sheetInner: {
    backgroundColor: colors.white,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    overflow: 'hidden',
    ...shadow.lg,
  },

  posterWrap: {
    position: 'relative',
  },
  posterRadius: {
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
  },

  closeBtn: {
    position: 'absolute',
    top: spacing.sm,
    left: spacing.sm,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heartBtn: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  infoLeft: { flex: 1, marginRight: spacing.sm },
  infoTitle: { ...typography.h3, color: colors.black, marginBottom: 4 },
  infoMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flexWrap: 'wrap',
  },
  infoMetaText: { ...typography.caption, color: colors.gray },
  infoMetaDot: { ...typography.caption, color: colors.grayMid },
});
