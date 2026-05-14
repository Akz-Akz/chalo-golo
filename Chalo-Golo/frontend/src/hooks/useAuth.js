import { useCallback, useEffect, useState } from 'react';
import { authService } from '../supabaseClient.js';

export function useAuth() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    authService.getSession().then(({ data }) => {
      if (!mounted) return;
      setSession(data?.session || null);
      setLoading(false);
    });
    const { data: { subscription } } = authService.onAuthStateChange((_e, sess) => {
      setSession(sess);
    });
    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, []);

  const signOut = useCallback(async () => {
    await authService.signOut();
    setSession(null);
  }, []);

  return { session, user: session?.user ?? null, loading, signOut };
}
