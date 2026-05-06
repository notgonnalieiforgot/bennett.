import {
  signInWithPopup,
  signInWithRedirect,
  signOut as fbSignOut,
  GoogleAuthProvider,
  FacebookAuthProvider,
  OAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  type UserCredential,
} from 'firebase/auth';
import { auth, providers } from './firebase';

/// Phase 1.2 — provider config + smoke-test entry points only.
/// The full sign-up screen lands in Phase 7. Apple Sign In on web uses
/// the OIDC `apple.com` provider configured in Firebase console.

export const authService = {
  async signInWithApple(): Promise<UserCredential> {
    return signInWithPopup(auth(), providers.apple());
  },

  async signInWithGoogle(): Promise<UserCredential> {
    return signInWithPopup(auth(), providers.google());
  },

  async signInWithFacebook(): Promise<UserCredential> {
    return signInWithPopup(auth(), providers.facebook());
  },

  /// LinkedIn requires a custom OIDC provider id (`oidc.linkedin`)
  /// configured in Firebase console with LinkedIn client id/secret.
  /// Redirect flow rather than popup — LinkedIn blocks popups.
  async signInWithLinkedIn(): Promise<void> {
    return signInWithRedirect(auth(), providers.linkedin());
  },

  async signInWithEmail(email: string, password: string): Promise<UserCredential> {
    return signInWithEmailAndPassword(auth(), email, password);
  },

  async signUpWithEmail(email: string, password: string): Promise<UserCredential> {
    return createUserWithEmailAndPassword(auth(), email, password);
  },

  async signOut(): Promise<void> {
    return fbSignOut(auth());
  },
};

export const authProviderIds = {
  apple: 'apple.com' as const,
  google: GoogleAuthProvider.PROVIDER_ID,
  facebook: FacebookAuthProvider.PROVIDER_ID,
  linkedin: 'oidc.linkedin' as const,
} satisfies Record<string, string>;

// Re-exported so caller code doesn't import from firebase/auth directly
export { OAuthProvider, GoogleAuthProvider, FacebookAuthProvider };
