import { useCountdownTimer } from '@/hooks/use-countdown-timer';
import { Clock } from 'lucide-react';

export const CountdownTimer = () => {
  const { formatTime, getColorClass, shouldFlash, isTimeUp, isCritical, isUrgent } = useCountdownTimer();

  const getContainerClass = () => {
    if (isTimeUp) return 'countdown-urgent animate-pulse';
    if (isCritical) return 'countdown-urgent';
    if (isUrgent) return 'bg-warning/10 border-l-4 border-warning p-4 rounded-xl backdrop-blur-sm';
    return 'bg-secondary/50 border-l-4 border-border p-4 rounded-xl backdrop-blur-sm';
  };

  const getMessage = () => {
    if (isTimeUp) return 'Meditation time has passed - Start fresh tomorrow! 🌅';
    if (isCritical) return 'Final moments! Claim your karma now! ⚡';
    if (isUrgent) return 'Time is running out - Claim your karma soon! ⏰';
    return 'Claim your karma before midnight meditation 🧘‍♂️';
  };

  return (
    <div className={getContainerClass()}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className={`w-4 h-4 ${getColorClass()} ${shouldFlash ? 'animate-pulse' : ''}`} />
          <span className={`font-medium ${getColorClass()}`}>
            {getMessage()}
          </span>
        </div>
        <div 
          className={`font-bold text-lg ${getColorClass()} ${shouldFlash ? 'animate-pulse' : ''}`}
          role="timer"
          aria-live="polite"
        >
          {formatTime()}
        </div>
      </div>
    </div>
  );
};