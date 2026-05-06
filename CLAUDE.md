# bennett. — CLAUDE.md

> This file is read automatically by Claude Code at the start of every session.
> For the full atomic-level build spec, see: `docs/BENNETT_BUILD_PROMPT.md`

---

## What Is bennett.

bennett. is a **Cognitive Operating System (COS)** — not a wellness app. It acts as an external prefrontal cortex for "Paralyzed High-Achievers" (ages 16–30 with ADHD, executive dysfunction, or major depression).

**Core philosophy:** Stoic Agency. "Knowledge first, commas second." Action over motivation.
**Positioning:** High-tech, low-pressure. Elite and professional, yet deeply empathetic and authentic.
**Voice:** Always lowercase iMessage lingo. Never formal. Never sycophantic.

---

## Brand Name Convention

The wordmark is **`bennett.`** — lowercase, with a trailing period. The period is part of the mark.

| Where | Treatment |
|---|---|
| App display name (CFBundleDisplayName, `<title>`, app icon label, hero/wordmark text in UIs, push notification title, certificate of mastery, sign-up wordmark) | `bennett.` (with period) |
| Body copy in persona-voice sentences ("bennett can protect ur time", "the founder personally reviewed ur application") | `bennett` (no period — honors the iMessage rule "no ending periods on casual lines") |
| Persona prompt rules ("no proper-noun caps except 'bennett'") | `bennett` (no period — same as above) |
| Internal identifiers (bundle ids `com.bennett.cos`, file paths `apple/Bennett/`, Swift class names `BennettApp`) | unchanged — code/infrastructure, not display |

The period is a *display* element, not a *body-copy* element. Treat it like Yahoo!'s `!` — visible in the wordmark, dropped in flowing prose.

---

## Platforms

| Platform | Language / Framework | Status |
|---|---|---|
| iOS (primary) | Swift 5.9+ / SwiftUI | Active |
| macOS (native) | Swift 5.9+ / SwiftUI + AppKit | Active |
| Web / Browser | React 18+ / TypeScript / Tailwind CSS | Active |
| Backend | Node.js / TypeScript / Firebase / Edge Functions | Active |

iOS and macOS share a SwiftUI codebase via a **multi-platform Xcode target** — platform-specific views live in `#if os(iOS)` / `#if os(macOS)` conditionals. Web is a separate React app. All three are feature-parity unless noted otherwise in the spec.

---

## Tech Stack

### iOS
- **UI:** SwiftUI
- **Auth:** Firebase Auth (Apple, Google, Facebook, LinkedIn OAuth, Phone SMS, Email)
- **Database:** Firestore
- **Payments:** Stripe iOS SDK
- **AI:** Anthropic Claude API — server-side only, never client-exposed
- **Health:** HealthKit + WatchKit
- **Vision:** AVFoundation + Vision framework (Smile Sync)
- **Speech:** SFSpeechRecognizer (Vocalization step)
- **Calendar:** EventKit + Google Calendar API (OAuth)
- **Screen Time:** FamilyControls / ManagedSettings
- **Crypto:** Apple CryptoKit / Secure Enclave
- **Video:** Higgsfield AI API (nightly priming videos)
- **Animation:** SwiftUI Canvas, Metal shaders (Liquid Glass theme)
- **Biometric:** Face ID via LocalAuthentication

