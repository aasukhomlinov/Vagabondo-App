import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import * as Location from 'expo-location';

import { useEvents } from '../store/EventContext';
import { colors, categories as CAT, spacing, radius, typography, shadow } from '../theme';
import { DEFAULT_LOCATION } from '../utils/helpers';

const STEPS = ['Category', 'Details', 'Location & Social'];

export default function CreateEventScreen() {
  const { addEvent } = useEvents();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  const [step, setStep] = useState(0);
  const [category, setCategory] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [locationName, setLocationName] = useState('');
  const [location, setLocation] = useState(DEFAULT_LOCATION);
  const [telegram, setTelegram] = useState('');
  const [instagram, setInstagram] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [fetchingLocation, setFetchingLocation] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchLocation = useCallback(async () => {
    setFetchingLocation(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const loc = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        setLocation({
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
        });

        // Reverse geocode
        const [place] = await Location.reverseGeocodeAsync({
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
        });
        if (place) {
          const parts = [place.street, place.city, place.country].filter(Boolean);
          setLocationName(parts.join(', '));
        }
      } else {
        Alert.alert(
          'Location needed',
          'Please enable location permission to use your current spot, or type an address below.'
        );
      }
    } catch {
      Alert.alert('Error', 'Could not get your location. Please type an address.');
    } finally {
      setFetchingLocation(false);
    }
  }, []);

  // Auto-fetch location when reaching the last step
  useEffect(() => {
    if (step === 2 && locationName === '') {
      fetchLocation();
    }
  }, [step]);

  const canNext = useCallback(() => {
    if (step === 0) return !!category;
    if (step === 1) return title.trim().length > 0 && authorName.trim().length > 0;
    return true;
  }, [step, category, title, authorName]);

  const handleNext = () => {
    if (step < STEPS.length - 1) setStep((s) => s + 1);
    else handleSubmit();
  };

  const handleBack = () => {
    if (step > 0) setStep((s) => s - 1);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    const social = {};
    if (telegram.trim()) social.telegram = telegram.startsWith('http') ? telegram.trim() : `https://t.me/${telegram.trim().replace('@', '')}`;
    if (instagram.trim()) social.instagram = instagram.startsWith('http') ? instagram.trim() : `https://instagram.com/${instagram.trim().replace('@', '')}`;
    if (whatsapp.trim()) social.whatsapp = whatsapp.startsWith('http') ? whatsapp.trim() : `https://wa.me/${whatsapp.trim().replace(/\D/g, '')}`;

    const event = addEvent({
      title: title.trim(),
      description: description.trim(),
      category,
      locationName: locationName.trim() || 'Unknown location',
      location,
      authorName: authorName.trim(),
      social,
    });

    setSubmitting(false);

    // Reset form
    setStep(0);
    setCategory('');
    setTitle('');
    setDescription('');
    setAuthorName('');
    setLocationName('');
    setLocation(DEFAULT_LOCATION);
    setTelegram('');
    setInstagram('');
    setWhatsapp('');

    // Navigate to the new event
    navigation.navigate('EventDetail', { eventId: event.id });
  };

  const catList = Object.entries(CAT).map(([key, val]) => ({ key, ...val }));

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={[styles.container, { paddingTop: insets.top }]}>
        {/* Header */}
        <View style={styles.header}>
          {step > 0 ? (
            <TouchableOpacity onPress={handleBack} style={styles.backBtn}>
              <Text style={styles.backText}>← Back</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.backBtn} />
          )}
          <Text style={styles.headerTitle}>New Event</Text>
          <View style={styles.backBtn} />
        </View>

        {/* Progress dots */}
        <View style={styles.progress}>
          {STEPS.map((s, i) => (
            <View key={s} style={styles.progressItem}>
              <View style={[styles.progressDot, i <= step && styles.progressDotActive]}>
                {i < step && <Text style={styles.progressCheck}>✓</Text>}
                {i === step && <View style={styles.progressDotInner} />}
              </View>
              {i < STEPS.length - 1 && (
                <View style={[styles.progressLine, i < step && styles.progressLineActive]} />
              )}
            </View>
          ))}
        </View>
        <Text style={styles.stepLabel}>{STEPS[step]}</Text>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Step 0: Category */}
          {step === 0 && (
            <View>
              <Text style={styles.stepHint}>What kind of event is this?</Text>
              <View style={styles.catGrid}>
                {catList.map((cat) => (
                  <TouchableOpacity
                    key={cat.key}
                    style={[
                      styles.catTile,
                      { borderColor: category === cat.key ? cat.color : colors.border },
                      category === cat.key && { backgroundColor: cat.bg },
                    ]}
                    onPress={() => setCategory(cat.key)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.catTileEmoji}>{cat.emoji}</Text>
                    <Text
                      style={[
                        styles.catTileLabel,
                        category === cat.key && { color: cat.color, fontWeight: '700' },
                      ]}
                    >
                      {cat.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Step 1: Details */}
          {step === 1 && (
            <View style={styles.form}>
              <Text style={styles.stepHint}>Tell people about your event</Text>

              <Text style={styles.label}>Your name *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Alex"
                placeholderTextColor={colors.textLight}
                value={authorName}
                onChangeText={setAuthorName}
                maxLength={30}
              />

              <Text style={styles.label}>Event title *</Text>
              <TextInput
                style={styles.input}
                placeholder='e.g. "Let\'s visit the Pantheon together!"'
                placeholderTextColor={colors.textLight}
                value={title}
                onChangeText={setTitle}
                maxLength={100}
              />

              <Text style={styles.label}>Description</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Describe your event — when, where to meet, what to expect…"
                placeholderTextColor={colors.textLight}
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={5}
                maxLength={500}
                textAlignVertical="top"
              />
              <Text style={styles.charCount}>{description.length}/500</Text>
            </View>
          )}

          {/* Step 2: Location & Social */}
          {step === 2 && (
            <View style={styles.form}>
              <Text style={styles.stepHint}>Where & how to connect</Text>

              <Text style={styles.label}>Location</Text>
              <View style={styles.locationRow}>
                <TextInput
                  style={[styles.input, styles.locationInput]}
                  placeholder="e.g. Pantheon, Rome"
                  placeholderTextColor={colors.textLight}
                  value={locationName}
                  onChangeText={setLocationName}
                />
                <TouchableOpacity
                  style={styles.locationBtn}
                  onPress={fetchLocation}
                  disabled={fetchingLocation}
                >
                  {fetchingLocation ? (
                    <ActivityIndicator size="small" color="#FFF" />
                  ) : (
                    <Text style={styles.locationBtnText}>📍</Text>
                  )}
                </TouchableOpacity>
              </View>

              <Text style={styles.sectionTitle}>How can people reach you?</Text>
              <Text style={styles.sectionHint}>
                Add at least one so people can connect with you.
              </Text>

              <Text style={styles.label}>Telegram username</Text>
              <View style={styles.socialRow}>
                <Text style={styles.socialPrefix}>@</Text>
                <TextInput
                  style={[styles.input, styles.socialInput]}
                  placeholder="yourusername"
                  placeholderTextColor={colors.textLight}
                  value={telegram}
                  onChangeText={setTelegram}
                  autoCapitalize="none"
                />
              </View>

              <Text style={styles.label}>Instagram username</Text>
              <View style={styles.socialRow}>
                <Text style={styles.socialPrefix}>@</Text>
                <TextInput
                  style={[styles.input, styles.socialInput]}
                  placeholder="yourusername"
                  placeholderTextColor={colors.textLight}
                  value={instagram}
                  onChangeText={setInstagram}
                  autoCapitalize="none"
                />
              </View>

              <Text style={styles.label}>WhatsApp number</Text>
              <View style={styles.socialRow}>
                <Text style={styles.socialPrefix}>+</Text>
                <TextInput
                  style={[styles.input, styles.socialInput]}
                  placeholder="1234567890"
                  placeholderTextColor={colors.textLight}
                  value={whatsapp}
                  onChangeText={setWhatsapp}
                  keyboardType="phone-pad"
                />
              </View>
            </View>
          )}
        </ScrollView>

        {/* Next / Submit button */}
        <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.md }]}>
          <TouchableOpacity
            style={[styles.nextBtn, !canNext() && styles.nextBtnDisabled]}
            onPress={handleNext}
            disabled={!canNext() || submitting}
            activeOpacity={0.85}
          >
            {submitting ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.nextBtnText}>
                {step === STEPS.length - 1 ? '🚀 Post event' : 'Continue →'}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    justifyContent: 'space-between',
  },
  backBtn: { width: 70 },
  backText: { ...typography.body, color: colors.primary, fontWeight: '600' },
  headerTitle: { ...typography.h3, color: colors.text },

  progress: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    marginTop: spacing.sm,
  },
  progressItem: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  progressDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressDotActive: { backgroundColor: colors.primary },
  progressDotInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFF',
  },
  progressCheck: { fontSize: 12, color: '#FFF', fontWeight: '700' },
  progressLine: { flex: 1, height: 2, backgroundColor: colors.border },
  progressLineActive: { backgroundColor: colors.primary },
  stepLabel: {
    ...typography.label,
    color: colors.primary,
    textAlign: 'center',
    marginTop: spacing.xs,
    marginBottom: spacing.sm,
  },

  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: spacing.md, paddingBottom: spacing.xl },

  stepHint: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.md,
  },

  // Category grid
  catGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  catTile: {
    width: '30%',
    aspectRatio: 1,
    borderRadius: radius.md,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.card,
    gap: 4,
  },
  catTileEmoji: { fontSize: 28 },
  catTileLabel: { ...typography.caption, color: colors.textSecondary, fontWeight: '600' },

  // Form
  form: { gap: 2 },
  label: { ...typography.label, color: colors.text, marginTop: spacing.md, marginBottom: 6 },
  input: {
    backgroundColor: colors.card,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    ...typography.body,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
  },
  textArea: {
    minHeight: 120,
    paddingTop: 12,
  },
  charCount: { ...typography.caption, color: colors.textLight, textAlign: 'right', marginTop: 4 },

  locationRow: { flexDirection: 'row', gap: spacing.sm, alignItems: 'center' },
  locationInput: { flex: 1 },
  locationBtn: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  locationBtnText: { fontSize: 20 },

  sectionTitle: { ...typography.h3, color: colors.text, marginTop: spacing.lg },
  sectionHint: { ...typography.bodySmall, color: colors.textSecondary, marginBottom: spacing.sm },

  socialRow: { flexDirection: 'row', alignItems: 'center', gap: 0 },
  socialPrefix: {
    ...typography.body,
    color: colors.textSecondary,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.sm,
    paddingVertical: 12,
    borderWidth: 1,
    borderRightWidth: 0,
    borderColor: colors.border,
    borderTopLeftRadius: radius.md,
    borderBottomLeftRadius: radius.md,
  },
  socialInput: {
    flex: 1,
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0,
  },

  footer: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.background,
  },
  nextBtn: {
    backgroundColor: colors.primary,
    borderRadius: radius.lg,
    paddingVertical: 16,
    alignItems: 'center',
    ...shadow.md,
  },
  nextBtnDisabled: { opacity: 0.4 },
  nextBtnText: { ...typography.button, color: '#FFF', fontSize: 16 },
});
