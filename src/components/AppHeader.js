import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, radius } from '../theme';

/**
 * Shared top header — "joint" logo + scrollable filter chips.
 * Props:
 *   city        string   — displayed city name
 *   category    string   — active category filter label ('' = all)
 *   timeFilter  string   — 'anytime' | 'today' | 'this_week'
 *   onCityPress     fn
 *   onCategoryPress fn
 *   onTimePress     fn
 */
export default function AppHeader({
  city = 'Rome',
  category = '',
  timeFilter = 'anytime',
  onCityPress,
  onCategoryPress,
  onTimePress,
}) {
  const timeLabel = {
    anytime: 'Anytime',
    today: 'Today',
    this_week: 'This week',
  }[timeFilter] || 'Anytime';

  return (
    <View style={styles.container}>
      {/* Logo */}
      <Text style={styles.logo}>joint</Text>

      {/* Filter chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chips}
      >
        {/* City */}
        <TouchableOpacity style={styles.chip} onPress={onCityPress} activeOpacity={0.7}>
          <Ionicons name="location-outline" size={13} color={colors.black} />
          <Text style={styles.chipText}>{city}</Text>
        </TouchableOpacity>

        {/* Category */}
        <TouchableOpacity style={styles.chip} onPress={onCategoryPress} activeOpacity={0.7}>
          <Ionicons name="walk-outline" size={13} color={colors.black} />
          <Text style={styles.chipText}>{category || 'All events'}</Text>
        </TouchableOpacity>

        {/* Time */}
        <TouchableOpacity style={styles.chip} onPress={onTimePress} activeOpacity={0.7}>
          <Ionicons name="calendar-outline" size={13} color={colors.black} />
          <Text style={styles.chipText}>{timeLabel}</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.grayBorder,
    gap: spacing.md,
  },
  logo: {
    ...typography.appName,
    color: colors.black,
    flexShrink: 0,
  },
  chips: {
    flexDirection: 'row',
    gap: spacing.xs,
    alignItems: 'center',
    paddingRight: spacing.md,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.grayBorder,
    backgroundColor: colors.white,
  },
  chipText: {
    ...typography.chip,
    color: colors.black,
  },
});
