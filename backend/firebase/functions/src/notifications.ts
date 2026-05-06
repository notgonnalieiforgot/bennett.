import { onSchedule } from 'firebase-functions/scheduler';
import { initializeApp, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getMessaging } from 'firebase-admin/messaging';

if (getApps().length === 0) initializeApp();

/**
 * Daily morning energy-check notification — fires hourly UTC and gates
 * per-user on whether it's currently 8:00am in their local timezone.
 *
 * Same pattern the Bulletin cron uses (see bulletin.ts). Phase 6 keeps
 * the gating simple — Phase 8 may move to per-tz scheduled invocations.
 */
export const morningEnergyCheck = onSchedule(
  {
    schedule: 'every 60 minutes',
    timeZone: 'UTC',
    region: 'us-central1',
    memory: '256MiB',
    timeoutSeconds: 540,
  },
  async () => {
    const db = getFirestore();
    const usersSnap = await db.collection('users').limit(5000).get();
    const now = new Date();

    for (const userDoc of usersSnap.docs) {
      const u = userDoc.data() ?? {};
      const tz = (u.timezone as string | undefined) ?? 'UTC';
      const localHour = hourInTimezone(now, tz);
      if (localHour !== 8) continue;

      const tokensSnap = await userDoc.ref.collection('pushTokens').get();
      const tokens = tokensSnap.docs.map((d) => (d.data() as { token: string }).token).filter(Boolean);
      if (tokens.length === 0) continue;

      try {
        await getMessaging().sendEachForMulticast({
          tokens,
          notification: {
            title: 'bennett',
            body: 'hey. energy check. 1–10?',
          },
          data: { kind: 'morning_energy_check', deepLink: '/?energy=check' },
          apns: { payload: { aps: { sound: 'default' } } },
        });
      } catch (err) {
        console.warn('[morning] fcm error', userDoc.id, err);
      }
    }
  },
);

function hourInTimezone(at: Date, tz: string): number {
  try {
    const fmt = new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      hourCycle: 'h23',
      timeZone: tz,
    });
    return Number(fmt.format(at));
  } catch {
    return at.getUTCHours();
  }
}
