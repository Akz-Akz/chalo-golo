import { useCallback, useMemo } from 'react';
import { useUserStore } from '../stores/userStore.js';
import { upsertUserRow } from '../services/gamificationDb.js';

function dayKey(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function computeStreakFromLastCheck(lastCheckIso, currentStreak) {
  const today = dayKey(new Date());
  if (!lastCheckIso) return { streak: Math.max(1, currentStreak || 1), lastCheckIso: new Date().toISOString(), changed: true };
  const last = dayKey(new Date(lastCheckIso));
  if (last === today) return { streak: currentStreak || 1, lastCheckIso, changed: false };
  const y = new Date();
  y.setDate(y.getDate() - 1);
  if (last === dayKey(y)) return { streak: (currentStreak || 0) + 1, lastCheckIso: new Date().toISOString(), changed: true };
  return { streak: 1, lastCheckIso: new Date().toISOString(), changed: true };
}

export function useStreak() {
  const streak = useUserStore((s) => s.streak);
  const setStreak = useUserStore((s) => s.setStreak);
  const userId = useUserStore((s) => s.userId);

  const pulse = useMemo(() => streak >= 3, [streak]);

  const touchStreak = useCallback(
    async (profile, saveProfile) => {
      const cur = profile?.streak ?? streak ?? 0;
      const { streak: next, lastCheckIso, changed } = computeStreakFromLastCheck(profile?.lastStreakCheck, cur);
      if (changed) {
        setStreak(next);
        if (saveProfile) {
          saveProfile({ ...profile, streak: next, lastStreakCheck: lastCheckIso });
        }
        if (userId) {
          await upsertUserRow({
            id: userId,
            streak: next,
            xp: useUserStore.getState().xp,
            level: useUserStore.getState().level,
          });
        }
      }
      return { streak: next, changed };
    },
    [setStreak, streak, userId],
  );

  return { streak, pulse, touchStreak };
}
