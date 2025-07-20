import React, { useState, useEffect } from 'react';
import { CheckCircle, AlertCircle, XCircle, Info, X } from 'lucide-react';

export interface ToastProps {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
  onClose: (id: string) => void;
  action?: {
    label: string;
    onClick: () => void;
  };
}

/**
 * Enhanced Toast Notification Component
 * 
 * Provides beautiful, accessible toast notifications with Gaza Care Hub styling,
 * animations, and support for different notification types.
 */
export const Toast: React.FC<ToastProps> = ({
  id,
  type,
  title,
  message,
  duration = 5000,
  onClose,
  action
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Trigger entrance animation
    const timer = setTimeout(() => setIsVisible(true), 10);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        handleClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      onClose(id);
    }, 300);
  };

  const getToastConfig = () => {
    switch (type) {
      case 'success':
        return {
          icon: CheckCircle,
          iconColor: 'text-green-600',
          bgColor: 'from-green-50 to-green-100',
          borderColor: 'border-green-200',
          titleColor: 'text-green-900',
          messageColor: 'text-green-800',
          progressColor: 'bg-green-500'
        };
      case 'error':
        return {
          icon: XCircle,
          iconColor: 'text-red-600',
          bgColor: 'from-red-50 to-red-100',
          borderColor: 'border-red-200',
          titleColor: 'text-red-900',
          messageColor: 'text-red-800',
          progressColor: 'bg-red-500'
        };
      case 'warning':
        return {
          icon: AlertCircle,
          iconColor: 'text-amber-600',
          bgColor: 'from-amber-50 to-amber-100',
          borderColor: 'border-amber-200',
          titleColor: 'text-amber-900',
          messageColor: 'text-amber-800',
          progressColor: 'bg-amber-500'
        };
      case 'info':
      default:
        return {
          icon: Info,
          iconColor: 'text-blue-600',
          bgColor: 'from-blue-50 to-blue-100',
          borderColor: 'border-blue-200',
          titleColor: 'text-blue-900',
          messageColor: 'text-blue-800',
          progressColor: 'bg-blue-500'
        };
    }
  };

  const config = getToastConfig();
  const Icon = config.icon;

  return (
    <div
      className={`
        relative max-w-sm w-full bg-gradient-to-r ${config.bgColor} 
        border-2 ${config.borderColor} rounded-xl shadow-lg p-4
        transform transition-all duration-300 ease-out
        ${isVisible && !isExiting 
          ? 'translate-x-0 opacity-100 scale-100' 
          : 'translate-x-full opacity-0 scale-95'
        }
        gaza-card-premium gaza-subtle-glow
      `}
      role="alert"
      aria-live="polite"
    >
      {/* Progress bar for auto-dismiss */}
      {duration > 0 && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-white/30 rounded-t-xl overflow-hidden">
          <div 
            className={`h-full ${config.progressColor} transition-all ease-linear`}
            style={{
              width: isExiting ? '100%' : '0%',
              transitionDuration: isExiting ? '0ms' : `${duration}ms`
            }}
          />
        </div>
      )}

      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className={`flex-shrink-0 p-1 rounded-full gaza-gentle-bounce`}>
          <Icon className={`w-5 h-5 ${config.iconColor} ${type === 'success' ? 'gaza-success-bounce' : type === 'error' ? 'gaza-error-shake' : 'gaza-pulse'}`} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h4 className={`text-sm font-semibold ${config.titleColor} mb-1 gaza-elegant-slide gaza-text-shadow`}>
            {title}
          </h4>
          {message && (
            <p className={`text-sm ${config.messageColor} leading-relaxed gaza-smooth-entrance`} style={{ animationDelay: '0.1s' }}>
              {message}
            </p>
          )}
          
          {/* Action button */}
          {action && (
            <button
              onClick={action.onClick}
              className={`mt-2 text-sm font-medium ${config.iconColor} hover:underline focus:outline-none focus:underline gaza-micro-interaction`}
            >
              {action.label}
            </button>
          )}
        </div>

        {/* Close button */}
        <button
          onClick={handleClose}
          className={`flex-shrink-0 p-1 rounded-full ${config.iconColor} hover:bg-white/50 focus:outline-none focus:bg-white/50 gaza-micro-interaction gaza-focus-ring`}
          aria-label="Close notification"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

/**
 * Toast Container Component
 */
interface ToastContainerProps {
  toasts: ToastProps[];
  onClose: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onClose }) => {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-3 max-w-sm w-full pointer-events-none">
      {toasts.map((toast, index) => (
        <div 
          key={toast.id} 
          className="pointer-events-auto animate-fade-in-up"
          style={{ animationDelay: `${index * 100}ms` }}
        >
          <Toast {...toast} onClose={onClose} />
        </div>
      ))}
    </div>
  );
};

/**
 * Toast Hook for easy usage
 */
export const useToast = () => {
  const [toasts, setToasts] = useState<ToastProps[]>([]);

  const addToast = (toast: Omit<ToastProps, 'id' | 'onClose'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast: ToastProps = {
      ...toast,
      id,
      onClose: removeToast
    };
    setToasts(prev => [...prev, newToast]);
    return id;
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const success = (title: string, message?: string, options?: Partial<ToastProps>) => {
    return addToast({ type: 'success', title, message, ...options });
  };

  const error = (title: string, message?: string, options?: Partial<ToastProps>) => {
    return addToast({ type: 'error', title, message, ...options });
  };

  const warning = (title: string, message?: string, options?: Partial<ToastProps>) => {
    return addToast({ type: 'warning', title, message, ...options });
  };

  const info = (title: string, message?: string, options?: Partial<ToastProps>) => {
    return addToast({ type: 'info', title, message, ...options });
  };

  return {
    toasts,
    addToast,
    removeToast,
    success,
    error,
    warning,
    info,
    ToastContainer: () => <ToastContainer toasts={toasts} onClose={removeToast} />
  };
};

export default Toast;