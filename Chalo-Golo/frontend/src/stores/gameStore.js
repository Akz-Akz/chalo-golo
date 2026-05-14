import { create } from 'zustand';

export const useGameStore = create((set) => ({
  activeGame: null,
  lastScore: 0,
  setActiveGame: (activeGame) => set({ activeGame }),
  setLastScore: (lastScore) => set({ lastScore }),
}));
