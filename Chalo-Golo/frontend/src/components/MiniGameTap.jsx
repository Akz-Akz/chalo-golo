import React, { useEffect, useState, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { Crosshair } from 'lucide-react';

export default function MiniGameTap({ onClose, onDone }) {
  const [time, setTime] = useState(28);
  const [score, setScore] = useState(0);
  const [target, setTarget] = useState({ x: 40, y: 40 });

  const doneRef = useRef(false);

  const move = useCallback(() => {
    setTarget({
      x: 15 + Math.random() * 70,
      y: 20 + Math.random() * 60,
    });
  }, []);

  useEffect(() => {
    move();
  }, [move]);

  useEffect(() => {
    const id = setInterval(() => {
      setTime((s) => (s <= 1 ? 0 : s - 1));
    }, 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (time !== 0 || doneRef.current) return;
    doneRef.current = true;
    onDone?.(score);
  }, [time, score, onDone]);

  return (
    <div className="cg-galaxy" style={{ minHeight: '100vh', padding: 24, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="cg-glass" style={{ width: 'min(480px, 100%)', padding: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
          <div style={{ fontWeight: 900, fontSize: 18 }}>Tap surge</div>
          <button type="button" onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', fontWeight: 700 }}>
            Close
          </button>
        </div>
        <div style={{ fontSize: 13, color: '#94a3b8', marginBottom: 12 }}>Hit the orb. {time}s left — dopamine reset mode.</div>
        <div style={{ fontWeight: 800, marginBottom: 8 }}>Score {score}</div>
        <div
          style={{
            position: 'relative',
            height: 280,
            borderRadius: 18,
            background: 'radial-gradient(circle at 30% 20%, rgba(168,85,247,0.25), rgba(15,12,28,0.9))',
            border: '1px solid rgba(168,85,247,0.35)',
            overflow: 'hidden',
            cursor: 'crosshair',
          }}
        >
          <motion.button
            type="button"
            whileTap={{ scale: 0.9 }}
            onClick={(e) => {
              e.stopPropagation();
              setScore((s) => s + 3);
              move();
            }}
            style={{
              position: 'absolute',
              left: `${target.x}%`,
              top: `${target.y}%`,
              width: 56,
              height: 56,
              marginLeft: -28,
              marginTop: -28,
              borderRadius: '50%',
              border: 'none',
              cursor: 'pointer',
              background: 'linear-gradient(135deg, #fb923c, #a855f7)',
              boxShadow: '0 0 30px rgba(251,146,60,0.55)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Crosshair size={22} color="#0f172a" />
          </motion.button>
        </div>
      </div>
    </div>
  );
}
