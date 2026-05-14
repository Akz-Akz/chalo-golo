import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient.js';

/**
 * Lightweight channel for demo "live" ticks — uses broadcast if Realtime enabled,
 * otherwise fakes periodic pulse client-side.
 */
export function useRealtime(userId) {
  const [tick, setTick] = useState(0);
  const [onlineHint, setOnlineHint] = useState(128);

  useEffect(() => {
    if (!supabase || !userId) {
      const i = setInterval(() => {
        setTick((t) => t + 1);
        setOnlineHint(90 + Math.floor(Math.random() * 80));
      }, 8000);
      return () => clearInterval(i);
    }

    const channel = supabase.channel(`cg-demo-${userId}`).subscribe(() => {});
    const i = setInterval(() => {
      setTick((t) => t + 1);
      setOnlineHint(100 + Math.floor(Math.random() * 60));
    }, 12000);
    return () => {
      clearInterval(i);
      supabase.removeChannel(channel);
    };
  }, [userId]);

  return { tick, onlineHint };
}
