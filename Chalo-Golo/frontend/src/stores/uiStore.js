import { create } from 'zustand';

export const useUiStore = create((set) => ({
  soundsMuted: true,
  antiOverlay: false,
  badgePayload: null,
  setSoundsMuted: (soundsMuted) => set({ soundsMuted }),
  setAntiOverlay: (antiOverlay) => set({ antiOverlay }),
  showBadge: (badgePayload) => set({ badgePayload }),
  clearBadge: () => set({ badgePayload: null }),
}));
