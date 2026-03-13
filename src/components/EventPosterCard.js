import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { typography, spacing } from '../theme';
import { parseDateParts } from '../utils/helpers';

/**
 * Event poster card — colored background with title, venue, and date widget.
 * Matches the editorial poster aesthetic from the design.
 */
export default function EventPosterCard({ event, height = 220, style }) {
  const { day, month, hour, min } = parseDateParts(event.dateTime);

  // Determine text color based on poster brightness
  const textColor = isLightColor(event.posterColor) ? '#000000' : '#FFFFFF';
  const subColor = isLightColor(event.posterColor)
    ? 'rgba(0,0,0,0.65)'
    : 'rgba(255,255,255,0.7)';
  const dividerColor = isLightColor(event.posterColor)
    ? 'rgba(0,0,0,0.2)'
    : 'rgba(255,255,255,0.3)';

  return (
    <View style={[styles.poster, { backgroundColor: event.posterColor || '#1A1A2E', height }, style]}>
      {/* Subtle noise overlay for texture */}
      <View style={styles.overlay} />

      {/* Content */}
      <View style={styles.content}>
        {/* Title */}
        <Text style={[styles.title, { color: textColor }]} numberOfLines={2}>
          {event.title}
        </Text>

        {/* Venue · City */}
        <Text style={[styles.venue, { color: subColor }]} numberOfLines={1}>
          {event.city}{'  '}
          {event.venue}
        </Text>

        {/* Date widget */}
        <View style={styles.dateWidget}>
          {/* Top row: day | hour */}
          <View style={styles.dateRow}>
            <Text style={[styles.dateNum, { color: textColor }]}>{day}</Text>
            <View style={[styles.dateDividerV, { backgroundColor: dividerColor }]} />
            <Text style={[styles.dateNum, { color: textColor }]}>{hour}</Text>
          </View>

          {/* Arrow between rows */}
          <View style={styles.dateArrow}>
            <Text style={[styles.dateArrowText, { color: subColor }]}>↕</Text>
          </View>

          {/* Bottom row: month | minutes */}
          <View style={styles.dateRow}>
            <Text style={[styles.dateNum, { color: textColor }]}>{month}</Text>
            <View style={[styles.dateDividerV, { backgroundColor: dividerColor }]} />
            <Text style={[styles.dateNum, { color: textColor }]}>{min}</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

/** Stacked avatar circles, like in the design */
export function AttendeeStack({ colors: avatarColors = [], count = 0, textColor = '#000' }) {
  const shown = avatarColors.slice(0, 3);
  return (
    <View style={avatarStyles.row}>
      {shown.map((color, i) => (
        <View
          key={i}
          style={[
            avatarStyles.circle,
            { backgroundColor: color, marginLeft: i > 0 ? -8 : 0, zIndex: 10 - i },
          ]}
        />
      ))}
      <Text style={[avatarStyles.count, { color: textColor }]}>{count}</Text>
    </View>
  );
}

// Rough luminance check
function isLightColor(hex) {
  if (!hex || !hex.startsWith('#')) return false;
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 > 128;
}

const styles = StyleSheet.create({
  poster: {
    width: '100%',
    position: 'relative',
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    // Subtle bottom gradient feel using a semi-transparent overlay
    backgroundColor: 'rgba(0,0,0,0.08)',
  },
  content: {
    padding: spacing.md,
    paddingBottom: spacing.lg,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.8,
    lineHeight: 30,
    marginBottom: 4,
  },
  venue: {
    fontSize: 13,
    fontWeight: '400',
    letterSpacing: 0.2,
    marginBottom: spacing.sm,
  },
  // Date widget
  dateWidget: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 0,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dateNum: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.5,
    width: 18,
    textAlign: 'center',
  },
  dateDividerV: {
    width: 1,
    height: 14,
    marginHorizontal: 2,
  },
  dateArrow: {
    paddingHorizontal: 6,
    alignItems: 'center',
  },
  dateArrowText: {
    fontSize: 10,
  },
});

const avatarStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  circle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  count: {
    fontSize: 13,
    fontWeight: '400',
    marginLeft: 6,
  },
});