### macOS
- **UI:** SwiftUI + AppKit (for native Mac behaviors)
- **Auth:** Firebase Auth (Apple, Google, Facebook, LinkedIn OAuth, Email — no Phone SMS on Mac)
- **Database:** Firestore
- **Payments:** Stripe macOS SDK
- **AI:** Anthropic Claude API — server-side only
- **Vision:** AVFoundation + Vision framework (Smile Sync via webcam — webcam required)
- **Speech:** SFSpeechRecognizer (Vocalization step via microphone)
- **Calendar:** EventKit + Google Calendar API (OAuth)
- **Crypto:** Apple CryptoKit / Secure Enclave
- **Video:** Higgsfield AI API (nightly priming videos)
- **Animation:** SwiftUI Canvas, Metal shaders (Liquid Glass theme)
- **Biometric:** Touch ID via LocalAuthentication (no Face ID on Mac)
- **Menu Bar:** NSStatusItem — streak widget in macOS menu bar
- **Window:** NSWindowController, multi-window support
- **Note:** HealthKit and FamilyControls/ManagedSettings are NOT available on macOS. Bio-Shock and Sacrifice redemption trials are iOS-only. Manual confirmation fallback provided on Mac.

### Web
- **Framework:** React 18 + TypeScript
- **Styling:** Tailwind CSS + Framer Motion
- **State:** Zustand
- **Auth:** Firebase Auth (same providers as iOS, minus Phone SMS)
- **Payments:** Stripe.js
- **AI:** Anthropic Claude API — server-side only
- **Calendar:** Google Calendar API (OAuth)
- **Build tool:** Vite
- **Physics:** Matter.js (Marble Jar)
- **Face detection:** face-api.js (Smile Sync)
- **Speech:** Web Speech API (Vocalization step)

### Backend
- **Runtime:** Node.js / TypeScript
- **Functions:** Firebase Cloud Functions or Vercel Edge Functions
- **Database:** Firestore (primary) — schema shared across all platforms
- **Realtime:** WebSocket (Arena leaderboard live updates)
- **Payments:** Stripe webhooks
- **Cron:** Firebase Scheduled Functions (Friday 6pm Bulletin generation)
- **AI calls:** All Claude API calls are server-side only — never expose API keys to client

---

## Directory Structure

```
bennett/
├── CLAUDE.md                          ← you are here
├── docs/
│   └── BENNETT_BUILD_PROMPT.md        ← full atomic-level spec — read this first
├── apple/                             ← shared Swift codebase (iOS + macOS multi-platform target)
│   └── Bennett/
│       ├── App/                       ← entry point, multi-platform App struct
│       ├── Features/
│       │   ├── Auth/                  ← sign-up, sign-in, username creation
│       │   ├── Onboarding/            ← 10-step first-launch walkthrough
│       │   ├── DoubleLock/            ← Smile Sync, Stroop, Vocalization
│       │   ├── MarbleJar/             ← physics jar, real + ghost marbles
│       │   ├── DoerTab/               ← Market Insights, modules, Knowledge Bar
│       │   ├── Arena/                 ← Global + Specialized leaderboards
│       │   ├── Bulletin/              ← weekly recap (9-slide deck)
│       │   └── Revenue/               ← Scholarship Mode, Stripe, Redemption Quest
│       ├── Platform/
│       │   ├── iOS/                   ← iOS-only views and adaptations
│       │   └── macOS/                 ← macOS-only views (sidebar, toolbar, menu bar widget)
│       ├── Services/
│       │   ├── ClaudeService.swift
│       │   ├── BennettPersonaService.swift
│       │   ├── BulletinService.swift
│       │   ├── CalendarService.swift
│       │   ├── HealthKitService.swift ← iOS only (#if os(iOS))
│       │   ├── StripeService.swift
│       │   └── CryptoService.swift
│       ├── UITheme/
│       │   ├── ThemeEngine.swift
│       │   ├── GlassmorphismTheme.swift
│       │   ├── NeoBrutalismTheme.swift
│       │   ├── ClaymorphismTheme.swift
│       │   └── LiquidGlassTheme.swift
│       └── Models/
├── web/
│   └── src/
│       ├── features/
│       ├── components/
│       ├── themes/
│       ├── services/
│       └── store/
├── backend/
│   ├── api/
│   │   ├── claude.ts
│   │   ├── persona/
│   │   ├── bulletin/
│   │   ├── stripe-webhooks.ts
│   │   ├── calendar-shield.ts
│   │   ├── username-check.ts
│   │   └── higgsfield.ts
│   ├── db/
│   │   └── schema.sql
│   └── cron/
│       └── bulletin-friday.ts
└── shared/
    └── types/
        ├── BulletinData.ts
        ├── PersonaContext.ts
        └── UserRecord.ts
```

