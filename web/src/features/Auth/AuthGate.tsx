import { useEffect, useState, type ReactNode } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth } from '../../services/firebase';
import { firestore } from '../../services/firebase';
import { SignUp } from './SignUp';
import { SignIn } from './SignIn';
import { UsernameSetup } from './UsernameSetup';
import { ForgotPassword } from './ForgotPassword';
import { OnboardingFlow } from '../Onboarding/OnboardingFlow';

type Stage = 'loading' | 'signedOut' | 'needsUsername' | 'needsOnboarding' | 'signedIn';

interface Props {
  children: ReactNode;
}

export function AuthGate({ children }: Props) {
  const [stage, setStage] = useState<Stage>('loading');
  const [uid, setUid] = useState<string | null>(null);
  const [showSignIn, setShowSignIn] = useState(false);
  const [showForgot, setShowForgot] = useState(false);

  useEffect(() => {
    return onAuthStateChanged(auth(), async (u) => {
      if (!u) {
        setStage('signedOut');
        setUid(null);
        return;
      }
      setUid(u.uid);
      try {
        const snap = await getDoc(doc(firestore(), 'users', u.uid));
        const data = snap.data();
        if (!data || !data.username) setStage('needsUsername');
        else if (data.isNewUser !== false) setStage('needsOnboarding');
        else setStage('signedIn');
      } catch {
        setStage('needsUsername');
      }
    });
  }, []);

  async function refreshFromFirestore(forUid: string) {
    try {
      const snap = await getDoc(doc(firestore(), 'users', forUid));
      const data = snap.data();
      if (!data || !data.username) setStage('needsUsername');
      else if (data.isNewUser !== false) setStage('needsOnboarding');
      else setStage('signedIn');
    } catch {
      setStage('needsUsername');
    }
  }

  if (stage === 'loading') {
    return <div className="min-h-dvh w-full bg-bg flex items-center justify-center text-muted">…</div>;
  }
  if (stage === 'signedOut') {
    if (showForgot) return <ForgotPassword onBack={() => setShowForgot(false)} />;
    if (showSignIn) {
      return (
        <SignIn
          onSignedIn={(u) => { setUid(u); void refreshFromFirestore(u); }}
          onShowSignUp={() => setShowSignIn(false)}
          onForgotPassword={() => setShowForgot(true)}
        />
      );
    }
    return (
      <SignUp
        onSignedIn={(u) => { setUid(u); void refreshFromFirestore(u); }}
        onShowSignIn={() => setShowSignIn(true)}
      />
    );
  }
  if (stage === 'needsUsername' && uid) {
    return <UsernameSetup uid={uid} onLocked={() => setStage('needsOnboarding')} />;
  }
  if (stage === 'needsOnboarding' && uid) {
    return <OnboardingFlow uid={uid} onComplete={() => setStage('signedIn')} />;
  }
  return <>{children}</>;
}
