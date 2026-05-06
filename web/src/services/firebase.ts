import { initializeApp, type FirebaseApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  FacebookAuthProvider,
  OAuthProvider,
  PhoneAuthProvider,
  EmailAuthProvider,
  type Auth,
} from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';

// All values are populated from Vite env at build time. The web client
// is allowed to know these — they are public Firebase config, not
// secrets. Server-only secrets (Anthropic, Stripe, OAuth client
// secrets) NEVER live here. See backend/lib/env.ts.
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

let app: FirebaseApp | null = null;

export function firebase(): FirebaseApp {
  if (!app) app = initializeApp(firebaseConfig);
  return app;
}

export function auth(): Auth {
  return getAuth(firebase());
}

export function firestore(): Firestore {
  return getFirestore(firebase());
}

// Phase 1.2 — provider config only. Sign-up UI is Phase 7.
export const providers = {
  google: () => new GoogleAuthProvider(),
  facebook: () => new FacebookAuthProvider(),
  apple: () => {
    const p = new OAuthProvider('apple.com');
    p.addScope('email');
    p.addScope('name');
    return p;
  },
  linkedin: () => {
    // LinkedIn is OIDC-only — register a custom OIDC provider in Firebase
    // console first ("oidc.linkedin"). Phase 7 wires the redirect flow.
    return new OAuthProvider('oidc.linkedin');
  },
  phone: () => PhoneAuthProvider,
  email: () => EmailAuthProvider,
};
