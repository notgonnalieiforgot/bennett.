import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { firebase } from './firebase';

const BASE = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? '';
const VAPID_KEY = import.meta.env.VITE_FCM_VAPID_KEY as string | undefined;

/**
 * Web push registration. Requires:
 *   1. `firebase-messaging-sw.js` at /public/firebase-messaging-sw.js
 *   2. `VITE_FCM_VAPID_KEY` set to the FCM web push certificate public key
 *
 * Both are deployment-config tasks, not code; the README documents them.
 */
export async function registerWebPush(uid: string): Promise<void> {
  if (!('serviceWorker' in navigator)) return;
  if (!VAPID_KEY) {
    console.info('[bennett] FCM VAPID key not set — web push disabled');
    return;
  }
  try {
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') return;

    const registration = await navigator.serviceWorker.register(
      '/firebase-messaging-sw.js',
    );
    const messaging = getMessaging(firebase());
    const token = await getToken(messaging, {
      vapidKey: VAPID_KEY,
      serviceWorkerRegistration: registration,
    });
    if (!token) return;

    await fetch(`${BASE}/api/notifications/register-token`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ uid, token, platform: 'web' }),
    });

    onMessage(messaging, (payload) => {
      const link = payload.data?.deepLink;
      if (link) {
        // Lightweight in-app routing — Phase 7 will replace with React Router push.
        const url = new URL(link, window.location.origin);
        window.history.pushState({}, '', url.pathname + url.search);
        window.dispatchEvent(new PopStateEvent('popstate'));
      }
    });
  } catch (e) {
    console.warn('[bennett] web push registration failed', e);
  }
}
