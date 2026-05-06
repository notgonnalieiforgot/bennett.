# Firestore Schema

## `users/{uid}`
Mirrors `shared/types/UserRecord.ts`. Add `usernameLower` (string, derived) for case-insensitive uniqueness queries.

**Indexes:**
- `usernameLower` ASC (single field, for `/api/username/check`)
- `currentStreak` DESC (Arena Global ordering)
- `activeModules` (array contains, for Specialized Sectors)

## `users/{uid}/bulletins/{weekNumber}`
Stores full `BulletinData` per user per week. Never deleted (Bulletin History).

## `users/{uid}/marbles/{marbleId}`
- `type`: 'clear' | 'gold' | 'diamond' | 'ghost'
- `earnedAt`: timestamp
- `moduleCompleted`: string | null
- Ghost marbles persist permanently — no delete path.

## `users/{uid}/shields/{shieldId}`
- `calendarEventId`: string (Google Calendar event id)
- `state`: 'active' | 'honored' | 'ignored'
- `start`, `end`: timestamps

## `users/{uid}/feedback/{feedbackId}`
- `text`: string
- `source`: 'beta_feedback'
- `sentiment`: 'positive' | 'neutral' | 'negative' (computed)
- `createdAt`: timestamp

## `marketInsights/{insightId}`
- `domain`: 'stocks' | 'real_estate' | 'ai_digital'
- `state`: 'draft' | 'review' | 'published'
- `founderFilter`: string | null
- Audit log subcollection.

## `arena/global/{uid}`
Materialized leaderboard entry — username + disciplineVelocity. Updated via cron + trigger.

## `arena/sector/{module}/{uid}`
Per-module leaderboard. Same shape, scoped to one module.

## `waitlist/{applicationId}`
Beta diagnostic submission + Doer Dossier JSON.
