export const triggerHaptic = (type = 'light') => {
  if (typeof window === 'undefined' || !('vibrate' in navigator)) return;
  try {
    switch (type) {
      case 'selection':
        navigator.vibrate(8);
        break;
      case 'light':
        navigator.vibrate(15);
        break;
      case 'medium':
        navigator.vibrate(30);
        break;
      case 'heavy':
        navigator.vibrate([40, 20, 40]);
        break;
      case 'success':
        navigator.vibrate([20, 50, 40, 50, 60]);
        break;
      case 'error':
        navigator.vibrate([60, 40, 60, 40, 80]);
        break;
      default:
        navigator.vibrate(12);
    }
  } catch {
    // Vibration ignored if device policy restricts it
  }
};
