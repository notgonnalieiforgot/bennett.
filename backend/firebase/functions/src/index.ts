import { onSchedule } from 'firebase-functions/scheduler';
import { initializeApp } from 'firebase-admin/app';
import { generateBulletinForAllUsers } from './bulletin';

initializeApp();

// PHASE 8 — Friday 6pm user-local-time bulletin generation.
// We run hourly between 18:00 and 23:00 across timezones; per-user gating
// inside generateBulletinForAllUsers ensures each user is processed exactly
// once on their local Friday 6pm.
export const bulletinFriday = onSchedule(
  {
    schedule: 'every 60 minutes',
    timeZone: 'UTC',
    region: 'us-central1',
    memory: '512MiB',
    timeoutSeconds: 540,
  },
  async () => {
    await generateBulletinForAllUsers();
  },
);

// PHASE 6.1 — Daily morning energy-check (hourly UTC, per-user 8am gate).
export { morningEnergyCheck } from './notifications';
// PHASE 6.2 — Nightly Higgsfield priming video (hourly UTC, per-user 11pm gate).
export { higgsfieldNightly } from './higgsfield';
