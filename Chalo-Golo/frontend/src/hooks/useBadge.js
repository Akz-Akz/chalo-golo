import { useCallback } from 'react';
import { useUiStore } from '../stores/uiStore.js';
import { insertBadgeRow } from '../services/gamificationDb.js';
import { badgeDefinitions } from '../services/rewards.js';

export function useBadge() {
  const showBadge = useUiStore((s) => s.showBadge);
  const clearBadge = useUiStore((s) => s.clearBadge);

  const unlock = useCallback(
    async (key, userId, bonusXp = 25) => {
      const defs = badgeDefinitions();
      const def = defs[key];
      if (!def) return null;
      if (userId) {
        await insertBadgeRow({
          user_id: userId,
          badge_name: def.name,
          badge_type: def.type,
        });
      }
      showBadge({ ...def, key, bonusXp });
      return def;
    },
    [showBadge],
  );

  return { unlock, clearBadge };
}
