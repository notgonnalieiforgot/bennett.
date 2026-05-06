# Bennett Backend

Two deploy targets, one source tree:

- **Vercel Edge Functions** — `api/**/*.ts` — request/response API: Claude relay, persona service, username check, Stripe webhooks, calendar shielding, Higgsfield, Bulletin read endpoints.
- **Firebase Scheduled Functions** — `firebase/functions/src/**` — only the Friday 6pm Bulletin cron lives here.

## Layout
```
backend/
├── api/                    Vercel Edge endpoints
│   ├── claude.ts            generic Claude relay
│   ├── persona/             BennettPersonaService — POST /api/persona
│   │   ├── index.ts
│   │   ├── service.ts
│   │   ├── prompts.ts        Friend/Commander prompt builder + energy modifiers
│   │   ├── lingo.ts          phrase bank + banned list + trigger→category map
│   │   └── sanitizer.ts      strips capital I, banned phrases, formal punctuation
│   ├── bulletin/index.ts    GET /api/bulletin (read)
│   ├── stripe-webhooks.ts
│   ├── calendar-shield.ts
│   ├── username-check.ts    GET /api/username-check?q=
│   ├── higgsfield.ts
│   └── health.ts            GET /api/health
├── lib/
│   ├── env.ts                env validation
│   ├── anthropic.ts          Anthropic SDK client
│   ├── firebase-admin.ts     Firebase Admin SDK client
│   └── http.ts               json/error/readJson helpers
├── db/schema.md             Firestore schema doc
├── firebase/
│   ├── firebase.json
│   ├── .firebaserc
│   └── functions/           Firebase Scheduled Functions package
│       └── src/
│           ├── index.ts      bulletinFriday cron
│           └── bulletin.ts   aggregation pipeline (Phase 8)
├── package.json
├── tsconfig.json
├── vercel.json
└── README.md
```

## Setup
```bash
# from repo root
cd shared && # nothing to install, types only
cd ../backend && npm install
cp ../.env.example .env.local   # fill in secrets

# Vercel dev
npm run dev

# Firebase functions
cd firebase/functions && npm install && npm run build
```

## Phase 1 status
- [x] Vercel scaffold + tsconfig + vercel.json
- [x] Health endpoint
- [x] Anthropic + Firebase Admin clients
- [x] BennettPersonaService skeleton (Phase 1.5 fills in prompts/sanitizer — already in)
- [x] Firebase Scheduled Function shell
- [ ] Phase 1.2 — Firebase Auth provider config (deferred to web/iOS clients)
