import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

import { useEvents } from '../store/EventContext';
import { colors, categories, spacing, typography } from '../theme';
import { formatEventDate } from '../utils/helpers';
import AppHeader from '../components/AppHeader';
import EventPosterCard, { AttendeeStack } from '../components/EventPosterCard';

export default function EventsListScreen() {
  const { events, toggleLiked, isLiked } = useEvents();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  const [category, setCategory] = useState('');
  const [timeFilter, setTimeFilter] = useState('anytime');
  const [refreshing, setRefreshing] = useState(false);

  const categoryLabel = category ? (categories[category]?.label || category) : '';

  const filtered = useMemo(() => {
    let list = [...events];
    if (category) list = list.filter((e) => e.category === category);
    list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return list;
  }, [events, category, timeFilter]);

  const cycleCategory = useCallback(() => {
    const keys = ['', ...Object.keys(categories)];
    const idx = keys.indexOf(category);
    setCategory(keys[(idx + 1) % keys.length]);
  }, [category]);

  const cycleTime = useCallback(() => {
    const opts = ['anytime', 'today', 'this_week'];
    const idx = opts.indexOf(timeFilter);
    setTimeFilter(opts[(idx + 1) % opts.length]);
  }, [timeFilter]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 500);
  }, []);

  const renderItem = useCallback(
    ({ item }) => (
      <EventCard
        event={item}
        liked={isLiked(item.id)}
        onLike={() => toggleLiked(item.id)}
        onPress={() => navigation.navigate('EventDetail', { eventId: item.id })}
      />
    ),
    [isLiked, toggleLiked, navigation]
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <AppHeader
        city="Rome"
        category={categoryLabel}
        timeFilter={timeFilter}
        onCityPress={() => {}}
        onCategoryPress={cycleCategory}
        onTimePress={cycleTime}
      />

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.black}
          />
        }
        ItemSeparatorComponent={Separator}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>No events found</Text>
            <Text style={styles.emptySubtitle}>
              {category ? 'Try a different filter' : 'Tap + to create the first event!'}
            </Text>
          </View>
        }
      />
    </View>
  );
}

// ---------------------------------------------------------------------------
// Centered short separator — matching mockup
// ---------------------------------------------------------------------------
function Separator() {
  return (
    <View style={styles.separatorWrap}>
      <View style={styles.separatorLine} />
    </View>
  );
}

// ---------------------------------------------------------------------------
// Event card — matches mockup layout exactly
// ---------------------------------------------------------------------------
function EventCard({ event, liked, onLike, onPress }) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.95} style={styles.card}>
      {/* Full-width poster */}
      <EventPosterCard event={event} height={240} />

      {/* Info below poster */}
      <View style={styles.cardInfo}>
        {/* Title row with arrow */}
        <View style={styles.titleRow}>
          <Text style={styles.title} numberOfLines={1}>{event.title}</Text>
          <Ionicons name="chevron-forward" size={20} color={colors.black} />
        </View>

        {/* Meta: location · date */}
        <View style={styles.metaRow}>
          <Ionicons name="location-outline" size={13} color={colors.gray} />
          <Text style={styles.metaText} numberOfLines={1}>
            {event.venue}
          </Text>
          <Text style={styles.metaDot}>·</Text>
          <Ionicons name="calendar-outline" size={13} color={colors.gray} />
          <Text style={styles.metaText}>
            {formatEventDate(event.dateTime)}
          </Text>
        </View>

        {/* Attendees row */}
        <View style={styles.attendeeRow}>
          <AttendeeStack
            colors={event.attendeeColors || []}
            count={event.goingCount}
            textColor={colors.black}
          />
        </View>

        {/* Like row */}
        <TouchableOpacity
          style={styles.likeBtn}
          onPress={onLike}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          activeOpacity={0.7}
        >
          <Ionicons
            name={liked ? 'heart' : 'heart-outline'}
            size={18}
            color={liked ? colors.liked : colors.black}
          />
          <Text style={[styles.likeText, liked && styles.likeTextActive]}>
            {liked ? 'Liked' : 'Like'}
          </Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white },

  list: { paddingBottom: spacing.xxl },

  // Centered short separator line — matching mockup
  separatorWrap: {
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  separatorLine: {
    width: 60,
    height: 2,
    backgroundColor: colors.grayBorder,
    borderRadius: 1,
  },

  // Card
  card: { backgroundColor: colors.white },

  cardInfo: {
    paddingHorizontal: spacing.md,
    paddingTop: 10,
    paddingBottom: spacing.md,
  },

  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  title: {
    fontSize: 22,
    fontFamily: 'LINESeedJP-Bold',
    letterSpacing: -0.3,
    color: colors.black,
    flex: 1,
    marginRight: spacing.xs,
  },

  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 6,
  },
  metaText: {
    ...typography.bodySmall,
    color: colors.gray,
  },
  metaDot: {
    ...typography.bodySmall,
    color: colors.grayMid,
  },

  attendeeRow: {
    marginBottom: 4,
  },

  likeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  likeText: {
    ...typography.bodySmall,
    color: colors.black,
  },
  likeTextActive: {
    color: colors.liked,
  },

  empty: {
    alignItems: 'center',
    paddingTop: spacing.xxl * 2,
    paddingHorizontal: spacing.lg,
  },
  emptyTitle: { ...typography.h3, color: colors.black, marginBottom: spacing.xs },
  emptySubtitle: { ...typography.body, color: colors.gray, textAlign: 'center' },
});
