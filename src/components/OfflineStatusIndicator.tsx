import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, Activity, AlertCircle } from 'lucide-react';

interface OfflineStatusIndicatorProps {
  className?: string;
  variant?: 'compact' | 'detailed' | 'badge';
  showIcon?: boolean;
  showText?: boolean;
}

export const OfflineStatusIndicator: React.FC<OfflineStatusIndicatorProps> = ({ 
  className = '',
  variant = 'compact',
  showIcon = true,
  showText = true
}) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [wasOffline, setWasOffline] = useState(false);
  const [showReconnected, setShowReconnected] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      if (wasOffline) {
        setShowReconnected(true);
        setTimeout(() => setShowReconnected(false), 3000);
      }
      setWasOffline(false);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setWasOffline(true);
      setShowReconnected(false);
    };

    // Add event listeners for network status changes
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Cleanup event listeners on component unmount
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [wasOffline]);

  if (variant === 'badge') {
    return (
      <div 
        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-300 ${
          isOnline 
            ? 'bg-green-100 text-green-800 border border-green-200' 
            : 'bg-red-100 text-red-800 border border-red-200'
        } ${className}`}
        role="status"
        aria-live="polite"
        aria-label={`Network status: ${isOnline ? 'Online' : 'Offline'}`}
      >
        {showIcon && (
          <div className={`w-2 h-2 rounded-full ${
            isOnline ? 'bg-green-500 gaza-pulse' : 'bg-red-500'
          }`} aria-hidden="true" />
        )}
        {showText && (
          <span>
            {showReconnected ? 'Reconnected' : (isOnline ? 'Online' : 'Offline')}
          </span>
        )}
      </div>
    );
  }

  if (variant === 'detailed') {
    return (
      <div 
        className={`flex items-center gap-3 p-3 rounded-lg border transition-all duration-300 animate-fade-in ${
          isOnline 
            ? 'bg-green-50 border-green-200 text-green-800' 
            : 'bg-red-50 border-red-200 text-red-800'
        } ${className}`}
        role="status"
        aria-live="polite"
        aria-label={`Network status: ${isOnline ? 'Online' : 'Offline'}`}
      >
        <div className={`p-2 rounded-full ${
          isOnline ? 'bg-green-100' : 'bg-red-100'
        }`}>
          {showIcon && (
            isOnline ? (
              <Wifi className="w-4 h-4 text-green-600" />
            ) : (
              <WifiOff className="w-4 h-4 text-red-600" />
            )
          )}
        </div>
        
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm">
              {showReconnected ? 'Connection Restored' : (isOnline ? 'Online' : 'Offline Mode')}
            </span>
            {isOnline && (
              <Activity className="w-3 h-3 text-green-600 animate-pulse" />
            )}
          </div>
          <p className="text-xs opacity-75 mt-0.5">
            {isOnline 
              ? 'Gaza Care Hub is connected and syncing data'
              : 'Working offline - data will sync when connection returns'
            }
          </p>
        </div>

        {!isOnline && (
          <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
        )}
      </div>
    );
  }

  // Compact variant (default)
  return (
    <div 
      className={`flex items-center gap-2 transition-all duration-300 ${className}`}
      role="status"
      aria-live="polite"
      aria-label={`Network status: ${isOnline ? 'Online' : 'Offline'}`}
    >
      {showIcon && (
        <div className={`relative ${
          isOnline ? 'text-green-600' : 'text-red-600'
        }`}>
          {isOnline ? (
            <Wifi className="w-4 h-4" />
          ) : (
            <WifiOff className="w-4 h-4" />
          )}
          {isOnline && (
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full gaza-pulse"></div>
          )}
        </div>
      )}
      
      {showText && (
        <span className={`text-sm font-medium transition-colors duration-300 ${
          isOnline ? 'text-green-700' : 'text-red-700'
        }`}>
          {showReconnected ? 'Reconnected!' : (isOnline ? 'Online' : 'Offline')}
        </span>
      )}
      
      <span className="sr-only">
        {isOnline 
          ? 'Gaza Care Hub is online and connected to the internet' 
          : 'Gaza Care Hub is offline but fully functional for patient care'
        }
      </span>
    </div>
  );
};