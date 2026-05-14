import { useCallback } from 'react';
import { useRoadmapStore } from '../stores/roadmapStore.js';
import { generateGamifiedRoadmapJSON, buildFallbackGamifiedRoadmap } from '../services/ai.js';
import { mapGamifiedJsonToFlow } from '../services/roadmap.js';
import { insertRoadmapRow } from '../services/gamificationDb.js';

export function useRoadmap() {
  const gamifiedJson = useRoadmapStore((s) => s.gamifiedJson);
  const activeRoadmapId = useRoadmapStore((s) => s.activeRoadmapId);
  const setGamified = useRoadmapStore((s) => s.setGamified);
  const markNodeDone = useRoadmapStore((s) => s.markNodeDone);
  const clear = useRoadmapStore((s) => s.clear);

  const loadGamified = useCallback(async ({ topic, userLevel }) => {
    const json = (await generateGamifiedRoadmapJSON({ topic, userLevel })) || buildFallbackGamifiedRoadmap(topic);
    setGamified(json, null);
    return json;
  }, [setGamified]);

  const persistGamified = useCallback(
    async (userId, topic, json) => {
      if (!userId || !json) return null;
      const { id } = await insertRoadmapRow({ userId, topic, roadmapJson: json });
      if (id) setGamified(json, id);
      return id;
    },
    [setGamified],
  );

  const flow = useCallback(() => mapGamifiedJsonToFlow(gamifiedJson || {}), [gamifiedJson]);

  return {
    gamifiedJson,
    activeRoadmapId,
    loadGamified,
    persistGamified,
    markNodeDone,
    clear,
    flow,
  };
}
