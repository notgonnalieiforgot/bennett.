import { onSchedule } from 'firebase-functions/scheduler';
import { getFirestore } from 'firebase-admin/firestore';
import { getMessaging } from 'firebase-admin/messaging';

/**
 * PHASE 6.2 — Nightly priming video pipeline.
 *
 * Per spec §9b: "Each night at 11pm user local time, generate a 30-second
 * cinematic priming video based on the user's active goals and tomorrow's
 * module. Cache the video and push a notification."
 *
 * Schedule: hourly UTC; per-user gate fires when local hour == 23.
 *
 * The Higgsfield API is third-party. The cron does:
 *  1. POST to Higgsfield with the user's activeModules + a brief context
 *  2. Persist the returned video URL to users/{uid}/morningBrief/{date}
 *  3. Push notification "ur morning brief is ready. 30s. watch it."
 *
 * If HIGGSFIELD_API_KEY is unset (local dev), we no-op gracefully.
 */
export const higgsfieldNightly = onSchedule(
  {
    schedule: 'every 60 minutes',
    timeZone: 'UTC',
    region: 'us-central1',
    memory: '512MiB',
    timeoutSeconds: 540,
  },
  async () => {
    const apiKey = process.env.HIGGSFIELD_API_KEY;
    if (!apiKey) {
      console.info('[higgsfield] HIGGSFIELD_API_KEY not set — skipping');
      return;
    }
    const db = getFirestore();
    const usersSnap = await db.collection('users').limit(5000).get();
    const now = new Date();

    for (const userDoc of usersSnap.docs) {
      const u = userDoc.data() ?? {};
      const tz = (u.timezone as string | undefined) ?? 'UTC';
      const localHour = hourInTimezone(now, tz);
      if (localHour !== 23) continue;

      const dateKey = dateKeyFor(new Date(now.getTime() + 24 * 3600 * 1000), tz);
      const briefRef = userDoc.ref.collection('morningBrief').doc(dateKey);
      if ((await briefRef.get()).exists) continue;  // idempotent — once per day

      const activeModules = (u.activeModules as string[] | undefined) ?? ['general'];
      const username = (u.username as string | undefined) ?? 'doer';

      try {
        const videoUrl = await generateVideo({
          apiKey,
          username,
          modules: activeModules,
        });
        await briefRef.set({
          date: dateKey,
          videoUrl,
          modules: activeModules,
          generatedAt: Date.now(),
        });

        // Notify.
        const tokensSnap = await userDoc.ref.collection('pushTokens').get();
        const tokens = tokensSnap.docs.map((d) => (d.data() as { token: string }).token).filter(Boolean);
        if (tokens.length > 0) {
          await getMessaging().sendEachForMulticast({
            tokens,
            notification: {
              title: 'bennett',
              body: 'ur morning brief is ready. 30s. watch it.',
            },
            data: { kind: 'higgsfield_ready', deepLink: '/?brief=ready' },
            apns: { payload: { aps: { sound: 'default' } } },
          });
        }
      } catch (err) {
        console.warn('[higgsfield]', userDoc.id, err);
      }
    }
  },
);

interface GenerateOpts {
  apiKey: string;
  username: string;
  modules: string[];
}

/**
 * Higgsfield API call. The exact endpoint shape is mocked here based on
 * typical text-to-video APIs (POST → return job id → poll until ready).
 * Replace with the real Higgsfield endpoint + polling loop once the team
 * has API docs.
 */
async function generateVideo(opts: GenerateOpts): Promise<string> {
  const prompt = `30-second cinematic morning priming for a Doer working on ${opts.modules.join(', ')}. dawn light. confident pace. zero stock footage. ends on a single concrete first move.`;
  const res = await fetch('https://api.higgsfield.ai/v1/videos/generate', {
    method: 'POST',
    headers: {
      'authorization': `Bearer ${opts.apiKey}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      prompt,
      duration: 30,
      ratio: '9:16',
    }),
  });
  if (!res.ok) throw new Error(`higgsfield ${res.status}`);
  const json = (await res.json()) as { videoUrl?: string; url?: string };
  const url = json.videoUrl ?? json.url;
  if (!url) throw new Error('no video url returned');
  return url;
}

function hourInTimezone(at: Date, tz: string): number {
  try {
    return Number(new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      hourCycle: 'h23',
      timeZone: tz,
    }).format(at));
  } catch {
    return at.getUTCHours();
  }
}

function dateKeyFor(at: Date, tz: string): string {
  try {
    const fmt = new Intl.DateTimeFormat('en-CA', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      timeZone: tz,
    });
    return fmt.format(at);
  } catch {
    return at.toISOString().slice(0, 10);
  }
}
