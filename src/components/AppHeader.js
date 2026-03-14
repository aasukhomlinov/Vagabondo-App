import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing } from '../theme';

/**
 * Shared top header — "joint" logo + scrollable filter chips.
 * Matches the mockup: no borders on header or chips, plain icon+text style.
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

      {/* Filter chips — borderless, icon + text */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chips}
      >
        {/* City */}
        <TouchableOpacity style={styles.chip} onPress={onCityPress} activeOpacity={0.7}>
          <Ionicons name="location" size={15} color={colors.black} />
          <Text style={styles.chipText}>{city}</Text>
        </TouchableOpacity>

        {/* Category */}
        <TouchableOpacity style={styles.chip} onPress={onCategoryPress} activeOpacity={0.7}>
          <Ionicons name="accessibility-outline" size={15} color={colors.black} />
          <Text style={styles.chipText}>{category || 'All events'}</Text>
        </TouchableOpacity>

        {/* Time */}
        <TouchableOpacity style={styles.chip} onPress={onTimePress} activeOpacity={0.7}>
          <Ionicons name="calendar-outline" size={15} color={colors.black} />
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
    gap: spacing.sm,
  },
  logo: {
    ...typography.appName,
    color: colors.black,
    flexShrink: 0,
  },
  chips: {
    flexDirection: 'row',
    gap: spacing.md,
    alignItems: 'center',
    paddingRight: spacing.md,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
  },
  chipText: {
    ...typography.chip,
    color: colors.black,
    fontSize: 15,
  },
});
