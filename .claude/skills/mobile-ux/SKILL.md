---
name: mobile-ux
description: Mobile UX patterns and best practices for React Native / Expo apps. Auto-triggers when designing screens, navigation, gestures, or touch interactions for mobile.
---

# Mobile UX Design Patterns

Apply mobile-first UX principles when designing screens and interactions.

## Core Principles

- **Touch targets**: Minimum 44x44pt for all interactive elements
- **Thumb zone**: Place primary actions in the bottom third of the screen (easy thumb reach)
- **One-hand use**: Design for single-handed operation on modern tall screens
- **Content first**: Minimize chrome, maximize content area
- **Progressive disclosure**: Show essential info first, details on demand

## Navigation Patterns

- Bottom tabs for top-level navigation (max 5 tabs)
- Stack navigation for drill-down flows
- Modal sheets for quick actions and creation flows
- Swipe gestures for back navigation (iOS) and dismissal
- Pull-to-refresh for list content

## Performance UX

- Skeleton screens over loading spinners
- Optimistic UI updates for user actions
- Lazy loading for off-screen content
- Smooth 60fps animations using native driver
- Haptic feedback for meaningful interactions

## React Native Specifics

- Use `react-native-reanimated` for complex animations
- Use `react-native-gesture-handler` for custom gestures
- Prefer `FlatList`/`SectionList` over `ScrollView` for long lists
- Use `SafeAreaView` consistently across all screens
- Test on both iOS and Android — platform differences matter

## Accessibility

- Support Dynamic Type / font scaling
- VoiceOver / TalkBack labels on all interactive elements
- Sufficient color contrast (4.5:1 minimum)
- Respect reduced motion preferences
