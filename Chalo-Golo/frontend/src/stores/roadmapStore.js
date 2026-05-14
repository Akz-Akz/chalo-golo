import { create } from 'zustand';

export const useRoadmapStore = create((set) => ({
  gamifiedJson: null,
  activeRoadmapId: null,
  activeNodeId: null,
  setGamified: (gamifiedJson, activeRoadmapId = null) =>
    set({ gamifiedJson, activeRoadmapId, activeNodeId: null }),
  setActiveNode: (activeNodeId) => set({ activeNodeId }),
  markNodeDone: (nodeId) =>
    set((s) => {
      if (!s.gamifiedJson?.nodes) return s;
      const nodes = s.gamifiedJson.nodes.map((n) =>
        String(n.id) === String(nodeId) || n.id === nodeId ? { ...n, completed: true } : n,
      );
      return { gamifiedJson: { ...s.gamifiedJson, nodes } };
    }),
  clear: () => set({ gamifiedJson: null, activeRoadmapId: null, activeNodeId: null }),
}));
