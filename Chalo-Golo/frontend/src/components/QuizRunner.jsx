import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useQuiz } from '../hooks/useQuiz.js';
import { useQuizStore } from '../stores/quizStore.js';

export default function QuizRunner({ questions, onClose, onFinished }) {
  const reset = useQuizStore((s) => s.reset);
  const { current, index, timeLeft, timerTotal, scorePercent, pickOption, summary } = useQuiz();
  const firedRef = useRef(false);

  useEffect(() => {
    firedRef.current = false;
    reset(questions, 22);
  }, [questions, reset]);

  useEffect(() => {
    if (scorePercent == null || !summary || firedRef.current) return;
    firedRef.current = true;
    onFinished?.({ percent: scorePercent, correct: summary.correct, total: summary.total });
  }, [scorePercent, summary, onFinished]);

  const ringPct = timerTotal ? Math.min(100, (timeLeft / timerTotal) * 100) : 0;

  return (
    <div className="cg-galaxy" style={{ minHeight: '100vh', padding: 24, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="cg-glass" style={{ width: 'min(520px, 100%)', padding: 28 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div style={{ fontWeight: 900, fontSize: 18 }}>Neural checkpoint</div>
          <button type="button" onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', fontWeight: 700 }}>
            Exit
          </button>
        </div>

        {scorePercent == null && current ? (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
              <div style={{ position: 'relative', width: 52, height: 52 }}>
                <svg width="52" height="52" style={{ transform: 'rotate(-90deg)' }}>
                  <circle cx="26" cy="26" r="22" stroke="rgba(148,163,184,0.25)" strokeWidth="6" fill="none" />
                  <circle
                    cx="26"
                    cy="26"
                    r="22"
                    stroke="url(#cgGrad)"
                    strokeWidth="6"
                    fill="none"
                    strokeDasharray={`${(ringPct / 100) * 138} 138`}
                  />
                  <defs>
                    <linearGradient id="cgGrad" x1="0" x2="1">
                      <stop stopColor="#a855f7" />
                      <stop offset="1" stopColor="#fb923c" />
                    </linearGradient>
                  </defs>
                </svg>
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900 }}>
                  {timeLeft}
                </div>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, color: '#94a3b8', fontWeight: 700 }}>Question {index + 1} / {questions.length}</div>
                <div style={{ fontSize: 16, fontWeight: 800, marginTop: 6, lineHeight: 1.4 }}>{current.question}</div>
              </div>
            </div>
            <div style={{ display: 'grid', gap: 10 }}>
              {current.options.map((opt, i) => (
                <motion.button
                  key={opt}
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => pickOption(i)}
                  style={{
                    textAlign: 'left',
                    padding: '14px 16px',
                    borderRadius: 14,
                    border: '1px solid rgba(168,85,247,0.35)',
                    background: 'rgba(15,12,28,0.65)',
                    color: '#e2e8f0',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  {opt}
                </motion.button>
              ))}
            </div>
          </>
        ) : (
          <div style={{ textAlign: 'center', padding: '12px 0' }}>
            <div style={{ fontSize: 42, fontWeight: 900, marginBottom: 8 }}>{scorePercent}%</div>
            <div style={{ color: '#94a3b8', marginBottom: 20 }}>Locked in. XP incoming on close.</div>
            <button
              type="button"
              onClick={onClose}
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
              Claim reward
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
