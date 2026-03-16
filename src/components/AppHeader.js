import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing } from '../theme';

/**
 * Shared top header — "joint" logo + scrollable filter chips (no borders).
 */
export default function AppHeader({
  city = 'Belgrade',
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

      {/* Filter chips — borderless, just icon + text */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chips}
      >
        {/* City */}
        <TouchableOpacity style={styles.chip} onPress={onCityPress} activeOpacity={0.7}>
          <Ionicons name="location" size={14} color={colors.black} />
          <Text style={styles.chipText}>{city}</Text>
        </TouchableOpacity>

        {/* Category */}
        <TouchableOpacity style={styles.chip} onPress={onCategoryPress} activeOpacity={0.7}>
          <Text style={styles.chipIcon}>✦</Text>
          <Text style={styles.chipText}>{category || 'Concerts'}</Text>
        </TouchableOpacity>

        {/* Time */}
        <TouchableOpacity style={styles.chip} onPress={onTimePress} activeOpacity={0.7}>
          <Ionicons name="calendar" size={14} color={colors.black} />
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
    gap: 6,
  },
  logo: {
    ...typography.appName,
    color: colors.black,
    flexShrink: 0,
  },
  chips: {
    flexDirection: 'row',
    gap: 2,
    alignItems: 'center',
    paddingRight: spacing.md,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  chipIcon: {
    fontSize: 13,
    color: colors.black,
  },
  chipText: {
    ...typography.chip,
    color: colors.black,
  },
});
