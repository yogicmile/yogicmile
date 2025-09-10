import { useState, useCallback, useEffect } from 'react';

export const useNumberAnimation = (target: number, duration: number = 2000) => {
  const [current, setCurrent] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (target === current) return;

    setIsAnimating(true);
    const startValue = current;
    const difference = target - startValue;
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function for smooth animation
      const easeOutCubic = 1 - Math.pow(1 - progress, 3);
      const newValue = Math.floor(startValue + (difference * easeOutCubic));
      
      setCurrent(newValue);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setCurrent(target);
        setIsAnimating(false);
      }
    };

    requestAnimationFrame(animate);
  }, [target, duration, current]);

  return { current, isAnimating };
};

export const useCelebration = () => {
  const [isVisible, setIsVisible] = useState(false);

  const celebrate = useCallback(() => {
    setIsVisible(true);
    setTimeout(() => setIsVisible(false), 3000);
  }, []);

  return { isVisible, celebrate };
};

export const useHapticFeedback = () => {
  const triggerHaptic = useCallback((type: 'light' | 'medium' | 'heavy' = 'light') => {
    if ('vibrate' in navigator) {
      const patterns = {
        light: [10],
        medium: [20],
        heavy: [30],
      };
      navigator.vibrate(patterns[type]);
    }
  }, []);

  return { triggerHaptic };
};