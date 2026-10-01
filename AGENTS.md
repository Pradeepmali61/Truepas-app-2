# Truepas app — working notes

## UI design source of truth — Midnight Luxe (premium copy)

This folder is the **premium UI redesign** of truepas-app-1 (branch `premium-ui`). The old
neumorphic design repo is **no longer** the source of truth here — screens follow the
Midnight Luxe system instead:

- Theme: `ThemeProvider scheme="dark" palette="midnightLuxe" typeface="luxe"` (`src/app/_layout.tsx`).
  Palette + exact dark tokens live in `src/theme/palette.ts` (`midnightLuxe.darkOverrides`).
  `alpha()`/`mix()` accept both hex and `rgba()`.
- Type: Plus Jakarta (display, tight tracking) over Inter (body); JetBrains Mono for IDs/amounts.
- `NeuBox` is now a layered surface (graphite fill, hairline rim, top sheen, deep shadow) — same API.
- Premium building blocks: `src/components/luxe/` — `Aura` (ambient top glow), `HeroGlyph`
  (result/intro orb), `PassCard` (Truepas Pass), `CheckinHero`, `BookingTile`, `DocPass`
  (wallet document), `ListGroup`/`ListRow`/`RowGlyph`, `LargeTitle`, `SectionHeader`,
  `StatusPill`, `QuickAction`, `PressableScale`, `venueImage()` (booking keyword → bundled photo).
- Screen recipe: root `View` on `colors.background` → `<Aura/>` → `SafeAreaView` → content with
  `t.sizes.screenGutter` (20) side padding. Tab roots use `LargeTitle`; pushed screens `ScreenHeader`.
- Web paint order: an absolutely-positioned layer (LinearGradient/Svg) paints over later
  non-positioned siblings such as a bare lucide `<svg>` — wrap icons in a `View` after overlays.
- Metro on Windows here doesn't pick up file edits reliably — restart with `--clear` before screenshots.
- `src/components/ui/ScanFrame.tsx` — corner-bracket viewfinder ported from the design repo. In `LivenessCamera` the challenge stage mounts the live `Camera` INSIDE the ScanFrame square (`resizeMode="cover"`); during `finalizing`/`passed` the same `cameraView` element mounts off-screen at `-2000` (required for `capturePhotoToFile` + the Fabric unmount-crash workaround).
- Liveness stage UIs are pure presentational components in `src/features/liveness/LivenessStages.tsx` (camera arrives as a ReactNode). Preview them without a native camera via `src/app/dev-liveness.tsx` → dev menu entries "Liveness — challenge/verifying/verified/failed (preview)".

## Dev screen browser

`src/app/dev.tsx` (dev-only, opened via the floating button) lists every screen.

- Auth presets forge a session; while browsing, API calls resolve against `mockApi` via `setDevMockApi` (`src/api/index.ts`) — "Resume Normal Flow" resets it.
- Screens with deep-link guards need a `prepare` step on their entry: one-shot `flowGuards` flags (`src/services/flowGuards.ts`), `setRegistrationToken`, `scanStore`, or required route params — otherwise the jump bounces to the flow's start.
- Mock OTP: any 6-digit code passes `verifyOtp`.

## NativeWind pitfall — function `style` props die on native

`babel.config.js` sets `jsxImportSource: 'nativewind'`, so `Pressable`/`View`/`Text` etc. are wrapped by `react-native-css-interop`. On **native only**, a **function-valued** `style` prop (`style={({ pressed }) => …}`) is replaced with `{}` — `flexDirection`, `padding`, everything in it silently drops (rows collapse to columns). Web is unaffected, so it looks fine in the browser.

Any file that uses a function `style` (or `children` press-state fn) MUST have `/** @jsxImportSource react */` as line 1. ~20 files already do (`NotificationCenter.tsx`, `Accordion.tsx`, `Switch.tsx`, all of `src/components/truepas/`…). When porting a screen from the design repo, add the pragma if the file has `style={(`.

## Verify

- `npx tsc --noEmit`
- `npx eslint <file>`

## Git workflow

- This copy works on branch `premium-ui`. Its own GitHub repo is not wired up yet (no `origin`) — never push this branch to the original truepas-app repo's `main`.
