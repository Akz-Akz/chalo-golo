import { create } from 'zustand';

export const useUserStore = create((set, get) => ({
  xp: 0,
  streak: 0,
  level: 'spark',
  attentionScore: null,
  emergencyExitLeft: 2,
  userId: null,
  hydrate: (payload = {}) =>
    set({
      xp: payload.xp ?? get().xp,
      streak: payload.streak ?? get().streak,
      level: payload.level ?? get().level,
      attentionScore: payload.attentionScore ?? get().attentionScore,
      emergencyExitLeft: payload.emergencyExitLeft ?? get().emergencyExitLeft,
      userId: payload.userId ?? get().userId,
    }),
  setUserId: (userId) => set({ userId }),
  setLevel: (level) => set({ level }),
  setAttentionScore: (attentionScore) => set({ attentionScore }),
  addXp: (amount) => set((s) => ({ xp: Math.max(0, s.xp + (amount | 0)) })),
  setStreak: (streak) => set({ streak: Math.max(0, streak | 0) }),
  useEmergencyExit: () =>
    set((s) => ({
      emergencyExitLeft: Math.max(0, (s.emergencyExitLeft ?? 2) - 1),
    })),
}));
