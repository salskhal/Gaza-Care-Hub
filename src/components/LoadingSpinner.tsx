import React from 'react';
import { Heart, Activity, Users, Clock } from 'lucide-react';
import { branding } from '../config';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  message?: string;
  showBranding?: boolean;
  variant?: 'default' | 'medical' | 'minimal';
  className?: string;
}

/**
 * Enhanced Loading Spinner Component
 * 
 * Provides various loading states with Gaza Care Hub branding and medical-themed animations.
 * Optimized for accessibility and visual appeal during data loading operations.
 */
export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  message,
  showBranding = false,
  variant = 'default',
  className = ''
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  const containerSizeClasses = {
    sm: 'p-2',
    md: 'p-4',
    lg: 'p-6',
    xl: 'p-8'
  };

  if (variant === 'minimal') {
    return (
      <div className={`inline-flex items-center justify-center ${containerSizeClasses[size]} ${className}`}>
        <div className={`${sizeClasses[size]} animate-spin`}>
          <div className="w-full h-full border-2 border-teal-200 border-t-teal-600 rounded-full"></div>
        </div>
        {message && (
          <span className="ml-2 text-sm text-gray-600 animate-pulse">
            {message}
          </span>
        )}
      </div>
    );
  }

  if (variant === 'medical') {
    return (
      <div className={`flex flex-col items-center justify-center ${containerSizeClasses[size]} ${className}`}>
        <div className="relative mb-3">
          <div className={`${sizeClasses[size]} animate-spin`}>
            <div className="w-full h-full border-3 border-teal-200 border-t-teal-600 rounded-full"></div>
          </div>
          <Heart className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4 h-4 text-teal-600 gaza-heartbeat" />
        </div>
        {message && (
          <p className="text-sm text-gray-700 text-center animate-pulse">
            {message}
          </p>
        )}
      </div>
    );
  }

  // Default variant with full branding
  return (
    <div className={`flex flex-col items-center justify-center text-center ${containerSizeClasses[size]} ${className}`}>
      {showBranding && (
        <div className="mb-4 gaza-smooth-entrance">
          <div className="flex items-center justify-center gap-3 mb-2">
            <div className="bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl p-2 shadow-lg gaza-float gaza-subtle-glow">
              <Heart className="h-6 w-6 text-white gaza-heartbeat" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 gaza-text-gradient">{branding.name}</h2>
              <p className="text-sm text-teal-600 font-medium gaza-text-shadow">{branding.tagline}</p>
            </div>
          </div>
        </div>
      )}
      
      <div className="relative mb-4 gaza-gentle-bounce">
        <div className={`${sizeClasses[size]} relative`}>
          <div className="w-full h-full border-4 border-teal-200 border-t-teal-600 rounded-full shadow-sm gaza-spin"></div>
          <div className="absolute inset-1 border-2 border-transparent border-r-teal-400 rounded-full gaza-spin-slow"></div>
        </div>
        <Activity className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4 h-4 text-teal-600 gaza-pulse-enhanced" />
      </div>
      
      {message && (
        <div className="gaza-elegant-slide">
          <p className="text-base font-medium text-gray-900 mb-1 gaza-text-shadow">
            {message}
          </p>
          <p className="text-sm text-gray-600">
            {showBranding ? branding.mission : 'Please wait...'}
          </p>
        </div>
      )}
      
      {/* Enhanced animated dots */}
      <div className="gaza-loading-dots mt-4">
        <div></div>
        <div></div>
        <div></div>
      </div>
    </div>
  );
};

/**
 * Skeleton Loading Component for content placeholders
 */
interface SkeletonProps {
  className?: string;
  lines?: number;
  avatar?: boolean;
  card?: boolean;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  lines = 3,
  avatar = false,
  card = false
}) => {
  if (card) {
    return (
      <div className={`bg-white rounded-xl border border-gray-200 p-4 sm:p-6 gaza-smooth-entrance ${className}`}>
        <div className="animate-pulse">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="h-4 bg-gray-200 rounded-lg w-3/4 mb-2 gaza-skeleton-enhanced"></div>
              <div className="h-3 bg-gray-200 rounded-lg w-1/2 gaza-skeleton-enhanced" style={{ animationDelay: '0.1s' }}></div>
            </div>
            <div className="w-16 h-8 bg-gray-200 rounded-full gaza-skeleton-enhanced" style={{ animationDelay: '0.2s' }}></div>
          </div>
          <div className="space-y-2 mb-4">
            {Array.from({ length: lines }).map((_, i) => (
              <div key={i} className={`h-3 bg-gray-200 rounded-lg gaza-skeleton-enhanced ${
                i === lines - 1 ? 'w-2/3' : 'w-full'
              }`} style={{ animationDelay: `${0.3 + i * 0.1}s` }}></div>
            ))}
          </div>
          <div className="flex justify-between items-center">
            <div className="h-3 bg-gray-200 rounded-lg w-1/4 gaza-skeleton-enhanced" style={{ animationDelay: '0.7s' }}></div>
            <div className="w-8 h-8 bg-gray-200 rounded-lg gaza-skeleton-enhanced" style={{ animationDelay: '0.8s' }}></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`animate-pulse ${className}`}>
      <div className="flex items-start space-x-4">
        {avatar && (
          <div className="w-10 h-10 bg-gray-200 rounded-full gaza-shimmer"></div>
        )}
        <div className="flex-1 space-y-2">
          {Array.from({ length: lines }).map((_, i) => (
            <div key={i} className={`h-4 bg-gray-200 rounded-lg gaza-shimmer ${
              i === lines - 1 ? 'w-2/3' : 'w-full'
            }`}></div>
          ))}
        </div>
      </div>
    </div>
  );
};

/**
 * Page Loading Component for full-page loading states
 */
interface PageLoadingProps {
  message?: string;
  showProgress?: boolean;
  progress?: number;
}

export const PageLoading: React.FC<PageLoadingProps> = ({
  message = 'Loading Gaza Care Hub...',
  showProgress = false,
  progress = 0
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-blue-50 to-teal-100 flex items-center justify-center p-4 gaza-particles">
      <div className="max-w-md w-full">
        <LoadingSpinner
          size="xl"
          message={message}
          showBranding={true}
          className="mb-6"
        />
        
        {showProgress && (
          <div className="w-full bg-gray-200 rounded-full h-2 mb-4 overflow-hidden gaza-elegant-slide">
            <div 
              className="gaza-progress-fill h-2 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${Math.max(5, progress)}%` }}
            ></div>
          </div>
        )}
        
        <div className="text-center gaza-smooth-entrance" style={{ animationDelay: '0.5s' }}>
          <div className="flex items-center justify-center gap-2 text-sm text-gray-600 mb-2 gaza-micro-interaction">
            <Users className="w-4 h-4 gaza-pulse" />
            <span>Preparing patient care system</span>
          </div>
          <div className="flex items-center justify-center gap-2 text-sm text-gray-600 gaza-micro-interaction">
            <Clock className="w-4 h-4 gaza-pulse" style={{ animationDelay: '0.5s' }} />
            <span>Initializing medical protocols</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingSpinner;