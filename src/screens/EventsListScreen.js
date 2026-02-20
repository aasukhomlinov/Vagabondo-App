import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

import { useEvents } from '../store/EventContext';
import { colors, categories, spacing, radius, typography, shadow } from '../theme';
import { formatTimeAgo, truncate } from '../utils/helpers';

const ALL_FILTER = 'all';

export default function EventsListScreen() {
  const { events, toggleGoing, isGoing } = useEvents();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState(ALL_FILTER);
  const [sortBy, setSortBy] = useState('newest'); // 'newest' | 'popular'
  const [refreshing, setRefreshing] = useState(false);

  const categoryList = [
    { key: ALL_FILTER, label: 'All', emoji: '✨' },
    ...Object.entries(categories).map(([key, val]) => ({
      key,
      label: val.label,
      emoji: val.emoji,
    })),
  ];

  const filtered = useMemo(() => {
    let list = [...events];

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (e) =>
          e.title.toLowerCase().includes(q) ||
          (e.description && e.description.toLowerCase().includes(q)) ||
          (e.locationName && e.locationName.toLowerCase().includes(q))
      );
    }

    if (activeCategory !== ALL_FILTER) {
      list = list.filter((e) => e.category === activeCategory);
    }

    if (sortBy === 'newest') {
      list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else {
      list.sort((a, b) => b.goingCount - a.goingCount);
    }

    return list;
  }, [events, search, activeCategory, sortBy]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 600);
  }, []);

  const renderItem = useCallback(
    ({ item }) => (
      <EventListCard
        event={item}
        going={isGoing(item.id)}
        onToggleGoing={() => toggleGoing(item.id)}
        onPress={() => navigation.navigate('EventDetail', { eventId: item.id })}
      />
    ),
    [isGoing, toggleGoing, navigation]
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Events</Text>
        <View style={styles.sortRow}>
          <TouchableOpacity
            style={[styles.sortBtn, sortBy === 'newest' && styles.sortBtnActive]}
            onPress={() => setSortBy('newest')}
          >
            <Text style={[styles.sortBtnText, sortBy === 'newest' && styles.sortBtnTextActive]}>
              Newest
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.sortBtn, sortBy === 'popular' && styles.sortBtnActive]}
            onPress={() => setSortBy('popular')}
          >
            <Text style={[styles.sortBtnText, sortBy === 'popular' && styles.sortBtnTextActive]}>
              🔥 Popular
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Search */}
      <View style={styles.searchWrap}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search events, places…"
          placeholderTextColor={colors.textLight}
          value={search}
          onChangeText={setSearch}
          returnKeyType="search"
          clearButtonMode="while-editing"
        />
      </View>

      {/* Category filters */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filters}
      >
        {categoryList.map((cat) => (
          <TouchableOpacity
            key={cat.key}
            style={[
              styles.filterChip,
              activeCategory === cat.key && styles.filterChipActive,
            ]}
            onPress={() =>
              setActiveCategory(activeCategory === cat.key ? ALL_FILTER : cat.key)
            }
            activeOpacity={0.7}
          >
            <Text style={styles.filterEmoji}>{cat.emoji}</Text>
            <Text
              style={[
                styles.filterLabel,
                activeCategory === cat.key && styles.filterLabelActive,
              ]}
            >
              {cat.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Events list */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>🌍</Text>
            <Text style={styles.emptyTitle}>No events found</Text>
            <Text style={styles.emptySubtitle}>
              {search ? 'Try a different search' : 'Be the first to create an event!'}
            </Text>
          </View>
        }
      />
    </View>
  );
}

// ---------------------------------------------------------------------------
// Event card for the list
// ---------------------------------------------------------------------------
function EventListCard({ event, going, onToggleGoing, onPress }) {
  const cat = categories[event.category] || categories.other;
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      {/* Category stripe */}
      <View style={[styles.cardStripe, { backgroundColor: cat.color }]} />

      <View style={styles.cardBody}>
        {/* Top row */}
        <View style={styles.cardTop}>
          <View style={[styles.catBadge, { backgroundColor: cat.bg }]}>
            <Text style={styles.catEmoji}>{cat.emoji}</Text>
            <Text style={[styles.catLabel, { color: cat.color }]}>{cat.label}</Text>
          </View>
          <Text style={styles.cardTime}>{formatTimeAgo(event.createdAt)}</Text>
        </View>

        {/* Title */}
        <Text style={styles.cardTitle} numberOfLines={2}>
          {event.title}
        </Text>

        {/* Description */}
        <Text style={styles.cardDesc} numberOfLines={2}>
          {truncate(event.description, 120)}
        </Text>

        {/* Location */}
        {event.locationName && (
          <Text style={styles.cardLocation} numberOfLines={1}>
            📍 {event.locationName}
          </Text>
        )}

        {/* Footer */}
        <View style={styles.cardFooter}>
          <View style={styles.cardMeta}>
            <Text style={styles.cardAuthor}>by {event.authorName}</Text>
            <Text style={styles.cardSep}>·</Text>
            <Text style={styles.cardReplies}>💬 {event.replies.length}</Text>
          </View>
          <TouchableOpacity
            style={[styles.goingBtn, going && styles.goingBtnActive]}
            onPress={onToggleGoing}
            activeOpacity={0.8}
          >
            <Text style={styles.goingBtnEmoji}>{going ? '✅' : '🙋'}</Text>
            <Text style={[styles.goingBtnText, going && styles.goingBtnTextActive]}>
              {going ? "I'm going" : "I'm going"} · {event.goingCount}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  title: { ...typography.h2, color: colors.text },
  sortRow: { flexDirection: 'row', gap: spacing.xs },
  sortBtn: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.full,
    backgroundColor: colors.surface,
  },
  sortBtnActive: { backgroundColor: colors.primaryBg },
  sortBtnText: { ...typography.caption, color: colors.textSecondary, fontWeight: '600' },
  sortBtnTextActive: { color: colors.primary },

  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing.md,
    marginBottom: spacing.sm,
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    ...shadow.sm,
  },
  searchIcon: { fontSize: 16, marginRight: spacing.sm },
  searchInput: {
    flex: 1,
    height: 44,
    ...typography.body,
    color: colors.text,
  },

  filters: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
    gap: spacing.xs,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: radius.full,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: spacing.xs,
  },
  filterChipActive: {
    backgroundColor: colors.primaryBg,
    borderColor: colors.primary,
  },
  filterEmoji: { fontSize: 14 },
  filterLabel: { ...typography.label, color: colors.textSecondary },
  filterLabelActive: { color: colors.primary },

  list: { paddingHorizontal: spacing.md, paddingBottom: spacing.xl },

  // Card
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    marginBottom: spacing.sm,
    flexDirection: 'row',
    overflow: 'hidden',
    ...shadow.sm,
  },
  cardStripe: { width: 4 },
  cardBody: { flex: 1, padding: spacing.md },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  catBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.full,
  },
  catEmoji: { fontSize: 12 },
  catLabel: { ...typography.caption, fontWeight: '700' },
  cardTime: { ...typography.caption, color: colors.textLight },
  cardTitle: { ...typography.h3, color: colors.text, marginBottom: 4 },
  cardDesc: { ...typography.bodySmall, color: colors.textSecondary, marginBottom: 6 },
  cardLocation: { ...typography.caption, color: colors.textSecondary, marginBottom: spacing.sm },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardMeta: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  cardAuthor: { ...typography.caption, color: colors.text, fontWeight: '600' },
  cardSep: { color: colors.textLight },
  cardReplies: { ...typography.caption, color: colors.textSecondary },

  goingBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: radius.full,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  goingBtnActive: {
    backgroundColor: colors.goingBg,
    borderColor: colors.going,
  },
  goingBtnEmoji: { fontSize: 13 },
  goingBtnText: { ...typography.caption, color: colors.textSecondary, fontWeight: '600' },
  goingBtnTextActive: { color: colors.going },

  empty: { alignItems: 'center', paddingTop: spacing.xxl },
  emptyEmoji: { fontSize: 48, marginBottom: spacing.md },
  emptyTitle: { ...typography.h3, color: colors.text, marginBottom: spacing.xs },
  emptySubtitle: { ...typography.body, color: colors.textSecondary, textAlign: 'center' },
});
