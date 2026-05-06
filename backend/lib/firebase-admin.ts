import { initializeApp, getApps, cert, type App } from 'firebase-admin/app';
import { getFirestore, type Firestore } from 'firebase-admin/firestore';
import { env } from './env';

let app: App | null = null;

export function firebaseApp(): App {
  if (app) return app;
  const existing = getApps();
  if (existing.length > 0) {
    app = existing[0]!;
    return app;
  }
  app = initializeApp({
    credential: cert({
      projectId: env.firebaseProjectId(),
      clientEmail: env.firebaseClientEmail(),
      privateKey: env.firebasePrivateKey(),
    }),
  });
  return app;
}

export function db(): Firestore {
  return getFirestore(firebaseApp());
}
