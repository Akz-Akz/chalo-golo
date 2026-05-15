import { create } from 'zustand';
import { audioManager } from '../services/audioManager.js';

const readPresence = () => {
  try {
    return localStorage.getItem('chalo_golo_presence') || 'online';
  } catch {
    return 'online';
  }
};

export const useUiStore = create((set) => ({
  soundsMuted: audioManager.isMuted(),
  presence: readPresence(),
  antiOverlay: null,
  badgePayload: null,
  setSoundsMuted: (soundsMuted) => {
    audioManager.setMuted(soundsMuted);
    set({ soundsMuted });
  },
  setPresence: (presence) => {
    try {
      localStorage.setItem('chalo_golo_presence', presence);
    } catch {
      // Ignore storage write errors.
    }
    set({ presence });
  },
  setAntiOverlay: (antiOverlay) => set({ antiOverlay }),
  triggerWarning: (payload = {}) => set({ antiOverlay: payload }),
  showBadge: (badgePayload) => set({ badgePayload }),
  clearBadge: () => set({ badgePayload: null }),
}));
