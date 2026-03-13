import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Linking,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import MapView, { Marker } from 'react-native-maps';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';

import { useEvents } from '../store/EventContext';
import { colors, spacing, radius, typography, shadow } from '../theme';
import { formatTimeAgo, formatEventDate } from '../utils/helpers';
import EventPosterCard, { AttendeeStack } from '../components/EventPosterCard';

export default function EventDetailScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { eventId } = route.params;

  const { getEvent, toggleLiked, toggleGoing, isLiked, isGoing, addReply } = useEvents();
  const event = getEvent(eventId);
  const liked = isLiked(eventId);
  const going = isGoing(eventId);

  const [replyText, setReplyText] = useState('');
  const [replyName, setReplyName] = useState('');
  const [replyTelegram, setReplyTelegram] = useState('');
  const [replyInstagram, setReplyInstagram] = useState('');
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [submittingReply, setSubmittingReply] = useState(false);

  if (!event) {
    return (
      <View style={styles.notFound}>
        <Text style={styles.notFoundText}>Event not found</Text>
      </View>
    );
  }

  const openLink = async (url) => {
    try {
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) await Linking.openURL(url);
      else Alert.alert('Cannot open', url);
    } catch {
      Alert.alert('Error', 'Could not open this link.');
    }
  };

  const handleSubmitReply = async () => {
    if (!replyText.trim() || !replyName.trim()) return;
    setSubmittingReply(true);
    const social = {};
    if (replyTelegram.trim()) social.telegram = `https://t.me/${replyTelegram.trim().replace('@', '')}`;
    if (replyInstagram.trim()) social.instagram = `https://instagram.com/${replyInstagram.trim().replace('@', '')}`;
    addReply(eventId, { text: replyText.trim(), authorName: replyName.trim(), social });
    setReplyText(''); setReplyName(''); setReplyTelegram(''); setReplyInstagram('');
    setShowReplyForm(false);
    setSubmittingReply(false);
  };

  const hasSocial = event.social && Object.keys(event.social).length > 0;

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={[styles.container, { paddingTop: insets.top }]}>
        {/* Nav bar */}
        <View style={styles.nav}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.navBtn}>
            <Ionicons name="arrow-back" size={22} color={colors.black} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => toggleLiked(eventId)} style={styles.navBtn}>
            <Ionicons
              name={liked ? 'heart' : 'heart-outline'}
              size={22}
              color={liked ? colors.liked : colors.black}
            />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + spacing.xxl }]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Poster */}
          <EventPosterCard event={event} height={260} />

          {/* Main info */}
          <View style={styles.infoSection}>
            <Text style={styles.title}>{event.title}</Text>

            {/* Location · Date */}
            <View style={styles.metaRow}>
              <Ionicons name="location-outline" size={14} color={colors.gray} />
              <Text style={styles.metaText}>{event.venue || event.locationName}</Text>
              <Text style={styles.metaDot}>·</Text>
              <Ionicons name="calendar-outline" size={14} color={colors.gray} />
              <Text style={styles.metaText}>{formatEventDate(event.dateTime)}</Text>
            </View>

            {/* Attendees + "I'm going" */}
            <View style={styles.goingRow}>
              <AttendeeStack
                colors={event.attendeeColors || []}
                count={event.goingCount}
                textColor={colors.black}
              />
              <TouchableOpacity
                style={[styles.goingBtn, going && styles.goingBtnActive]}
                onPress={() => toggleGoing(eventId)}
                activeOpacity={0.85}
              >
                <Text style={[styles.goingBtnText, going && styles.goingBtnTextActive]}>
                  {going ? "I'm going ✓" : "I'm going"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Description */}
          {event.description ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>About</Text>
              <Text style={styles.description}>{event.description}</Text>
            </View>
          ) : null}

          {/* Map */}
          <View style={styles.mapContainer}>
            <MapView
              style={styles.map}
              initialRegion={{
                latitude: event.location.latitude,
                longitude: event.location.longitude,
                latitudeDelta: 0.012,
                longitudeDelta: 0.012,
              }}
              scrollEnabled={false}
              zoomEnabled={false}
              pitchEnabled={false}
              rotateEnabled={false}
            >
              <Marker coordinate={event.location}>
                <Ionicons name="location" size={32} color={colors.black} />
              </Marker>
            </MapView>
            {event.locationName ? (
              <View style={styles.mapLabel}>
                <Text style={styles.mapLabelText} numberOfLines={1}>
                  {event.locationName}
                </Text>
              </View>
            ) : null}
          </View>

          {/* Social connect */}
          {hasSocial && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Connect with {event.authorName}</Text>
              <View style={styles.socialBtns}>
                {event.social.telegram && (
                  <SocialBtn icon="paper-plane-outline" label="Telegram" onPress={() => openLink(event.social.telegram)} />
                )}
                {event.social.instagram && (
                  <SocialBtn icon="camera-outline" label="Instagram" onPress={() => openLink(event.social.instagram)} />
                )}
                {event.social.whatsapp && (
                  <SocialBtn icon="chatbubble-outline" label="WhatsApp" onPress={() => openLink(event.social.whatsapp)} />
                )}
              </View>
            </View>
          )}

          <View style={styles.divider} />

          {/* Replies */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Replies ({event.replies.length})
            </Text>

            {event.replies.length === 0 && (
              <Text style={styles.noReplies}>No replies yet. Be the first!</Text>
            )}

            {event.replies.map((reply) => (
              <ReplyCard key={reply.id} reply={reply} onOpenLink={openLink} />
            ))}

            {!showReplyForm ? (
              <TouchableOpacity style={styles.addReplyBtn} onPress={() => setShowReplyForm(true)} activeOpacity={0.8}>
                <Ionicons name="chatbubble-outline" size={16} color={colors.gray} />
                <Text style={styles.addReplyText}>Write a reply…</Text>
              </TouchableOpacity>
            ) : (
              <ReplyForm
                name={replyName} text={replyText} telegram={replyTelegram} instagram={replyInstagram}
                onChangeName={setReplyName} onChangeText={setReplyText}
                onChangeTelegram={setReplyTelegram} onChangeInstagram={setReplyInstagram}
                onSubmit={handleSubmitReply} onCancel={() => setShowReplyForm(false)}
                submitting={submittingReply}
              />
            )}
          </View>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------
function SocialBtn({ icon, label, onPress }) {
  return (
    <TouchableOpacity style={sStyles.btn} onPress={onPress} activeOpacity={0.8}>
      <Ionicons name={icon} size={18} color={colors.black} />
      <Text style={sStyles.label}>{label}</Text>
    </TouchableOpacity>
  );
}

function ReplyCard({ reply, onOpenLink }) {
  const hasSocial = reply.social && Object.keys(reply.social).length > 0;
  return (
    <View style={rStyles.card}>
      <View style={rStyles.header}>
        <View style={rStyles.avatar}>
          <Text style={rStyles.avatarText}>{reply.authorName[0].toUpperCase()}</Text>
        </View>
        <View>
          <Text style={rStyles.author}>{reply.authorName}</Text>
          <Text style={rStyles.time}>{formatTimeAgo(reply.createdAt)}</Text>
        </View>
      </View>
      <Text style={rStyles.text}>{reply.text}</Text>
      {hasSocial && (
        <View style={rStyles.connect}>
          {reply.social.telegram && (
            <TouchableOpacity style={rStyles.connectBtn} onPress={() => onOpenLink(reply.social.telegram)}>
              <Ionicons name="paper-plane-outline" size={12} color={colors.black} />
              <Text style={rStyles.connectText}>Telegram</Text>
            </TouchableOpacity>
          )}
          {reply.social.instagram && (
            <TouchableOpacity style={rStyles.connectBtn} onPress={() => onOpenLink(reply.social.instagram)}>
              <Ionicons name="camera-outline" size={12} color={colors.black} />
              <Text style={rStyles.connectText}>Instagram</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
}

function ReplyForm({ name, text, telegram, instagram, onChangeName, onChangeText,
  onChangeTelegram, onChangeInstagram, onSubmit, onCancel, submitting }) {
  const canSubmit = name.trim().length > 0 && text.trim().length > 0;
  return (
    <View style={rfStyles.form}>
      <TextInput style={rfStyles.input} placeholder="Your name" placeholderTextColor={colors.grayMid}
        value={name} onChangeText={onChangeName} maxLength={30} />
      <TextInput style={[rfStyles.input, rfStyles.textArea]} placeholder="Write your reply…"
        placeholderTextColor={colors.grayMid} value={text} onChangeText={onChangeText}
        multiline numberOfLines={3} textAlignVertical="top" maxLength={500} />
      <TextInput style={rfStyles.input} placeholder="Telegram @username (optional)"
        placeholderTextColor={colors.grayMid} value={telegram} onChangeText={onChangeTelegram} autoCapitalize="none" />
      <TextInput style={rfStyles.input} placeholder="Instagram @username (optional)"
        placeholderTextColor={colors.grayMid} value={instagram} onChangeText={onChangeInstagram} autoCapitalize="none" />
      <View style={rfStyles.actions}>
        <TouchableOpacity style={rfStyles.cancelBtn} onPress={onCancel}>
          <Text style={rfStyles.cancelText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[rfStyles.submitBtn, !canSubmit && rfStyles.disabled]}
          onPress={onSubmit} disabled={!canSubmit || submitting}>
          {submitting
            ? <ActivityIndicator size="small" color={colors.white} />
            : <Text style={rfStyles.submitText}>Post reply</Text>}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white },
  notFound: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  notFoundText: { ...typography.body, color: colors.gray },

  nav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.grayBorder,
  },
  navBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },

  scroll: { flex: 1 },
  scrollContent: { paddingBottom: spacing.xxl },

  infoSection: { padding: spacing.md, paddingBottom: 0 },
  title: { ...typography.h1, color: colors.black, marginBottom: spacing.sm },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: spacing.md, flexWrap: 'wrap' },
  metaText: { ...typography.bodySmall, color: colors.gray },
  metaDot: { ...typography.bodySmall, color: colors.grayMid },

  goingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: spacing.md,
  },
  goingBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.black,
  },
  goingBtnActive: { backgroundColor: colors.black },
  goingBtnText: { ...typography.label, color: colors.black, fontSize: 13 },
  goingBtnTextActive: { color: colors.white },

  divider: { height: 1, backgroundColor: colors.grayBorder, marginHorizontal: spacing.md },

  section: { padding: spacing.md },
  sectionTitle: { ...typography.h3, color: colors.black, marginBottom: spacing.sm },
  description: { ...typography.body, color: colors.black, lineHeight: 24 },

  mapContainer: {
    height: 160,
    marginHorizontal: spacing.md,
    borderRadius: radius.lg,
    overflow: 'hidden',
    marginBottom: spacing.md,
    ...shadow.sm,
  },
  map: { flex: 1 },
  mapLabel: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: 'rgba(0,0,0,0.5)', paddingHorizontal: spacing.md, paddingVertical: 6,
  },
  mapLabelText: { ...typography.caption, color: colors.white },

  socialBtns: { flexDirection: 'row', gap: spacing.sm },

  noReplies: { ...typography.body, color: colors.gray, marginBottom: spacing.md },
  addReplyBtn: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    padding: spacing.md, borderWidth: 1, borderColor: colors.grayBorder,
    borderRadius: radius.md, borderStyle: 'dashed',
  },
  addReplyText: { ...typography.body, color: colors.gray },
});

