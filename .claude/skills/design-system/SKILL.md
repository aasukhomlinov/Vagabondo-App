---
name: design-system
description: Maintain and extend the Joint design system. Use when adding new components, updating theme tokens, or ensuring visual consistency across the app.
---

# Joint Design System

Maintain consistency with the established Joint design system defined in `src/theme/index.js`.

## Design Tokens

Always use tokens from the theme — never hardcode values:
- **Colors**: `theme.colors.*` (primary black/white, grays, accent red)
- **Typography**: `theme.typography.*` with LINE Seed JP font family
- **Spacing**: `theme.spacing.*` (xs:4, sm:8, md:16, lg:24, xl:32, xxl:48)
- **Radius**: `theme.radius.*` (sm:6, md:10, lg:16, xl:20, full:9999)

## Component Patterns

- All new components must import and use the theme object
- Use `StyleSheet.create()` for all styles
- Follow existing naming conventions (PascalCase components, camelCase styles)
- Event poster colors use the curated `posterBackgrounds` palette
- Consistent padding: screen-level `md` (16px), card-level `sm` (8px)

## Typography Scale

| Token | Size | Weight | Use |
|-------|------|--------|-----|
| appName | 22 | ExtraBold | App title in header |
| h1 | 26 | Bold | Screen titles |
| h2 | 20 | Bold | Section headers |
| h3 | 17 | Bold | Card titles |
| body | 15 | Regular | Body text |
| caption | 13 | Regular | Secondary text |
| chip | 13 | Bold | Filter chips |

## When Extending

- Add new tokens to `src/theme/index.js`
- Document new colors with semantic names
- Test typography changes across all screens
- Maintain the monochrome + accent red palette identity
