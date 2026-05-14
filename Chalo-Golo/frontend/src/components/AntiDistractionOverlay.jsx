import React from 'react';
import { ShieldAlert, LogOut } from 'lucide-react';
import { useUiStore } from '../stores/uiStore.js';
import { useUserStore } from '../stores/userStore.js';

export default function AntiDistractionOverlay() {
  const open = useUiStore((s) => s.antiOverlay);
  const setAntiOverlay = useUiStore((s) => s.setAntiOverlay);
  const emergencyExitLeft = useUserStore((s) => s.emergencyExitLeft);
  const useEmergencyExit = useUserStore((s) => s.useEmergencyExit);

  if (!open) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        background: 'rgba(2, 6, 23, 0.92)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
      }}
    >
      <div className="cg-glass" style={{ maxWidth: 420, padding: 28, textAlign: 'center' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: 16,
              background: 'linear-gradient(135deg, rgba(168,85,247,0.35), rgba(251,146,60,0.25))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <ShieldAlert size={28} color="#e9d5ff" />
          </div>
        </div>
        <div style={{ fontWeight: 900, fontSize: 20, marginBottom: 8 }}>Focus lock</div>
        <div style={{ fontSize: 14, color: '#94a3b8', lineHeight: 1.6, marginBottom: 20 }}>
          You bounced away from the session. We are not competing with edtech — we are competing with infinite feeds.
          Come back when you are ready to lock in.
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <button
            type="button"
            onClick={() => setAntiOverlay(false)}
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
              useEmergencyExit();
              setAntiOverlay(false);
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
