# Joint — Social Events Mobile App

## Project Overview
Joint is a mobile app where people post spontaneous events and find others to join. Map-based discovery, no profiles, no DMs — just events and social handles to connect.

## Tech Stack
- **Framework**: React Native 0.76 + Expo SDK 52
- **Navigation**: React Navigation 6 (bottom tabs + native stack)
- **State**: React Context + useReducer (`src/store/EventContext.js`)
- **Storage**: AsyncStorage (keys: `@joint:events_v2`, `@joint:liked_v2`, `@joint:going_v2`)
- **Maps**: react-native-maps
- **Location**: expo-location
- **Font**: LINE Seed JP (Thin, Regular, Bold, ExtraBold)

## Project Structure
```
src/
├── theme/index.js          Design system tokens
├── store/EventContext.js    State management + seed data
├── navigation/AppNavigator.js  Tab + stack navigation
├── screens/                4 main screens
├── components/             Reusable UI components
└── utils/helpers.js        Utility functions
```

## Conventions
- Use theme tokens from `src/theme/index.js` — never hardcode colors, spacing, or font sizes
- Components: PascalCase files, `StyleSheet.create()` for styles
- Storage keys prefixed with `@joint:`
- Portrait-only orientation
- Bundle IDs: `com.joint.app` (iOS & Android)
- Default location: Rome, Italy (41.9028, 12.4964)

## Available Skills
- `/frontend-design` — Distinctive, production-grade UI design (avoids generic AI aesthetics)
- `/ralph` — Autonomous iterative loop for multi-step tasks
- `/mobile-ux` — Mobile UX patterns and best practices
- `/design-system` — Joint design system maintenance and consistency
- `/excalidraw-diagram` — Generate Excalidraw wireframes, flowcharts, architecture diagrams
- `/simplify` — Review changed code for quality, reuse, and efficiency; auto-fix issues

## MCP Servers
- **Context7** — Live, version-accurate docs for Expo, React Native, and any library (eliminates hallucinations). Append "use context7" to prompts for explicit lookup
- **Figma** — Read Figma designs, export frames, push code-built UIs back to Figma as editable layers

## Commands
```bash
npm start          # Expo dev server
npm run ios        # iOS simulator
npm run android    # Android emulator (needs Google Maps API key)
npm run web        # Web browser
```

## Important Notes
- No backend — all data is local via AsyncStorage
- Android requires Google Maps API key in `app.json`
- iOS uses Apple Maps by default
- 11 event categories: museum, café, park, concert, theater, food, art, festival, sports, cinema, other
