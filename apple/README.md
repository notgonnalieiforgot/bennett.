# Bennett iOS

SwiftUI app, iOS 17+. Project is generated from `project.yml` via XcodeGen — the `.xcodeproj` is intentionally not checked in.

## First-time setup

```bash
brew install xcodegen
cd ios
xcodegen generate     # produces Bennett.xcodeproj
open Bennett.xcodeproj
```

Then in Firebase Console → Project Settings → iOS app:
1. Register bundle id `com.bennett.cos`
2. Download `GoogleService-Info.plist`
3. Drop it at `ios/Bennett/Resources/GoogleService-Info.plist` (replace the `.example` placeholder; the real one is gitignored)

## Layout

```
ios/
├── project.yml              XcodeGen spec — single source of truth for the project
└── Bennett/
    ├── App/                 entry point, AppDelegate, RootView
    ├── Features/            (Phase 2+) DoubleLock, MarbleJar, DoerTab, Arena, Bulletin, Revenue, Onboarding
    ├── Models/              UITheme, TriggerEvent, PersonaContext, UserRecord, SessionStore
    ├── Services/
    │   ├── AppConfig.swift          API base URL
    │   ├── ClaudeService.swift      → POST /api/persona on backend
    │   ├── AuthService.swift        Firebase + Apple/Google/Facebook/LinkedIn/Phone/Email
    │   └── FirestoreService.swift   users/{uid} CRUD wrapper
    ├── UITheme/
    │   ├── ThemeEngine.swift        @MainActor ObservableObject — current theme + setter
    │   ├── ThemePalette.swift       per-theme color/radius/shadow tokens
    │   └── Themes.swift              UITheme display labels + onboarding mood lines
    └── Resources/
        ├── Bennett.entitlements             Sign in with Apple + APNs
        ├── GoogleService-Info.plist.example placeholder, replace with real file
        └── Assets.xcassets/                 AppIcon + AccentColor
```

## SDK packages (pinned in project.yml)
- firebase-ios-sdk (Auth, Firestore, FirestoreSwift, Functions, Messaging)
- GoogleSignIn-iOS
- facebook-ios-sdk
- stripe-ios

LinkedIn has no native SDK — Phase 7 will implement OAuth 2.0 via SFSafariViewController.

## Phase 1 status
- [x] XcodeGen project.yml (Firebase, Google, Facebook, Stripe SPM packages wired)
- [x] App entry, AppDelegate, RootView placeholder
- [x] Models mirroring shared/types
- [x] ThemeEngine skeleton (4 palettes, live switching ready) — Phase 1.3 fills per-theme view modifiers
- [x] AuthService — Firebase config + per-provider entry points (Apple/LinkedIn deferred to Phase 7)
- [x] FirestoreService — users/{uid} read/write
- [x] ClaudeService — talks to backend /api/persona
```
