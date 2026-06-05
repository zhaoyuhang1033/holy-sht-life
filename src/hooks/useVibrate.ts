import { useCallback } from 'react';

export function useVibrate() {
  const vibrate = useCallback((pattern: number | number[]) => {
    if ('vibrate' in navigator) {
      navigator.vibrate(pattern);
    }
  }, []);

  const vibrateLight = useCallback(() => vibrate(50), [vibrate]);
  const vibrateMedium = useCallback(() => vibrate(150), [vibrate]);
  const vibrateHeavy = useCallback(() => vibrate([200, 100, 200]), [vibrate]);

  return {
    vibrate,
    vibrateLight,
    vibrateMedium,
    vibrateHeavy,
  };
}
