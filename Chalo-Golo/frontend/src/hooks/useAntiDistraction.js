import { useCallback, useEffect, useRef } from 'react';
import { useUiStore } from '../stores/uiStore.js';
import { useUserStore } from '../stores/userStore.js';
import { audioManager } from '../services/audioManager.js';
import { consumeApprovedNavigationWindow } from '../services/navigationGuard.js';

const WARNING_KEY = 'chalo_golo_warning_count';

function readWarningCount() {
  try {
    return Number(sessionStorage.getItem(WARNING_KEY) || 0);
  } catch {
    return 0;
  }
}

function persistWarningCount(count) {
  try {
    sessionStorage.setItem(WARNING_KEY, String(count));
  } catch {
    // Session persistence is best-effort.
  }
}

export function useAntiDistraction({ enabled = true } = {}) {
  const triggerWarning = useUiStore((s) => s.triggerWarning);
  const setAntiOverlay = useUiStore((s) => s.setAntiOverlay);
  const useEmergencyExit = useUserStore((s) => s.useEmergencyExit);
  const warnings = useRef(readWarningCount());
  const lastIncrementAt = useRef(0);
  const approvedUntil = useRef(0);

  const dismiss = useCallback(() => {
    setAntiOverlay(null);
  }, [setAntiOverlay]);

  const leaveWithEmergency = useCallback(() => {
    useEmergencyExit();
    setAntiOverlay(null);
    warnings.current = 0;
    persistWarningCount(0);
  }, [setAntiOverlay, useEmergencyExit]);

  useEffect(() => {
    if (!enabled) return undefined;

    const isApproved = () => Date.now() < approvedUntil.current || consumeApprovedNavigationWindow();

    const increment = (reason) => {
      if (isApproved()) return;
      const now = Date.now();
      if (now - lastIncrementAt.current < 1400) return;
      lastIncrementAt.current = now;
      warnings.current += 1;
      persistWarningCount(warnings.current);
      audioManager.play('warning', { force: true });
      triggerWarning({ count: warnings.current, reason });
    };

    const onApproved = () => {
      approvedUntil.current = Date.now() + 9000;
    };

    const onVis = () => {
      if (document.visibilityState === 'hidden') increment('visibilitychange');
    };

    const onBlur = () => {
      increment('blur');
    };

    const onBeforeUnload = () => {
      if (isApproved()) return undefined;
      increment('beforeunload');
      return undefined;
    };

    window.addEventListener('chalo:approved-navigation', onApproved);
    document.addEventListener('visibilitychange', onVis);
    window.addEventListener('blur', onBlur);
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => {
      window.removeEventListener('chalo:approved-navigation', onApproved);
      document.removeEventListener('visibilitychange', onVis);
      window.removeEventListener('blur', onBlur);
      window.removeEventListener('beforeunload', onBeforeUnload);
    };
  }, [enabled, triggerWarning]);

  return { dismiss, leaveWithEmergency, warningCount: () => warnings.current };
}