const sStyles = StyleSheet.create({
  btn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, paddingVertical: 10, borderRadius: radius.md, borderWidth: 1.5, borderColor: colors.black,
  },
  label: { ...typography.label, color: colors.black },
});

const rStyles = StyleSheet.create({
  card: { marginBottom: spacing.md, paddingBottom: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.grayBorder },
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.xs },
  avatar: {
    width: 32, height: 32, borderRadius: 16, backgroundColor: colors.black,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { ...typography.label, color: colors.white },
  author: { ...typography.label, color: colors.black },
  time: { ...typography.caption, color: colors.gray },
  text: { ...typography.body, color: colors.black },
  connect: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.xs },
  connectBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: spacing.sm, paddingVertical: 4,
    borderRadius: radius.full, borderWidth: 1, borderColor: colors.grayBorder,
  },
  connectText: { ...typography.caption, color: colors.black, fontWeight: '600' },
});

const rfStyles = StyleSheet.create({
  form: { gap: spacing.sm },
  input: {
    borderWidth: 1, borderColor: colors.grayBorder, borderRadius: radius.md,
    paddingHorizontal: spacing.md, paddingVertical: 10,
    ...typography.body, color: colors.black,
  },
  textArea: { minHeight: 80, textAlignVertical: 'top', paddingTop: 10 },
  actions: { flexDirection: 'row', gap: spacing.sm },
  cancelBtn: {
    flex: 1, paddingVertical: 12, borderRadius: radius.md, alignItems: 'center',
    borderWidth: 1, borderColor: colors.grayBorder,
  },
  cancelText: { ...typography.button, color: colors.gray },
  submitBtn: {
    flex: 2, paddingVertical: 12, borderRadius: radius.md, alignItems: 'center',
    backgroundColor: colors.black,
  },
  disabled: { opacity: 0.35 },
  submitText: { ...typography.button, color: colors.white },
});
