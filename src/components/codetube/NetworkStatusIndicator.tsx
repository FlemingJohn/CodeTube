'use client';

import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function NetworkStatusIndicator() {
  const [isOnline, setIsOnline] = useState(true);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Check for window to ensure it runs only on the client
    if (typeof window !== 'undefined') {
        setIsOnline(navigator.onLine);
    }
    
    const handleOnline = () => {
        setIsOnline(true);
        // Show the "back online" message and hide after 3 seconds
        setShowBanner(true);
        setTimeout(() => setShowBanner(false), 3000);
    };
    
    const handleOffline = () => {
        setIsOnline(false);
        setShowBanner(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!showBanner) {
    return null;
  }

  return (
    <div
      className={cn(
        'fixed bottom-4 left-1/2 -translate-x-1/2 z-[200] flex items-center gap-3 rounded-full px-4 py-2 text-sm font-medium shadow-lg transition-all animate-in fade-in-0 slide-in-from-bottom-10',
        isOnline
          ? 'bg-green-600 text-white'
          : 'bg-destructive text-destructive-foreground'
      )}
    >
      {isOnline ? (
        <>
          <Wifi className="h-4 w-4" />
          You are back online.
        </>
      ) : (
        <>
          <WifiOff className="h-4 w-4" />
          Working offline. Changes will sync automatically.
        </>
      )}
    </div>
  );
}
