import React, { useState, useEffect } from 'react';
import Intro from './components/Intro';
import NeuralLink from './components/NeuralLink';
import WarMap from './components/WarMap';
import { auth, testConnection } from './lib/firebase';
import { supabase } from './lib/supabase';
import { onAuthStateChanged } from 'firebase/auth';

type View = 'intro' | 'auth' | 'dashboard';

export default function App() {
  const [view, setView] = useState<View>('intro');
  const [user, setUser] = useState<any>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    testConnection();

    // 1. Check Supabase active session first
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser({
          uid: session.user.id,
          id: session.user.id,
          email: session.user.email,
          displayName: session.user.user_metadata?.full_name || session.user.email?.split('@')[0],
          photoURL: session.user.user_metadata?.avatar_url,
          ...session.user,
        });
      }
      setIsReady(true);
    });

    // 2. Listen to Supabase auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        const u = {
          uid: session.user.id,
          id: session.user.id,
          email: session.user.email,
          displayName: session.user.user_metadata?.full_name || session.user.email?.split('@')[0],
          photoURL: session.user.user_metadata?.avatar_url,
          ...session.user,
        };
        setUser(u);
        if (view !== 'intro') setView('dashboard');
      } else if (!auth.currentUser) {
        setUser(null);
        if (view === 'dashboard') setView('auth');
      }
    });

    // 3. Also listen to Firebase auth for compatibility
    const unsubscribeFb = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        if (view !== 'intro') setView('dashboard');
      } else if (!user) {
        setUser(null);
        if (view === 'dashboard') setView('auth');
      }
      setIsReady(true);
    });

    return () => {
      subscription.unsubscribe();
      unsubscribeFb();
    };
  }, [view]);

  if (!isReady) return <div className="bg-black fixed inset-0" />;

  return (
    <main className="min-h-screen bg-black text-white font-sans selection:bg-blue-500/30 selection:text-white">
      {view === 'intro' && (
        <Intro onComplete={() => setView(user ? 'dashboard' : 'auth')} />
      )}

      {view === 'auth' && (
        <NeuralLink onSuccess={(u) => {
          const formattedUser = {
            uid: u.uid || u.id,
            id: u.uid || u.id,
            email: u.email,
            displayName: u.displayName || u.user_metadata?.full_name || u.email?.split('@')[0],
            photoURL: u.photoURL || u.user_metadata?.avatar_url,
            ...u,
          };
          setUser(formattedUser);
          setView('dashboard');
        }} />
      )}

      {view === 'dashboard' && user && (
        <WarMap user={user} />
      )}
    </main>
  );
}
