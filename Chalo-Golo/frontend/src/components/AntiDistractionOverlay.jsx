import React from 'react';
import { ShieldAlert, LogOut } from 'lucide-react';
import { useUiStore } from '../stores/uiStore.js';
import { useUserStore } from '../stores/userStore.js';
import { WARNING_IMAGES } from '../services/assets.js';

const warningCopy = {
  1: {
    title: 'Focus lock',
    body: 'You bounced away from the session. We are not competing with edtech, we are competing with infinite feeds. Come back when you are ready to lock in.',
  },
  2: {
    title: 'Warning 2',
    body: 'yakkeyy?? 😡 💢',
    image: WARNING_IMAGES[2],
  },
  3: {
    title: 'Focus breach',
    body: 'Jeevandhalli Dhod manushya agbekandre, chilrey kelsa madodu budbeku',
    image: WARNING_IMAGES[3],
  },
};

export default function AntiDistractionOverlay() {
  const overlay = useUiStore((s) => s.antiOverlay);
  const setAntiOverlay = useUiStore((s) => s.setAntiOverlay);
  const emergencyExitLeft = useUserStore((s) => s.emergencyExitLeft);
  const spendEmergencyExit = useUserStore((s) => s.useEmergencyExit);

  if (!overlay) return null;
  const count = Math.max(1, Math.min(3, overlay.count || 1));
  const copy = warningCopy[count] || warningCopy[3];

  return (
    <div
      className="cg-warning-overlay"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        background: 'radial-gradient(circle at 50% 20%, rgba(239,68,68,0.24), transparent 34%), rgba(2, 6, 23, 0.94)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
      }}
    >
      <div className="cg-glass cg-warning-card" style={{ maxWidth: 460, padding: 28, textAlign: 'center' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: 16,
              background: 'linear-gradient(135deg, rgba(239,68,68,0.45), rgba(236,72,153,0.25))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 34px rgba(239,68,68,0.45)',
            }}
          >
            <ShieldAlert size={28} color="#e9d5ff" />
          </div>
        </div>
        {copy.image ? (
          <img
            src={copy.image}
            alt=""
            style={{
              width: 'min(260px, 72vw)',
              maxHeight: 220,
              objectFit: 'contain',
              borderRadius: 18,
              marginBottom: 14,
              filter: 'drop-shadow(0 0 26px rgba(239,68,68,0.55))',
            }}
          />
        ) : null}
        <div className="cg-glitch-title" style={{ fontWeight: 900, fontSize: count >= 2 ? 24 : 20, marginBottom: 8 }}>{copy.title}</div>
        <div style={{ fontSize: 14, color: '#94a3b8', lineHeight: 1.6, marginBottom: 20 }}>
          {copy.body}
        </div>
        <div style={{ fontSize: 12, color: '#fecaca', fontWeight: 800, marginBottom: 16 }}>
          Warning {overlay.count || 1} / 3
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <button
            type="button"
            onClick={() => setAntiOverlay(null)}
            style={{
              padding: '12px 16px',
              borderRadius: 12,
              border: 'none',
              cursor: 'pointer',
              fontWeight: 800,
              background: 'linear-gradient(90deg, #a855f7, #fb923c)',
              color: '#0f172a',
            }}
          >
            I am back — resume
          </button>
          <button
            type="button"
            onClick={() => {
              if (emergencyExitLeft <= 0) return;
              spendEmergencyExit();
              setAntiOverlay(null);
            }}
            disabled={emergencyExitLeft <= 0}
            style={{
              padding: '10px 16px',
              borderRadius: 12,
              border: '1px solid rgba(148,163,184,0.35)',
              cursor: emergencyExitLeft <= 0 ? 'not-allowed' : 'pointer',
              fontWeight: 700,
              background: 'transparent',
              color: '#e2e8f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              opacity: emergencyExitLeft <= 0 ? 0.45 : 1,
            }}
          >
            <LogOut size={16} /> Emergency exit ({emergencyExitLeft} left)
          </button>
        </div>
      </div>
    </div>
  );
}
