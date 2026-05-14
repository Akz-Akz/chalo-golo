import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { useUiStore } from '../stores/uiStore.js';

export default function BadgeRevealModal({ onContinue }) {
  const payload = useUiStore((s) => s.badgePayload);
  const clearBadge = useUiStore((s) => s.clearBadge);
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!payload) {
      setStep(0);
      return undefined;
    }
    setStep(0);
    const t = setTimeout(() => setStep(1), 180);
    return () => clearTimeout(t);
  }, [payload]);

  if (!payload) return null;

  const close = () => {
    clearBadge();
    setStep(0);
    onContinue?.();
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 100000,
          background: 'rgba(0,0,0,0.88)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 24,
        }}
      >
        <motion.div
          initial={{ scale: 0.2, rotate: -40, opacity: 0 }}
          animate={
            step >= 1
              ? { scale: 1, rotate: 0, opacity: 1, boxShadow: '0 0 80px rgba(168,85,247,0.55)' }
              : { scale: 0.2, rotate: -40, opacity: 0 }
          }
          transition={{ type: 'spring', stiffness: 120, damping: 12 }}
          className="cg-glass"
          style={{ width: 320, padding: 28, textAlign: 'center', position: 'relative', overflow: 'hidden' }}
        >
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            style={{
              width: 88,
              height: 88,
              margin: '0 auto 16px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #a855f7, #fb923c)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 40px rgba(251,146,60,0.45)',
            }}
          >
            <Sparkles size={40} color="#0f172a" />
          </motion.div>
          <div style={{ fontSize: 11, letterSpacing: '0.2em', fontWeight: 800, color: '#c4b5fd', marginBottom: 6 }}>BADGE UNLOCKED</div>
          <div style={{ fontSize: 22, fontWeight: 900, marginBottom: 6 }}>{payload.name}</div>
          <div style={{ fontSize: 13, color: '#94a3b8', marginBottom: 16 }}>{payload.label}</div>
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: [1, 1.4, 1], opacity: [0.8, 1, 0] }}
            transition={{ delay: 0.35, duration: 0.8 }}
            style={{
              position: 'absolute',
              inset: -40,
              background: 'radial-gradient(circle, rgba(168,85,247,0.35), transparent 55%)',
              pointerEvents: 'none',
            }}
          />
          <div style={{ fontSize: 14, fontWeight: 800, color: '#fde68a', marginBottom: 16 }}>+{payload.bonusXp ?? 25} XP burst</div>
          <button
            type="button"
            onClick={close}
            style={{
              width: '100%',
              padding: '12px 16px',
              borderRadius: 12,
              border: 'none',
              cursor: 'pointer',
              fontWeight: 900,
              background: 'linear-gradient(90deg, #a855f7, #fb923c)',
              color: '#0f172a',
            }}
          >
            Continue flexing
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