---

## Key Services — Know These Before Writing Code

### BennettPersonaService
Routes every user-facing AI message. Reads `appState` (friend/commander), `energyPulse` (1–10), and `triggerEvent`, then constructs a server-side system prompt and calls Claude. **Never generate AI text outside this service.**

```typescript
// triggerEvent values
'app_open' | 'double_lock_complete' | 'streak_milestone' | 'streak_slip' |
'shield_ignored_3x' | 'doer_tab_enter' | 'module_complete' | 'energy_check' |
'beta_feedback_prompt' | 'redemption_quest_trigger' | 'refund_earned' |
'doer_tab_locked' | 'doer_tab_unlocked' | 'onboarding'
```

### BulletinService
Runs every Friday at 6:00pm (user local time) via cron. Aggregates `BulletinData` for the Mon–Fri window, computes `weeklyScore` and `weeklyScoreGrade`, calls Claude for `aiVerdict` + `aiWeekTitle`, stores to Firestore, triggers push notification at 8:00pm.

### ThemeEngine
4 themes: `glassmorphism` (default) | `neo-brutalism` | `claymorphism` | `liquid-glass`. Theme is selected during onboarding Step 3 and stored as `uiTheme` on the user record. **The Bulletin overrides the active theme with its own visual system.**

---

## Auth Providers

| Provider | iOS | macOS | Web |
|---|---|---|---|
| Apple | `AuthenticationServices` (REQUIRED first) | `AuthenticationServices` (REQUIRED first) | `apple-signin-auth` (server-side) |
| Google | `GoogleSignIn-iOS` pod | `GoogleSignIn` SDK | `@react-oauth/google` |
| Facebook | `FBSDKLoginKit` pod | `FBSDKLoginKit` | `facebook-login-js-sdk` |
| LinkedIn | OAuth via `SFSafariViewController` | OAuth via `ASWebAuthenticationSession` | OAuth 2.0 PKCE redirect |
| Phone SMS | Firebase Phone Auth | **Not available on macOS** | Firebase Phone Auth + reCAPTCHA |
| Email | Firebase Auth email/password | Firebase Auth email/password | Firebase Auth email/password |

---

## Critical Rules — Never Violate These

1. **Apple Sign In is always first on iOS and macOS.** App Store and Mac App Store both require it if any other social login is present.
2. **No API keys on the client.** Anthropic, Stripe, and Google OAuth secrets live in server-side env only.
3. **All AI text routes through BennettPersonaService.** No hardcoded persona strings anywhere.
4. **Always lowercase in AI messages.** No capitals at sentence starts. No formal punctuation. No emojis except those explicitly listed in the persona spec.
5. **The Confirmshaming modal has no dismiss button.** User must type the full phrase or stay.
6. **Ghost marbles are permanent.** No delete, hide, or archive — ever.
7. **Double-Lock is unbypassable.** No dev shortcut in shipped builds. On macOS, webcam + microphone are required — prompt for permissions on first launch.
8. **Doer Tab needs BOTH conditions:** active paid subscription AND 3-day streak minimum.
9. **Stripe 30-day refund triggers via webhook/backend.** Never a manual admin action.
10. **`isNewUser` is server-side.** Onboarding walkthrough is shown exactly once, checked against Firestore — not localStorage or UserDefaults.
11. **Username lock (30 days) is enforced server-side.** Never trust the client for this.
12. **Bulletin never auto-plays.** Always requires user to tap/click the notification or Bento Grid tile.
13. **HealthKit and FamilyControls are iOS-only.** Never import these frameworks in shared or macOS targets. Use `#if os(iOS)` guards everywhere.
14. **Haptics are iOS/watchOS only.** macOS uses visual feedback (scale animations, flash) in place of haptic feedback — never call `UIImpactFeedbackGenerator` in shared code.

