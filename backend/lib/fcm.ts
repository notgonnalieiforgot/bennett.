import { getMessaging, type Messaging, type MulticastMessage } from 'firebase-admin/messaging';
import { firebaseApp, db } from './firebase-admin';

/**
 * Firebase Cloud Messaging wrapper.
 *
 * Per spec §9c, all notifications use Bennett Friend persona voice.
 * However the FCM `notification.title` / `body` fields render as system
 * notifications and don't go through the persona service — instead, each
 * trigger ships pre-approved title+body strings registered here that
 * already match the voice rules. The full persona-rendered detail lands
 * in-app once the user taps the notification.
 */

let messaging: Messaging | null = null;
function fcm(): Messaging {
  if (!messaging) messaging = getMessaging(firebaseApp());
  return messaging;
}

export type NotificationKind =
  | 'morning_energy_check'
  | 'shield_activated'
  | 'higgsfield_ready'
  | 'streak_milestone'
  | 'streak_danger'
  | 'bulletin_ready'
  | 'bulletin_sunday_reminder';

interface PushPayload {
  title: string;
  body: string;
  /** Deep link path consumed by the client. */
  deepLink?: string;
  /** Extra data piggybacked on the message — Phase 8 Bulletin uses it. */
  data?: Record<string, string>;
}

/** Pre-approved Friend-voice strings for each notification kind. */
export const NOTIFICATION_COPY: Record<NotificationKind, PushPayload> = {
  morning_energy_check: {
    title: 'bennett.',
    body: 'hey. energy check. 1–10?',
    deepLink: '/?energy=check',
  },
  shield_activated: {
    title: 'bennett.',
    body: '🛡 blocked off some time for u. protect it.',
    deepLink: '/?shields=today',
  },
  higgsfield_ready: {
    title: 'bennett.',
    body: 'ur morning brief is ready. 30s. watch it.',
    deepLink: '/?brief=ready',
  },
  streak_milestone: {
    title: 'bennett.',
    body: '7 days. u actually doing it.',
    deepLink: '/?marbles=jar',
  },
  streak_danger: {
    title: 'bennett.',
    body: 'yo — u didn\'t check in. still time tho.',
    deepLink: '/?double-lock=open',
  },
  bulletin_ready: {
    title: 'bennett.',
    body: 'ur bulletin just dropped. see how ur week went.',
    deepLink: '/?bulletin=ready',
  },
  bulletin_sunday_reminder: {
    title: 'bennett.',
    body: 'bulletin expires tonight. ur week\'s waiting for u.',
    deepLink: '/?bulletin=ready',
  },
};

/** Send a notification to every device registered for `uid`. */
export async function sendToUser(uid: string, kind: NotificationKind): Promise<void> {
  const tokensSnap = await db()
    .collection('users')
    .doc(uid)
    .collection('pushTokens')
    .get();
  const tokens = tokensSnap.docs
    .map((d) => (d.data() as { token: string }).token)
    .filter(Boolean);
  if (tokens.length === 0) return;

  const copy = NOTIFICATION_COPY[kind];
  const message: MulticastMessage = {
    tokens,
    notification: {
      title: copy.title,
      body: copy.body,
    },
    data: {
      kind,
      ...(copy.deepLink ? { deepLink: copy.deepLink } : {}),
      ...(copy.data ?? {}),
    },
    apns: {
      payload: {
        aps: { sound: 'default', badge: 1 },
      },
    },
  };
  await fcm().sendEachForMulticast(message);
}

/** Bulk send used by cron-style triggers (Bulletin Friday 8pm, etc.). */
export async function sendToUsers(uids: string[], kind: NotificationKind): Promise<void> {
  await Promise.all(uids.map((uid) => sendToUser(uid, kind)));
}
