import { useState, useEffect } from 'react';

export interface CountdownState {
  hours: number;
  minutes: number;
  seconds: number;
  timeRemaining: number;
  isUrgent: boolean;
  isCritical: boolean;
  shouldFlash: boolean;
  isTimeUp: boolean;
}

export const useCountdownTimer = () => {
  const [state, setState] = useState<CountdownState>({
    hours: 0,
    minutes: 0,
    seconds: 0,
    timeRemaining: 0,
    isUrgent: false,
    isCritical: false,
    shouldFlash: false,
    isTimeUp: false,
  });

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const midnight = new Date();
      midnight.setHours(23, 59, 59, 999);
      
      // If we're past midnight, set to next day's midnight
      if (now > midnight) {
        midnight.setDate(midnight.getDate() + 1);
        midnight.setHours(23, 59, 59, 999);
      }

      const timeRemaining = midnight.getTime() - now.getTime();
      
      if (timeRemaining <= 0) {
        setState({
          hours: 0,
          minutes: 0,
          seconds: 0,
          timeRemaining: 0,
          isUrgent: false,
          isCritical: false,
          shouldFlash: false,
          isTimeUp: true,
        });
        return;
      }

      const hours = Math.floor(timeRemaining / (1000 * 60 * 60));
      const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((timeRemaining % (1000 * 60)) / 1000);
      
      const isUrgent = hours < 2; // Less than 2 hours
      const isCritical = minutes < 30 && hours === 0; // Less than 30 minutes
      const shouldFlash = minutes < 5 && hours === 0; // Less than 5 minutes

      setState({
        hours,
        minutes,
        seconds,
        timeRemaining,
        isUrgent,
        isCritical,
        shouldFlash,
        isTimeUp: false,
      });
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatTime = () => {
    const { hours, minutes, seconds, isTimeUp } = state;
    
    if (isTimeUp) {
      return "TIME'S UP!";
    }
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${seconds}s`;
    }
    
    return `${minutes}m ${seconds}s`;
  };

  const getColorClass = () => {
    if (state.isTimeUp) return 'text-destructive';
    if (state.isCritical) return 'text-destructive';
    if (state.isUrgent) return 'text-warning';
    return 'text-muted-foreground';
  };

  return {
    ...state,
    formatTime,
    getColorClass,
  };
};