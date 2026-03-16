import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';

/**
 * Event poster card — displays a poster image if available,
 * falls back to a plain colored background (no text overlay).
 */
export default function EventPosterCard({ event, height = 260, style }) {
  if (event.posterImage) {
    return (
      <View style={[styles.posterContainer, { height }, style]}>
        <Image
          source={{ uri: event.posterImage }}
          style={styles.posterImage}
          resizeMode="cover"
        />
      </View>
    );
  }

  // Fallback: plain colored background
  return (
    <View style={[styles.posterContainer, { backgroundColor: event.posterColor || '#1A1A2E', height }, style]} />
  );
}

/** Stacked avatar circles */
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

const styles = StyleSheet.create({
  posterContainer: {
    width: '100%',
    overflow: 'hidden',
    backgroundColor: '#F0F0F0',
  },
  posterImage: {
    width: '100%',
    height: '100%',
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
    fontFamily: 'LINESeedJP-Regular',
    marginLeft: 6,
  },
});