---

## Pricing (Active — Option C)

| Plan | Price | Anchor | Discount | Stripe Price ID |
|---|---|---|---|---|
| Doer Tab Monthly | $24/mo | ~~$40/mo~~ | 40% off | `price_doer_monthly_24` |
| Doer Tab Annual | $16.99/mo / $204/yr | ~~$480/yr~~ | 57% off | `price_doer_annual_204` |
| Scholarship Mode | $20/mo | — | Refundable on 30-day streak | `price_scholarship_monthly_20` |

Annual saves user **$84/year** vs monthly Doer Tab.

---

## Build Phase Order

Claude Code must execute phases in order. Do not start Phase N+1 until Phase N is verified. Every phase must be built for **all three platforms** (iOS, macOS, Web) unless noted.

| Phase | Focus |
|---|---|
| 1 | Foundation — multi-platform Xcode project, all auth providers, ThemeEngine, Bento Grid (iOS/macOS/Web layouts), BennettPersonaService |
| 2 | Core Mechanics — Double-Lock (all platforms), Marble Jar, Dynamic Shielding, dark patterns |
| 3 | Doer Tab — layout (sidebar on macOS, grid on iOS/Web), Knowledge Modules, Market Insights, Knowledge Bar |
| 4 | Revenue & Gamification — Stripe, Scholarship Mode, Redemption Quest, Arena, Badges |
| 5 | Beta Infrastructure — Waitlist Diagnostic, Doer Dossier pipeline, Founder review interface |
| 6 | Integrations & Polish — Higgsfield, YouTube API, HealthKit (iOS), Apple Watch, Screen Time (iOS), encryption, macOS menu bar widget |
| 7 | Auth & Onboarding — sign-up (all platforms), username creation, 10-step walkthrough, Touch ID (macOS), Face ID (iOS) |
| 8 | The Bulletin — BulletinService cron, 9-slide deck, aiVerdict generation, history, share card |

---

## macOS-Specific Layout Rules

- **Navigation:** Sidebar + detail pane (NavigationSplitView) — no tab bar
- **Bento Grid:** 3–4 columns minimum, wider tile sizes
- **Double-Lock:** Webcam required for Smile Sync; keyboard/click for Stroop; microphone for Vocalization
- **Haptics:** Replace all haptic calls with visual feedback (brief scale pulse or color flash)
- **Menu Bar Widget:** NSStatusItem shows current streak count + one-click Double-Lock launch
- **Keyboard shortcuts:** All primary actions have `⌘` shortcuts (e.g., `⌘D` = open Double-Lock, `⌘B` = open Bulletin)
- **Toolbar:** NSToolbar replaces iOS navigation bar
- **Notifications:** macOS Notification Center via `UNUserNotificationCenter` (same API as iOS)
- **Biometric:** Touch ID via `LAContext` — prompt on sign-in and on app reopen after idle

---

## Environment Variables Required

```bash
# Anthropic
ANTHROPIC_API_KEY=

# Firebase
FIREBASE_PROJECT_ID=
FIREBASE_PRIVATE_KEY=
FIREBASE_CLIENT_EMAIL=

# Stripe
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_PRICE_DOER_MONTHLY=price_doer_monthly_24
STRIPE_PRICE_DOER_ANNUAL=price_doer_annual_204
STRIPE_PRICE_SCHOLARSHIP=price_scholarship_monthly_20

# Google
GOOGLE_CALENDAR_CLIENT_ID=
GOOGLE_CALENDAR_CLIENT_SECRET=

# Higgsfield
HIGGSFIELD_API_KEY=

# App
NEXT_PUBLIC_APP_URL=
```

---

*Full spec: `docs/BENNETT_BUILD_PROMPT.md` — read before writing any feature code.*
