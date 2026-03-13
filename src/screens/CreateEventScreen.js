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
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import * as Location from 'expo-location';

import { useEvents } from '../store/EventContext';
import { colors, categories as CAT, spacing, radius, typography, shadow, posterColors } from '../theme';
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
  const [venue, setVenue] = useState('');
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
        const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        setLocation({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
        const [place] = await Location.reverseGeocodeAsync({
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
        });
        if (place) {
          setVenue([place.street, place.district].filter(Boolean).join(', '));
          setLocationName([place.street, place.city].filter(Boolean).join(', '));
        }
      } else {
        Alert.alert('Location', 'Enable location permissions or type your venue manually.');
      }
    } catch {
      Alert.alert('Error', 'Could not detect location. Please type it manually.');
    } finally {
      setFetchingLocation(false);
    }
  }, []);

  useEffect(() => {
    if (step === 2 && !locationName) fetchLocation();
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

  const handleSubmit = async () => {
    setSubmitting(true);
    const social = {};
    if (telegram.trim()) social.telegram = `https://t.me/${telegram.trim().replace('@', '')}`;
    if (instagram.trim()) social.instagram = `https://instagram.com/${instagram.trim().replace('@', '')}`;
    if (whatsapp.trim()) social.whatsapp = `https://wa.me/${whatsapp.trim().replace(/\D/g, '')}`;

    // Pick a random poster color
    const posterColor = posterColors[Math.floor(Math.random() * posterColors.length)];

    const event = addEvent({
      title: title.trim(),
      description: description.trim(),
      category,
      venue: venue.trim() || locationName.trim() || 'Unknown venue',
      city: 'Rome',
      locationName: locationName.trim() || 'Unknown location',
      location,
      authorName: authorName.trim(),
      social,
      posterColor,
      dateTime: new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString(), // default: 1 week from now
    });

    setSubmitting(false);
    setStep(0); setCategory(''); setTitle(''); setDescription('');
    setAuthorName(''); setVenue(''); setLocationName('');
    setLocation(DEFAULT_LOCATION); setTelegram(''); setInstagram(''); setWhatsapp('');

    navigation.navigate('EventDetail', { eventId: event.id });
  };

  const catList = Object.entries(CAT).map(([key, val]) => ({ key, ...val }));

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={[styles.container, { paddingTop: insets.top }]}>
        {/* Header */}
        <View style={styles.header}>
          {step > 0 ? (
            <TouchableOpacity onPress={() => setStep((s) => s - 1)} style={styles.backBtn}>
              <Ionicons name="arrow-back" size={22} color={colors.black} />
            </TouchableOpacity>
          ) : <View style={styles.backBtn} />}
          <Text style={styles.headerTitle}>New Event</Text>
          <View style={styles.backBtn} />
        </View>

        {/* Progress line */}
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${((step + 1) / STEPS.length) * 100}%` }]} />
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
              <Text style={styles.stepHint}>What kind of event?</Text>
              <View style={styles.catGrid}>
                {catList.map((cat) => (
                  <TouchableOpacity
                    key={cat.key}
                    style={[styles.catTile, category === cat.key && styles.catTileActive]}
                    onPress={() => setCategory(cat.key)}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name={cat.icon || 'ellipsis-horizontal-outline'}
                      size={26}
                      color={category === cat.key ? colors.white : colors.black}
                    />
                    <Text style={[styles.catLabel, category === cat.key && styles.catLabelActive]}>
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
              <Text style={styles.stepHint}>Tell people about it</Text>
              <Field label="Your name *">
                <TextInput style={styles.input} placeholder="e.g. Alex" placeholderTextColor={colors.grayMid}
                  value={authorName} onChangeText={setAuthorName} maxLength={30} />
              </Field>
              <Field label="Event title *">
                <TextInput style={styles.input} placeholder='e.g. "Jazz night at Trastevere"'
                  placeholderTextColor={colors.grayMid} value={title} onChangeText={setTitle} maxLength={100} />
              </Field>
              <Field label="Description">
                <TextInput style={[styles.input, styles.textArea]}
                  placeholder="When, where to meet, what to expect…"
                  placeholderTextColor={colors.grayMid} value={description} onChangeText={setDescription}
                  multiline numberOfLines={5} maxLength={500} textAlignVertical="top" />
                <Text style={styles.charCount}>{description.length}/500</Text>
              </Field>
            </View>
          )}

          {/* Step 2: Location & Social */}
          {step === 2 && (
            <View style={styles.form}>
              <Text style={styles.stepHint}>Where & how to connect</Text>

              <Field label="Venue name">
                <TextInput style={styles.input} placeholder="e.g. Karmakoma"
                  placeholderTextColor={colors.grayMid} value={venue} onChangeText={setVenue} />
              </Field>

              <Field label="Address">
                <View style={styles.locationRow}>
                  <TextInput style={[styles.input, { flex: 1 }]} placeholder="e.g. Via Libetta 1, Rome"
                    placeholderTextColor={colors.grayMid} value={locationName} onChangeText={setLocationName} />
                  <TouchableOpacity style={styles.locateBtn} onPress={fetchLocation} disabled={fetchingLocation}>
                    {fetchingLocation
                      ? <ActivityIndicator size="small" color={colors.white} />
                      : <Ionicons name="locate" size={18} color={colors.white} />}
                  </TouchableOpacity>
                </View>
              </Field>

              <Text style={styles.sectionTitle}>How can people reach you?</Text>

              <Field label="Telegram username">
                <View style={styles.socialRow}>
                  <Text style={styles.socialPrefix}>@</Text>
                  <TextInput style={[styles.input, styles.socialInput]} placeholder="yourusername"
                    placeholderTextColor={colors.grayMid} value={telegram} onChangeText={setTelegram}
                    autoCapitalize="none" />
                </View>
              </Field>

              <Field label="Instagram username">
                <View style={styles.socialRow}>
                  <Text style={styles.socialPrefix}>@</Text>
                  <TextInput style={[styles.input, styles.socialInput]} placeholder="yourusername"
                    placeholderTextColor={colors.grayMid} value={instagram} onChangeText={setInstagram}
                    autoCapitalize="none" />
                </View>
              </Field>

              <Field label="WhatsApp number">
                <View style={styles.socialRow}>
                  <Text style={styles.socialPrefix}>+</Text>
                  <TextInput style={[styles.input, styles.socialInput]} placeholder="1234567890"
                    placeholderTextColor={colors.grayMid} value={whatsapp} onChangeText={setWhatsapp}
                    keyboardType="phone-pad" />
                </View>
              </Field>
            </View>
          )}
        </ScrollView>

        {/* Footer button */}
        <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.md }]}>
          <TouchableOpacity
            style={[styles.nextBtn, !canNext() && styles.nextBtnDisabled]}
            onPress={handleNext}
            disabled={!canNext() || submitting}
            activeOpacity={0.85}
          >
            {submitting
              ? <ActivityIndicator color={colors.white} />
              : <Text style={styles.nextBtnText}>
                  {step === STEPS.length - 1 ? 'Post event' : 'Continue'}
                </Text>}
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

function Field({ label, children }) {
  return (
    <View style={fieldStyles.wrap}>
      <Text style={fieldStyles.label}>{label}</Text>
      {children}
    </View>
  );
}

const fieldStyles = StyleSheet.create({
  wrap: { marginBottom: spacing.md },
  label: { ...typography.label, color: colors.gray, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 },
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.grayBorder,
  },
  backBtn: { width: 40, height: 40, justifyContent: 'center' },
  headerTitle: { ...typography.h3, color: colors.black },

  progressBar: {
    height: 2,
    backgroundColor: colors.grayBorder,
  },
  progressFill: {
    height: 2,
    backgroundColor: colors.black,
  },
  stepLabel: {
    ...typography.caption,
    color: colors.gray,
    textAlign: 'center',
    paddingVertical: spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },

  scroll: { flex: 1 },
  scrollContent: { padding: spacing.md, paddingBottom: spacing.xl },

  stepHint: { ...typography.h2, color: colors.black, marginBottom: spacing.lg },

  catGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  catTile: {
    width: '30%',
    aspectRatio: 1,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.grayBorder,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
    gap: 6,
  },
  catTileActive: {
    backgroundColor: colors.black,
    borderColor: colors.black,
  },
  catLabel: { ...typography.caption, color: colors.black, fontWeight: '600' },
  catLabelActive: { color: colors.white },

  form: {},
  input: {
    borderWidth: 1,
    borderColor: colors.grayBorder,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    ...typography.body,
    color: colors.black,
    backgroundColor: colors.white,
  },
  textArea: { minHeight: 110, paddingTop: 12 },
  charCount: { ...typography.caption, color: colors.grayMid, textAlign: 'right', marginTop: 4 },

  locationRow: { flexDirection: 'row', gap: spacing.sm },
  locateBtn: {
    width: 46,
    height: 46,
    borderRadius: radius.md,
    backgroundColor: colors.black,
    alignItems: 'center',
    justifyContent: 'center',
  },

  sectionTitle: { ...typography.h3, color: colors.black, marginBottom: spacing.md, marginTop: spacing.sm },

  socialRow: { flexDirection: 'row', alignItems: 'center' },
  socialPrefix: {
    ...typography.body,
    color: colors.gray,
    backgroundColor: colors.grayLight,
    paddingHorizontal: spacing.sm,
    paddingVertical: 12,
    borderWidth: 1,
    borderRightWidth: 0,
    borderColor: colors.grayBorder,
    borderTopLeftRadius: radius.md,
    borderBottomLeftRadius: radius.md,
  },
  socialInput: { flex: 1, borderTopLeftRadius: 0, borderBottomLeftRadius: 0 },

  footer: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.grayBorder,
  },
  nextBtn: {
    backgroundColor: colors.black,
    borderRadius: radius.md,
    paddingVertical: 15,
    alignItems: 'center',
  },
  nextBtnDisabled: { opacity: 0.3 },
  nextBtnText: { ...typography.button, color: colors.white },
});
