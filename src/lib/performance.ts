/**
 * Performance monitoring utilities for low-spec device optimization
 * Tracks key metrics and provides performance insights
 */



interface PerformanceEntry {
  name: string;
  startTime: number;
  duration: number;
  type: 'interaction' | 'render' | 'load' | 'custom';
}

class PerformanceMonitor {
  private metrics: PerformanceEntry[] = [];
  private observers: PerformanceObserver[] = [];
  private isEnabled: boolean = true;

  constructor() {
    this.initializeObservers();
  }

  /**
   * Initialize performance observers for automatic monitoring
   */
  private initializeObservers(): void {
    if (typeof window === 'undefined' || !window.PerformanceObserver) {
      this.isEnabled = false;
      return;
    }

    try {
      // Monitor user interactions
      const interactionObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'event') {
            this.recordMetric({
              name: `interaction-${entry.name}`,
              startTime: entry.startTime,
              duration: entry.duration || 0,
              type: 'interaction'
            });
          }
        }
      });

      // Monitor long tasks that might block the main thread
      const longTaskObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.duration > 50) { // Tasks longer than 50ms
            console.warn(`Long task detected: ${entry.duration}ms`);
            this.recordMetric({
              name: 'long-task',
              startTime: entry.startTime,
              duration: entry.duration,
              type: 'render'
            });
          }
        }
      });

      // Start observing
      if ('event' in PerformanceObserver.supportedEntryTypes) {
        interactionObserver.observe({ entryTypes: ['event'] });
        this.observers.push(interactionObserver);
      }

      if ('longtask' in PerformanceObserver.supportedEntryTypes) {
        longTaskObserver.observe({ entryTypes: ['longtask'] });
        this.observers.push(longTaskObserver);
      }
    } catch (error) {
      console.warn('Performance monitoring not available:', error);
      this.isEnabled = false;
    }
  }

  /**
   * Record a custom performance metric
   */
  recordMetric(entry: PerformanceEntry): void {
    if (!this.isEnabled) return;

    this.metrics.push(entry);

    // Keep only last 100 entries to prevent memory issues
    if (this.metrics.length > 100) {
      this.metrics = this.metrics.slice(-100);
    }
  }

  /**
   * Measure form interaction performance
   */
  measureFormInteraction<T>(
    formName: string,
    operation: () => Promise<T> | T
  ): Promise<T> {
    if (!this.isEnabled) {
      return Promise.resolve(operation());
    }

    const startTime = performance.now();
    const startMark = `${formName}-start`;
    const endMark = `${formName}-end`;

    performance.mark(startMark);

    const handleResult = (result: T) => {
      performance.mark(endMark);
      const duration = performance.now() - startTime;

      this.recordMetric({
        name: `form-${formName}`,
        startTime,
        duration,
        type: 'interaction'
      });

      // Warn if form interaction is slow
      if (duration > 100) {
        console.warn(`Slow form interaction detected: ${formName} took ${duration}ms`);
      }

      return result;
    };

    try {
      const result = operation();
      if (result instanceof Promise) {
        return result.then(handleResult);
      } else {
        return Promise.resolve(handleResult(result));
      }
    } catch (error) {
      performance.mark(endMark);
      throw error;
    }
  }

  /**
   * Measure component render performance
   */
  measureRender(componentName: string, renderFn: () => void): void {
    if (!this.isEnabled) {
      renderFn();
      return;
    }

    const startTime = performance.now();
    renderFn();
    const duration = performance.now() - startTime;

    this.recordMetric({
      name: `render-${componentName}`,
      startTime,
      duration,
      type: 'render'
    });

    // Warn if render is slow
    if (duration > 16) { // 60fps = 16.67ms per frame
      console.warn(`Slow render detected: ${componentName} took ${duration}ms`);
    }
  }

  /**
   * Get memory usage information
   */
  getMemoryUsage(): { used: number; total: number; percentage: number } | null {
    if (typeof window === 'undefined' || !('memory' in performance)) {
      return null;
    }

    const memory = (performance as any).memory;
    return {
      used: memory.usedJSHeapSize,
      total: memory.totalJSHeapSize,
      percentage: (memory.usedJSHeapSize / memory.totalJSHeapSize) * 100
    };
  }

  /**
   * Get performance summary
   */
  getPerformanceSummary(): {
    averageInteractionTime: number;
    averageRenderTime: number;
    slowInteractions: PerformanceEntry[];
    memoryUsage: { used: number; total: number; percentage: number } | null;
  } {
    const interactions = this.metrics.filter(m => m.type === 'interaction');
    const renders = this.metrics.filter(m => m.type === 'render');

    const averageInteractionTime = interactions.length > 0
      ? interactions.reduce((sum, entry) => sum + entry.duration, 0) / interactions.length
      : 0;

    const averageRenderTime = renders.length > 0
      ? renders.reduce((sum, entry) => sum + entry.duration, 0) / renders.length
      : 0;

    const slowInteractions = this.metrics.filter(m => m.duration > 100);

    return {
      averageInteractionTime,
      averageRenderTime,
      slowInteractions,
      memoryUsage: this.getMemoryUsage()
    };
  }

  /**
   * Check if device appears to be low-spec based on performance metrics
   */
  isLowSpecDevice(): boolean {
    const summary = this.getPerformanceSummary();
    
    // Consider device low-spec if:
    // - Average interaction time > 200ms
    // - Average render time > 50ms
    // - Memory usage > 80%
    // - Has frequent slow interactions
    
    const hasSlowInteractions = summary.averageInteractionTime > 200;
    const hasSlowRenders = summary.averageRenderTime > 50;
    const hasHighMemoryUsage = summary.memoryUsage && summary.memoryUsage.percentage > 80;
    const hasFrequentSlowInteractions = summary.slowInteractions.length > 5;

    return hasSlowInteractions || hasSlowRenders || hasHighMemoryUsage || hasFrequentSlowInteractions;
  }

  /**
   * Get optimization recommendations for low-spec devices
   */
  getOptimizationRecommendations(): string[] {
    const recommendations: string[] = [];
    const summary = this.getPerformanceSummary();

    if (summary.averageInteractionTime > 200) {
      recommendations.push('Consider debouncing form inputs to reduce interaction overhead');
    }

    if (summary.averageRenderTime > 50) {
      recommendations.push('Consider implementing virtual scrolling for large lists');
    }

    if (summary.memoryUsage && summary.memoryUsage.percentage > 80) {
      recommendations.push('Consider implementing data cleanup strategies');
    }

    if (summary.slowInteractions.length > 5) {
      recommendations.push('Consider breaking down complex operations into smaller chunks');
    }

    return recommendations;
  }

  /**
   * Clean up observers and metrics
   */
  cleanup(): void {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
    this.metrics = [];
  }
}

// Create singleton instance
export const performanceMonitor = new PerformanceMonitor();

/**
 * React hook for performance monitoring
 */
export const usePerformanceMonitoring = () => {
  const measureFormInteraction = <T>(
    formName: string,
    operation: () => Promise<T> | T
  ) => performanceMonitor.measureFormInteraction(formName, operation);

  const measureRender = (componentName: string, renderFn: () => void) =>
    performanceMonitor.measureRender(componentName, renderFn);

  const getPerformanceSummary = () => performanceMonitor.getPerformanceSummary();

  const isLowSpecDevice = () => performanceMonitor.isLowSpecDevice();

  return {
    measureFormInteraction,
    measureRender,
    getPerformanceSummary,
    isLowSpecDevice
  };
};

/**
 * Debounce utility for reducing excessive function calls
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

/**
 * Throttle utility for limiting function call frequency
 */
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

/**
 * Lazy loading utility for components
 */
export const createLazyComponent = <T extends React.ComponentType<unknown>>(
  importFn: () => Promise<{ default: T }>
) => {
  return React.lazy(importFn);
};

// Re-export React for lazy loading
import React from 'react';