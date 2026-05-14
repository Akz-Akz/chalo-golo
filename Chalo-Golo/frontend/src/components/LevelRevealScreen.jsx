import React from 'react';
import { motion } from 'framer-motion';
import { Zap } from 'lucide-react';

const COPY = {
  nova: { title: 'NOVA', subtitle: 'Elite focus bandwidth unlocked', color: '#fb923c' },
  blaze: { title: 'BLAZE', subtitle: 'High-signal learner — balanced grind', color: '#22d3ee' },
  spark: { title: 'SPARK', subtitle: 'Sprint-mode — we will build your stamina', color: '#a855f7' },
};

export default function LevelRevealScreen({ level, score, onContinue }) {
  const meta = COPY[level] || COPY.spark;
  return (
    <div className="cg-galaxy" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <motion.div
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 90, damping: 14 }}
        className="cg-glass"
        style={{ maxWidth: 440, width: '100%', padding: 32, textAlign: 'center' }}
      >
        <div style={{ fontSize: 12, letterSpacing: '0.25em', fontWeight: 800, color: '#c4b5fd', marginBottom: 12 }}>CALIBRATION COMPLETE</div>
        <div style={{ fontSize: 14, color: '#94a3b8', marginBottom: 8 }}>Focus score</div>
        <div style={{ fontSize: 48, fontWeight: 900, marginBottom: 16 }}>{score}</div>
        <div style={{ fontSize: 42, fontWeight: 900, color: meta.color, textShadow: `0 0 40px ${meta.color}55`, marginBottom: 8 }}>{meta.title}</div>
        <div style={{ fontSize: 15, color: '#cbd5e1', marginBottom: 24 }}>{meta.subtitle}</div>
        <motion.div animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 2.2 }} style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
          <Zap size={36} color="#fde68a" />
        </motion.div>
        <button
          type="button"
          onClick={onContinue}
          style={{
            width: '100%',
            padding: '14px 16px',
            borderRadius: 14,
            border: 'none',
            cursor: 'pointer',
            fontWeight: 900,
            fontSize: 15,
            background: 'linear-gradient(90deg, #a855f7, #fb923c)',
            color: '#0f172a',
          }}
        >
          Enter the dashboard
        </button>
      </motion.div>
    </div>
  );
}
