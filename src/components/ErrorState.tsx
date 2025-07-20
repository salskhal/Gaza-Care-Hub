import React from 'react';
import { AlertTriangle, RefreshCw, Heart, Wifi, WifiOff, AlertCircle, XCircle } from 'lucide-react';
import { branding } from '../config';

interface ErrorStateProps {
  title?: string;
  message?: string;
  type?: 'error' | 'warning' | 'network' | 'critical';
  onRetry?: () => void;
  retryLabel?: string;
  showBranding?: boolean;
  className?: string;
  children?: React.ReactNode;
}

/**
 * Enhanced Error State Component
 * 
 * Provides comprehensive error handling with Gaza Care Hub branding,
 * different error types, and clear recovery actions for users.
 */
export const ErrorState: React.FC<ErrorStateProps> = ({
  title,
  message,
  type = 'error',
  onRetry,
  retryLabel = 'Try Again',
  showBranding = false,
  className = '',
  children
}) => {
  const getErrorConfig = () => {
    switch (type) {
      case 'critical':
        return {
          icon: XCircle,
          iconColor: 'text-red-600',
          bgColor: 'from-red-50 to-red-100',
          borderColor: 'border-red-200',
          titleColor: 'text-red-900',
          messageColor: 'text-red-800',
          buttonColor: 'bg-red-600 hover:bg-red-700 focus:ring-red-500',
          defaultTitle: 'Critical System Error',
          defaultMessage: 'A critical error has occurred that requires immediate attention. Please contact system administrator.'
        };
      case 'network':
        return {
          icon: WifiOff,
          iconColor: 'text-orange-600',
          bgColor: 'from-orange-50 to-orange-100',
          borderColor: 'border-orange-200',
          titleColor: 'text-orange-900',
          messageColor: 'text-orange-800',
          buttonColor: 'bg-orange-600 hover:bg-orange-700 focus:ring-orange-500',
          defaultTitle: 'Connection Problem',
          defaultMessage: 'Unable to connect to the server. Please check your internet connection and try again.'
        };
      case 'warning':
        return {
          icon: AlertTriangle,
          iconColor: 'text-amber-600',
          bgColor: 'from-amber-50 to-amber-100',
          borderColor: 'border-amber-200',
          titleColor: 'text-amber-900',
          messageColor: 'text-amber-800',
          buttonColor: 'bg-amber-600 hover:bg-amber-700 focus:ring-amber-500',
          defaultTitle: 'Warning',
          defaultMessage: 'Something needs your attention. Please review and take appropriate action.'
        };
      default: // error
        return {
          icon: AlertCircle,
          iconColor: 'text-red-600',
          bgColor: 'from-red-50 to-red-100',
          borderColor: 'border-red-200',
          titleColor: 'text-red-900',
          messageColor: 'text-red-800',
          buttonColor: 'bg-red-600 hover:bg-red-700 focus:ring-red-500',
          defaultTitle: 'Something went wrong',
          defaultMessage: 'An unexpected error occurred. Please try again or contact support if the problem persists.'
        };
    }
  };

  const config = getErrorConfig();
  const Icon = config.icon;

  return (
    <div className={`bg-gradient-to-br ${config.bgColor} border-2 ${config.borderColor} rounded-2xl shadow-lg p-6 sm:p-8 gaza-smooth-entrance ${className}`}>
      {showBranding && (
        <div className="flex items-center justify-center gap-3 mb-6 gaza-elegant-slide">
          <div className="bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl p-2 shadow-lg gaza-subtle-glow">
            <Heart className="h-6 w-6 text-white gaza-heartbeat" />
          </div>
          <div className="text-center">
            <h1 className="text-lg font-bold text-gray-900 gaza-text-gradient">{branding.name}</h1>
            <p className="text-sm text-teal-600 font-medium gaza-text-shadow">{branding.tagline}</p>
          </div>
        </div>
      )}

      <div className="flex items-start gap-4 gaza-gentle-bounce">
        <div className={`p-3 rounded-full ${config.bgColor} border ${config.borderColor} flex-shrink-0 gaza-morph-in gaza-hover-glow`}>
          <Icon className={`w-6 h-6 ${config.iconColor} ${type === 'error' || type === 'critical' ? 'gaza-error-shake' : ''}`} />
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className={`text-lg sm:text-xl font-bold ${config.titleColor} mb-2 gaza-elegant-slide gaza-text-shadow`}>
            {title || config.defaultTitle}
          </h3>
          
          <p className={`text-sm sm:text-base ${config.messageColor} mb-4 leading-relaxed gaza-smooth-entrance`} style={{ animationDelay: '0.2s' }}>
            {message || config.defaultMessage}
          </p>

          {children && (
            <div className="mb-4 gaza-smooth-entrance" style={{ animationDelay: '0.3s' }}>
              {children}
            </div>
          )}

          {onRetry && (
            <div className="flex flex-col sm:flex-row gap-3 gaza-elegant-slide" style={{ animationDelay: '0.4s' }}>
              <button
                onClick={onRetry}
                className={`inline-flex items-center justify-center px-4 py-2 ${config.buttonColor} text-white rounded-lg font-medium gaza-button-magnetic gaza-focus-ring min-h-[44px] shadow-sm`}
              >
                <RefreshCw className="w-4 h-4 mr-2 gaza-spin" />
                {retryLabel}
              </button>
              
              <button
                onClick={() => window.location.reload()}
                className="inline-flex items-center justify-center px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg font-medium gaza-micro-interaction gaza-focus-ring min-h-[44px] shadow-sm"
              >
                Reload Page
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Additional context for medical system */}
      {type === 'critical' && (
        <div className="mt-6 p-4 bg-white/50 rounded-lg border border-red-200 animate-fade-in">
          <div className="flex items-start gap-3">
            <Heart className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-red-900 mb-1">Medical System Notice</h4>
              <p className="text-sm text-red-800">
                This error may affect patient care operations. Please ensure all critical patient data is backed up 
                and contact your system administrator immediately.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Network status indicator */}
      {type === 'network' && (
        <div className="mt-6 animate-fade-in">
          <NetworkStatus />
        </div>
      )}
    </div>
  );
};

/**
 * Network Status Component for connection issues
 */
const NetworkStatus: React.FC = () => {
  const [isOnline, setIsOnline] = React.useState(navigator.onLine);

  React.useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <div className="flex items-center justify-center gap-3 p-3 bg-white/50 rounded-lg border border-orange-200">
      <div className="flex items-center gap-2">
        {isOnline ? (
          <Wifi className="w-4 h-4 text-green-600" />
        ) : (
          <WifiOff className="w-4 h-4 text-red-600" />
        )}
        <span className={`text-sm font-medium ${isOnline ? 'text-green-700' : 'text-red-700'}`}>
          {isOnline ? 'Connection Restored' : 'No Internet Connection'}
        </span>
      </div>
      <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500 gaza-pulse' : 'bg-red-500'}`}></div>
    </div>
  );
};

/**
 * Inline Error Component for form fields and smaller errors
 */
interface InlineErrorProps {
  message: string;
  className?: string;
}

export const InlineError: React.FC<InlineErrorProps> = ({ message, className = '' }) => {
  return (
    <div className={`flex items-center gap-2 text-sm text-red-600 animate-slide-down ${className}`}>
      <AlertCircle className="w-4 h-4 flex-shrink-0" />
      <span>{message}</span>
    </div>
  );
};

/**
 * Toast Error Component for temporary error notifications
 */
interface ToastErrorProps {
  message: string;
  onClose?: () => void;
  autoClose?: boolean;
  duration?: number;
}

export const ToastError: React.FC<ToastErrorProps> = ({
  message,
  onClose,
  autoClose = true,
  duration = 5000
}) => {
  React.useEffect(() => {
    if (autoClose && onClose) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [autoClose, onClose, duration]);

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm w-full animate-slide-in-right">
      <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-lg shadow-lg">
        <div className="flex items-start">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <div className="ml-3 flex-1">
            <p className="text-sm text-red-800">{message}</p>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="ml-3 flex-shrink-0 text-red-400 hover:text-red-600 transition-colors"
            >
              <XCircle className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ErrorState;