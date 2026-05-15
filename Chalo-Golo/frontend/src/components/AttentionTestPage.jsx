import React, { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Brain, Target } from 'lucide-react';
import { useAttention } from '../hooks/useAttention.js';

const MAX_ROUNDS = 4;

export default function AttentionTestPage({ onComplete, onBack }) {
  const {
    round,
    phase,
    sequence,
    playerIndex,
    score,
    flashIndex,
    colors,
    startRound,
    resetGame,
    submitColor,
    hitTrap,
    advanceRound,
    finalLevel,
    decoyMode,
  } = useAttention();

  const [started, setStarted] = useState(false);

  useEffect(() => {
    resetGame();
    setStarted(false);
  }, [resetGame]);

  const begin = () => {
    setStarted(true);
    startRound();
  };

  const skipCalibration = () => {
    onComplete?.({ score: 70, level: 'blaze' });
  };

  const continueRound = useCallback(() => {
    if (round >= MAX_ROUNDS) {
      onComplete?.({ score, level: finalLevel });
      return;
    }
    advanceRound();
    setTimeout(() => startRound(), 200);
  }, [advanceRound, finalLevel, onComplete, round, score, startRound]);

  return (
    <div className="cg-galaxy" style={{ minHeight: '100vh', padding: 24 }}>
      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <button
            type="button"
            onClick={onBack}
            style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', fontWeight: 700 }}
          >
            ← Back
          </button>
          <button
            type="button"
            onClick={skipCalibration}
            style={{ background: 'rgba(15,23,42,0.72)', border: '1px solid rgba(148,163,184,0.25)', color: '#cbd5e1', cursor: 'pointer', fontWeight: 800, borderRadius: 999, padding: '8px 12px' }}
          >
            Skip calibration
          </button>
          <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: '0.12em', color: '#c4b5fd' }}>ATTENTION PROTOCOL</div>
        </div>

        <div className="cg-glass" style={{ padding: 28, marginBottom: 20 }}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 12 }}>
            <div style={{ width: 44, height: 44, borderRadius: 14, background: 'rgba(168,85,247,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Brain size={22} color="#e9d5ff" />
            </div>
            <div>
              <div style={{ fontWeight: 900, fontSize: 20 }}>Simon Pulse</div>
              <div style={{ fontSize: 13, color: '#94a3b8' }}>Watch the short sequence, then mirror it. Four quick rounds calibrate your pace.</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', fontSize: 13, color: '#cbd5e1' }}>
            <span>Round {round} / {MAX_ROUNDS}</span>
            <span>Score {score}</span>
            <span>Progress {playerIndex}/{sequence.length || '—'}</span>
          </div>
        </div>

        {!started ? (
          <div className="cg-glass" style={{ padding: 32, textAlign: 'center' }}>
            <Target size={32} color="#fde68a" style={{ marginBottom: 12 }} />
            <div style={{ fontWeight: 900, fontSize: 18, marginBottom: 8 }}>Ready to measure your focus reflexes?</div>
            <div style={{ color: '#94a3b8', marginBottom: 20, fontSize: 14 }}>This powers adaptive pacing — now just four quick, beginner-friendly rounds.</div>
            <button
              type="button"
              onClick={begin}
              style={{
                padding: '14px 22px',
                borderRadius: 14,
                border: 'none',
                cursor: 'pointer',
                fontWeight: 900,
                background: 'linear-gradient(90deg, #a855f7, #fb923c)',
                color: '#0f172a',
              }}
            >
              Start calibration
            </button>
            <button
              type="button"
              onClick={skipCalibration}
              style={{
                marginLeft: 10,
                padding: '14px 18px',
                borderRadius: 14,
                border: '1px solid rgba(148,163,184,0.28)',
                cursor: 'pointer',
                fontWeight: 800,
                background: 'rgba(15,23,42,0.72)',
                color: '#cbd5e1',
              }}
            >
              Skip for now
            </button>
          </div>
        ) : (
          <div className="cg-glass" style={{ padding: 28 }}>
            <div style={{ minHeight: 120, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
              {phase === 'show' && flashIndex >= 0 && sequence[flashIndex] ? (
                <motion.div
                  key={`${flashIndex}-${sequence[flashIndex].id}`}
                  initial={{ scale: 0.6, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ opacity: 0 }}
                  style={{
                    width: 120,
                    height: 120,
                    borderRadius: 24,
                    background: sequence[flashIndex].hex,
                    boxShadow: `0 0 60px ${sequence[flashIndex].hex}88`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 36,
                    fontWeight: 900,
                    color: '#0f172a',
                  }}
                >
                  {sequence[flashIndex].shape || '●'}
                </motion.div>
              ) : null}
              {phase === 'input' ? (
                <div style={{ fontSize: 14, color: '#94a3b8', fontWeight: 700 }}>Mirror the pulse — tap the colors in order</div>
              ) : null}
              {phase === 'roundComplete' ? (
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontWeight: 900, fontSize: 18, marginBottom: 12 }}>Round locked</div>
                  <button
                    type="button"
                    onClick={continueRound}
                    style={{
                      padding: '12px 20px',
                      borderRadius: 12,
                      border: 'none',
                      cursor: 'pointer',
                      fontWeight: 900,
                      background: 'linear-gradient(90deg, #a855f7, #fb923c)',
                      color: '#0f172a',
                    }}
                  >
                    {round >= MAX_ROUNDS ? 'Finish & reveal tier' : 'Next round'}
                  </button>
                </div>
              ) : null}
            </div>

            {phase === 'input' ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14, alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
                  {colors.map((c) => (
                    <motion.button
                      key={c.id}
                      type="button"
                      whileTap={{ scale: 0.95 }}
                      onClick={() => submitColor(c.id)}
                      style={{
                        width: 96,
                        height: 96,
                        borderRadius: 20,
                        border: '2px solid rgba(255,255,255,0.2)',
                        background: c.hex,
                        cursor: 'pointer',
                        boxShadow: `0 0 30px ${c.hex}66`,
                      }}
                      aria-label={c.label}
                    />
                  ))}
                </div>
                {decoyMode ? (
                  <button
                    type="button"
                    onClick={() => {
                      hitTrap();
                    }}
                    style={{
                      padding: '10px 16px',
                      borderRadius: 999,
                      border: '1px dashed rgba(248,113,113,0.6)',
                      background: 'rgba(127,29,29,0.25)',
                      color: '#fecaca',
                      cursor: 'pointer',
                      fontWeight: 800,
                      fontSize: 12,
                    }}
                  >
                    Do NOT tap — TikTok bait
                  </button>
                ) : null}
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}
