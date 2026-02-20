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
import MapView, { Marker } from 'react-native-maps';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';

import { useEvents } from '../store/EventContext';
import { colors, categories, spacing, radius, typography, shadow } from '../theme';
import { formatTimeAgo } from '../utils/helpers';

export default function EventDetailScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { eventId } = route.params;

  const { getEvent, toggleGoing, isGoing, addReply } = useEvents();
  const event = getEvent(eventId);
  const going = isGoing(eventId);

  const [replyText, setReplyText] = useState('');
  const [replyName, setReplyName] = useState('');
  const [replyTelegram, setReplyTelegram] = useState('');
  const [replyInstagram, setReplyInstagram] = useState('');
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [submittingReply, setSubmittingReply] = useState(false);
  const scrollRef = useRef(null);

  if (!event) {
    return (
      <View style={styles.notFound}>
        <Text style={styles.notFoundText}>Event not found</Text>
      </View>
    );
  }

  const cat = categories[event.category] || categories.other;

  const openLink = async (url) => {
    try {
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Cannot open link', url);
      }
    } catch {
      Alert.alert('Error', 'Could not open this link.');
    }
  };

  const handleSubmitReply = async () => {
    if (!replyText.trim() || !replyName.trim()) return;
    setSubmittingReply(true);

    const social = {};
    if (replyTelegram.trim()) {
      social.telegram = replyTelegram.startsWith('http')
        ? replyTelegram.trim()
        : `https://t.me/${replyTelegram.trim().replace('@', '')}`;
    }
    if (replyInstagram.trim()) {
      social.instagram = replyInstagram.startsWith('http')
        ? replyInstagram.trim()
        : `https://instagram.com/${replyInstagram.trim().replace('@', '')}`;
    }

    addReply(eventId, {
      text: replyText.trim(),
      authorName: replyName.trim(),
      social,
    });

    setReplyText('');
    setReplyName('');
    setReplyTelegram('');
    setReplyInstagram('');
    setShowReplyForm(false);
    setSubmittingReply(false);
  };

  const hasSocial = event.social && Object.keys(event.social).length > 0;

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={[styles.container, { paddingTop: insets.top }]}>
        {/* Header nav */}
        <View style={styles.nav}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          ref={scrollRef}
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Category badge */}
          <View style={[styles.catBadge, { backgroundColor: cat.bg }]}>
            <Text style={styles.catEmoji}>{cat.emoji}</Text>
            <Text style={[styles.catLabel, { color: cat.color }]}>{cat.label}</Text>
          </View>

          {/* Title */}
          <Text style={styles.title}>{event.title}</Text>

          {/* Meta */}
          <View style={styles.metaRow}>
            <Text style={styles.metaAuthor}>by {event.authorName}</Text>
            <Text style={styles.metaSep}>·</Text>
            <Text style={styles.metaTime}>{formatTimeAgo(event.createdAt)}</Text>
          </View>

          {/* Description */}
          {event.description ? (
            <Text style={styles.description}>{event.description}</Text>
          ) : null}

          {/* Map */}
          <View style={styles.mapContainer}>
            <MapView
              style={styles.map}
              initialRegion={{
                latitude: event.location.latitude,
                longitude: event.location.longitude,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              }}
              scrollEnabled={false}
              zoomEnabled={false}
              pitchEnabled={false}
              rotateEnabled={false}
            >
              <Marker coordinate={event.location}>
                <View style={[styles.mapPin, { backgroundColor: cat.color }]}>
                  <Text style={styles.mapPinEmoji}>{cat.emoji}</Text>
                </View>
              </Marker>
            </MapView>
            {event.locationName ? (
              <View style={styles.locationLabel}>
                <Text style={styles.locationLabelText} numberOfLines={1}>
                  📍 {event.locationName}
                </Text>
              </View>
            ) : null}
          </View>

          {/* Going button */}
          <TouchableOpacity
            style={[styles.goingBtn, going && styles.goingBtnActive]}
            onPress={() => toggleGoing(eventId)}
            activeOpacity={0.85}
          >
            <Text style={styles.goingBtnEmoji}>{going ? '✅' : '🙋'}</Text>
            <Text style={[styles.goingBtnText, going && styles.goingBtnTextActive]}>
              {going ? "You're going!" : "I'm going!"}
            </Text>
            <View style={[styles.goingCount, going && styles.goingCountActive]}>
              <Text style={[styles.goingCountText, going && styles.goingCountTextActive]}>
                {event.goingCount}
              </Text>
            </View>
          </TouchableOpacity>

          {/* Connect via social */}
          {hasSocial && (
            <View style={styles.socialSection}>
              <Text style={styles.socialTitle}>Connect with {event.authorName}</Text>
              <View style={styles.socialBtns}>
                {event.social.telegram && (
                  <SocialBtn
                    emoji="✈️"
                    label="Telegram"
                    color="#2AABEE"
                    onPress={() => openLink(event.social.telegram)}
                  />
                )}
                {event.social.instagram && (
                  <SocialBtn
                    emoji="📸"
                    label="Instagram"
                    color="#E1306C"
                    onPress={() => openLink(event.social.instagram)}
                  />
                )}
                {event.social.whatsapp && (
                  <SocialBtn
                    emoji="💬"
                    label="WhatsApp"
                    color="#25D366"
                    onPress={() => openLink(event.social.whatsapp)}
                  />
                )}
              </View>
            </View>
          )}

          {/* Divider */}
          <View style={styles.divider} />

          {/* Replies */}
          <View style={styles.repliesSection}>
            <Text style={styles.repliesTitle}>
              Replies{' '}
              <Text style={styles.repliesCount}>{event.replies.length}</Text>
            </Text>

            {event.replies.length === 0 && (
              <Text style={styles.noReplies}>No replies yet. Be the first!</Text>
            )}

            {event.replies.map((reply) => (
              <ReplyCard key={reply.id} reply={reply} onOpenLink={openLink} />
            ))}

            {/* Add reply */}
            {!showReplyForm ? (
              <TouchableOpacity
                style={styles.addReplyBtn}
                onPress={() => setShowReplyForm(true)}
                activeOpacity={0.8}
              >
                <Text style={styles.addReplyEmoji}>💬</Text>
                <Text style={styles.addReplyText}>Write a reply…</Text>
              </TouchableOpacity>
            ) : (
              <ReplyForm
                name={replyName}
                text={replyText}
                telegram={replyTelegram}
                instagram={replyInstagram}
                onChangeName={setReplyName}
                onChangeText={setReplyText}
                onChangeTelegram={setReplyTelegram}
                onChangeInstagram={setReplyInstagram}
                onSubmit={handleSubmitReply}
                onCancel={() => setShowReplyForm(false)}
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
function SocialBtn({ emoji, label, color, onPress }) {
  return (
    <TouchableOpacity
      style={[styles.socialBtnWrap, { borderColor: color }]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Text style={styles.socialBtnEmoji}>{emoji}</Text>
      <Text style={[styles.socialBtnLabel, { color }]}>{label}</Text>
    </TouchableOpacity>
  );
}

function ReplyCard({ reply, onOpenLink }) {
  const hasSocial = reply.social && Object.keys(reply.social).length > 0;
  return (
    <View style={styles.replyCard}>
      <View style={styles.replyHeader}>
        <View style={styles.replyAvatar}>
          <Text style={styles.replyAvatarText}>{reply.authorName[0].toUpperCase()}</Text>
        </View>
        <View style={styles.replyMeta}>
          <Text style={styles.replyAuthor}>{reply.authorName}</Text>
          <Text style={styles.replyTime}>{formatTimeAgo(reply.createdAt)}</Text>
        </View>
      </View>
      <Text style={styles.replyText}>{reply.text}</Text>
      {hasSocial && (
        <View style={styles.replyConnect}>
          {reply.social.telegram && (
            <TouchableOpacity
              style={styles.replyConnectBtn}
              onPress={() => onOpenLink(reply.social.telegram)}
            >
              <Text style={styles.replyConnectText}>✈️ Telegram</Text>
            </TouchableOpacity>
          )}
          {reply.social.instagram && (
            <TouchableOpacity
              style={styles.replyConnectBtn}
              onPress={() => onOpenLink(reply.social.instagram)}
            >
              <Text style={styles.replyConnectText}>📸 Instagram</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
}

function ReplyForm({
  name, text, telegram, instagram,
  onChangeName, onChangeText, onChangeTelegram, onChangeInstagram,
  onSubmit, onCancel, submitting,
}) {
  const canSubmit = name.trim().length > 0 && text.trim().length > 0;
  return (
    <View style={styles.replyForm}>
      <Text style={styles.replyFormTitle}>Your reply</Text>
      <TextInput
        style={styles.replyInput}
        placeholder="Your name"
        placeholderTextColor={colors.textLight}
        value={name}
        onChangeText={onChangeName}
        maxLength={30}
      />
      <TextInput
        style={[styles.replyInput, styles.replyTextArea]}
        placeholder="Write your reply…"
        placeholderTextColor={colors.textLight}
        value={text}
        onChangeText={onChangeText}
        multiline
        numberOfLines={3}
        textAlignVertical="top"
        maxLength={500}
      />
      <Text style={styles.replyFormHint}>Add social links so people can reach you</Text>
      <TextInput
        style={styles.replyInput}
        placeholder="Telegram @username (optional)"
        placeholderTextColor={colors.textLight}
        value={telegram}
        onChangeText={onChangeTelegram}
        autoCapitalize="none"
      />
      <TextInput
        style={styles.replyInput}
        placeholder="Instagram @username (optional)"
        placeholderTextColor={colors.textLight}
        value={instagram}
        onChangeText={onChangeInstagram}
        autoCapitalize="none"
      />
      <View style={styles.replyFormActions}>
        <TouchableOpacity style={styles.cancelBtn} onPress={onCancel}>
          <Text style={styles.cancelBtnText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.submitBtn, !canSubmit && styles.submitBtnDisabled]}
          onPress={onSubmit}
          disabled={!canSubmit || submitting}
        >
          {submitting ? (
            <ActivityIndicator size="small" color="#FFF" />
          ) : (
            <Text style={styles.submitBtnText}>Post reply</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },

  notFound: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  notFoundText: { ...typography.body, color: colors.textSecondary },

  nav: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backBtn: {},
  backText: { ...typography.body, color: colors.primary, fontWeight: '600' },

  scroll: { flex: 1 },
  scrollContent: { padding: spacing.md, paddingBottom: spacing.xxl },

  catBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.full,
    marginBottom: spacing.sm,
  },
  catEmoji: { fontSize: 16 },
  catLabel: { ...typography.label },

  title: { ...typography.h1, color: colors.text, marginBottom: spacing.xs },

  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: spacing.md },
  metaAuthor: { ...typography.bodySmall, color: colors.text, fontWeight: '600' },
  metaSep: { color: colors.textLight },
  metaTime: { ...typography.bodySmall, color: colors.textSecondary },

  description: {
    ...typography.body,
    color: colors.text,
    lineHeight: 24,
    marginBottom: spacing.lg,
  },

  // Map
  mapContainer: {
    borderRadius: radius.lg,
    overflow: 'hidden',
    height: 180,
    marginBottom: spacing.md,
    ...shadow.sm,
  },
  map: { flex: 1 },
  mapPin: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFF',
  },
  mapPinEmoji: { fontSize: 16 },
  locationLabel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
  },
  locationLabelText: { ...typography.caption, color: '#FFF' },

  // Going button
  goingBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: radius.lg,
    paddingVertical: 14,
    marginBottom: spacing.lg,
  },
  goingBtnActive: {
    backgroundColor: colors.goingBg,
    borderColor: colors.going,
  },
  goingBtnEmoji: { fontSize: 22 },
  goingBtnText: {
    ...typography.button,
    color: colors.textSecondary,
    fontSize: 16,
  },
  goingBtnTextActive: { color: colors.going },
  goingCount: {
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: radius.full,
    backgroundColor: colors.border,
    minWidth: 28,
    alignItems: 'center',
  },
  goingCountActive: { backgroundColor: colors.going },
  goingCountText: { ...typography.label, color: colors.textSecondary },
  goingCountTextActive: { color: '#FFF' },

  // Social section
  socialSection: { marginBottom: spacing.lg },
  socialTitle: { ...typography.h3, color: colors.text, marginBottom: spacing.sm },
  socialBtns: { flexDirection: 'row', gap: spacing.sm },
  socialBtnWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: radius.md,
    borderWidth: 2,
    backgroundColor: colors.card,
  },
  socialBtnEmoji: { fontSize: 18 },
  socialBtnLabel: { ...typography.label },

  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.lg,
  },

  // Replies
  repliesSection: {},
  repliesTitle: { ...typography.h3, color: colors.text, marginBottom: spacing.md },
  repliesCount: { color: colors.primary },
  noReplies: { ...typography.body, color: colors.textSecondary, marginBottom: spacing.md },

  addReplyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
  },
  addReplyEmoji: { fontSize: 18 },
  addReplyText: { ...typography.body, color: colors.textSecondary },

  // Reply card
  replyCard: {
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    ...shadow.sm,
  },
  replyHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.sm },
  replyAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  replyAvatarText: { ...typography.label, color: '#FFF', fontSize: 15 },
  replyMeta: {},
  replyAuthor: { ...typography.label, color: colors.text },
  replyTime: { ...typography.caption, color: colors.textSecondary },
  replyText: { ...typography.body, color: colors.text, lineHeight: 22 },
  replyConnect: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm },
  replyConnectBtn: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.full,
    backgroundColor: colors.surface,
  },
  replyConnectText: { ...typography.caption, color: colors.text, fontWeight: '600' },

  // Reply form
  replyForm: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.md,
    ...shadow.sm,
    gap: spacing.xs,
  },
  replyFormTitle: { ...typography.h3, color: colors.text, marginBottom: spacing.xs },
  replyInput: {
    backgroundColor: colors.background,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    ...typography.body,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
    marginVertical: 3,
  },
  replyTextArea: { minHeight: 80, textAlignVertical: 'top', paddingTop: 10 },
  replyFormHint: { ...typography.caption, color: colors.textSecondary, marginTop: 4 },
  replyFormActions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm },
  cancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: radius.md,
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cancelBtnText: { ...typography.button, color: colors.textSecondary },
  submitBtn: {
    flex: 2,
    paddingVertical: 12,
    borderRadius: radius.md,
    alignItems: 'center',
    backgroundColor: colors.primary,
    ...shadow.sm,
  },
  submitBtnDisabled: { opacity: 0.4 },
  submitBtnText: { ...typography.button, color: '#FFF' },
});
