# Joint 🌍

> *Connect with strangers, explore together.*

Joint is a social mobile app where people post spontaneous events and find others to join them. No profiles, no DMs — just events, a map, and social handles to connect.

---

## Features

- **Map view** — browse event pins on an interactive map; tap any pin for a quick preview
- **Events list** — scroll nearby events, filter by category, sort by newest or most popular
- **Create event** — 3-step wizard: pick a category, write a title/description, set your location and social links
- **I'm going** — one-tap interest indicator with a live count; persisted locally
- **Replies** — anyone can reply to an event with their message and social handles
- **Social connect** — direct links to the organiser's Telegram, Instagram, or WhatsApp

## Tech stack

| Layer | Choice |
|---|---|
| Framework | React Native via [Expo](https://expo.dev) SDK 52 |
| Navigation | React Navigation 6 (bottom tabs + native stack) |
| Map | react-native-maps |
| Location | expo-location |
| Storage | AsyncStorage (local, no backend required) |
| State | React Context + useReducer |

## Getting started

```bash
# Install dependencies
npm install

# Start Expo dev server
npm start

# Run on iOS simulator
npm run ios

# Run on Android emulator
npm run android
```

### Android map setup

On Android, `react-native-maps` uses Google Maps and requires an API key.

1. Get a key from [Google Cloud Console](https://console.cloud.google.com/) with **Maps SDK for Android** enabled.
2. Replace `YOUR_GOOGLE_MAPS_API_KEY` in `app.json` under `expo.android.config.googleMaps.apiKey`.

iOS uses Apple Maps by default — no key needed.

## Project structure

```
src/
├── theme/         Design tokens (colors, typography, spacing, shadows)
├── store/         EventContext — state management + AsyncStorage persistence
├── navigation/    AppNavigator — bottom tabs + stack
├── screens/
│   ├── MapScreen.js          Full-screen map with event pins
│   ├── EventsListScreen.js   Filterable/searchable event feed
│   ├── CreateEventScreen.js  3-step event creation wizard
│   └── EventDetailScreen.js  Event detail, going count, replies, social links
└── utils/         helpers.js — ID generation, time formatting, distance calc
```

## Extending the app

| Feature | Where to start |
|---|---|
| Real backend | Replace AsyncStorage calls in `EventContext.js` with API calls |
| Push notifications | Add `expo-notifications` and trigger on new replies |
| Deep linking | Configure `expo-linking` in `app.json` |
| User avatars | Add image upload with `expo-image-picker` |
| Event expiry | Add a `date` field to events and filter expired ones |
