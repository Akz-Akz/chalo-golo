import React, { useMemo, useCallback, useEffect } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  Handle,
  Position,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

function GlowNode({ data }) {
  const tier = data.type || 'spark';
  return (
    <div className={`cg-flow-node cg-${tier}`} style={{ position: 'relative' }}>
      <Handle type="target" position={Position.Top} style={{ opacity: 0 }} />
      <div className="cg-flow-title">{data.label}</div>
      <div className="cg-flow-sub">{data.sub}</div>
      <div className="cg-flow-xp">+{data.xp} XP</div>
      <Handle type="source" position={Position.Bottom} style={{ opacity: 0 }} />
    </div>
  );
}

const nodeTypes = { glow: GlowNode };

export default function GamifiedRoadmapFlow({ layout }) {
  const initialNodes = useMemo(() => layout?.nodes || [], [layout]);
  const initialEdges = useMemo(() => layout?.edges || [], [layout]);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  useEffect(() => {
    setNodes(initialNodes);
    setEdges(initialEdges);
  }, [initialNodes, initialEdges, setNodes, setEdges]);

  const onInit = useCallback((instance) => {
    setTimeout(() => instance.fitView({ padding: 0.2 }), 50);
  }, []);

  return (
    <div style={{ height: 420, borderRadius: 20, overflow: 'hidden', border: '1px solid rgba(168,85,247,0.35)' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        fitView
        onInit={onInit}
        minZoom={0.4}
        maxZoom={1.4}
        proOptions={{ hideAttribution: true }}
      >
        <Background gap={20} color="rgba(148,163,184,0.15)" />
        <Controls />
        <MiniMap pannable zoomable style={{ background: '#0f172a' }} />
      </ReactFlow>
    </div>
  );
}
