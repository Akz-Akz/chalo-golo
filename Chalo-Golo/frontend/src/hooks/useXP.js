import { useCallback } from 'react';
import { useUserStore } from '../stores/userStore.js';
import { upsertUserRow } from '../services/gamificationDb.js';
import { xpToDisplayTier } from '../services/rewards.js';

export function useXP() {
  const xp = useUserStore((s) => s.xp);
  const addXp = useUserStore((s) => s.addXp);
  const userId = useUserStore((s) => s.userId);
  const level = useUserStore((s) => s.level);
  const setLevel = useUserStore((s) => s.setLevel);

  const grantXp = useCallback(
    async (amount, meta = {}) => {
      const prevXp = useUserStore.getState().xp;
      const prevTier = xpToDisplayTier(prevXp);
      addXp(amount);
      const nextXp = useUserStore.getState().xp;
      const nextTier = xpToDisplayTier(nextXp);
      if (userId) {
        await upsertUserRow({
          id: userId,
          xp: nextXp,
          streak: useUserStore.getState().streak,
          level: useUserStore.getState().level,
        });
      }
      return {
        xp: nextXp,
        leveledVisual: nextTier !== prevTier,
        nextTier,
        meta,
      };
    },
    [addXp, userId],
  );

  return { xp, level, grantXp, setLevel, xpToDisplayTier };
}
