import { MarkerType } from '@xyflow/react';

/**
 * Maps gamified AI JSON nodes to React Flow nodes/edges.
 * @param {{ title?: string, nodes?: Array<{ id?: number|string, title?: string, type?: string, difficulty?: string, xp?: number, completed?: boolean }> }} roadmapJson
 */
export function mapGamifiedJsonToFlow(roadmapJson) {
  const nodesIn = Array.isArray(roadmapJson?.nodes) ? roadmapJson.nodes : [];
  if (!nodesIn.length) {
    return {
      title: roadmapJson?.title || 'Mission map',
      nodes: [
        {
          id: 'n1',
          position: { x: 0, y: 0 },
          data: { label: 'Start', sub: 'Add a roadmap', type: 'spark' },
          type: 'glow',
        },
      ],
      edges: [],
    };
  }

  const nodes = nodesIn.map((n, i) => {
    const id = String(n.id ?? `n-${i}`);
    const angle = (i / Math.max(nodesIn.length, 1)) * Math.PI * 2;
    const radius = 160 + (i % 3) * 40;
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;
    const tier = String(n.difficulty || 'core').toLowerCase().includes('hard')
      ? 'nova'
      : String(n.difficulty || '').toLowerCase().includes('mid')
        ? 'blaze'
        : 'spark';
    return {
      id,
      position: { x, y },
      data: {
        label: n.title || `Step ${i + 1}`,
        sub: `${n.type || 'learn'} • ${n.difficulty || 'balanced'}`,
        type: tier,
        xp: n.xp ?? 10,
        done: Boolean(n.completed),
      },
      type: 'glow',
    };
  });

  const edges = nodes.slice(1).map((node, i) => ({
    id: `e-${nodes[i].id}-${node.id}`,
    source: nodes[i].id,
    target: node.id,
    animated: true,
    style: { stroke: '#a855f7', strokeWidth: 2 },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#a855f7' },
  }));

  return { title: roadmapJson?.title || 'Mission map', nodes, edges };
}
