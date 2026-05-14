import { useCallback, useEffect, useRef } from 'react';
import { useUiStore } from '../stores/uiStore.js';
import { useUserStore } from '../stores/userStore.js';

export function useAntiDistraction({ enabled = true } = {}) {
  const setAntiOverlay = useUiStore((s) => s.setAntiOverlay);
  const useEmergencyExit = useUserStore((s) => s.useEmergencyExit);
  const warnings = useRef(0);

  const dismiss = useCallback(() => {
    setAntiOverlay(false);
  }, [setAntiOverlay]);

  const leaveWithEmergency = useCallback(() => {
    useEmergencyExit();
    setAntiOverlay(false);
    warnings.current = 0;
  }, [setAntiOverlay, useEmergencyExit]);

  useEffect(() => {
    if (!enabled) return undefined;

    const onVis = () => {
      if (document.visibilityState === 'hidden') {
        warnings.current += 1;
        if (warnings.current >= 2) setAntiOverlay(true);
      }
    };
    const onBlur = () => {
      warnings.current += 1;
      if (warnings.current >= 3) setAntiOverlay(true);
    };

    document.addEventListener('visibilitychange', onVis);
    window.addEventListener('blur', onBlur);
    return () => {
      document.removeEventListener('visibilitychange', onVis);
      window.removeEventListener('blur', onBlur);
    };
  }, [enabled, setAntiOverlay]);

  return { dismiss, leaveWithEmergency, warningCount: () => warnings.current };
}
