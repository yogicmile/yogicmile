import React, { useState, useEffect } from 'react';
import { WifiOff, Wifi } from 'lucide-react';

export const OfflineIndicator: React.FC = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showIndicator, setShowIndicator] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowIndicator(true);
      // Hide success indicator after 3 seconds
      setTimeout(() => setShowIndicator(false), 3000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowIndicator(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!showIndicator && isOnline) return null;

  return (
    <div 
      className={`fixed top-safe z-50 left-1/2 transform -translate-x-1/2 transition-all duration-300 ${
        showIndicator ? 'translate-y-2' : '-translate-y-full'
      }`}
      role="status"
      aria-live="polite"
    >
      <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${
        isOnline 
          ? 'bg-success text-success-foreground' 
          : 'offline-indicator'
      }`}>
        {isOnline ? (
          <>
            <Wifi className="w-4 h-4" />
            <span>Back online</span>
          </>
        ) : (
          <>
            <WifiOff className="w-4 h-4" />
            <span>You're offline</span>
          </>
        )}
      </div>
    </div>
  );
};