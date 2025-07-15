import React from 'react';

// Performance utilities for monitoring and optimization

/**
 * Debounce function to limit function calls
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

/**
 * Throttle function to limit function calls to once per interval
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
 * Performance monitoring hook
 */
export const measurePerformance = (name: string, fn: () => void) => {
  const start = performance.now();
  fn();
  const end = performance.now();
  
  // Only log in development
  if (process.env.NODE_ENV === 'development') {
    console.log(`${name} took ${end - start} milliseconds`);
  }
};

/**
 * Lazy component loader with preloading
 */
export const createLazyComponent = <T extends React.ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>,
  preload = false
) => {
  const LazyComponent = React.lazy(importFunc);
  
  if (preload) {
    // Preload the component
    importFunc();
  }
  
  return LazyComponent;
};

/**
 * Image optimization utility
 */
export const optimizeImage = (url: string, width?: number, height?: number, quality = 85) => {
  // For production, implement proper image optimization
  // This is a placeholder that can be extended with actual optimization logic
  return url;
};

/**
 * Check if user is on a slow connection
 */
export const isSlowConnection = (): boolean => {
  if ('connection' in navigator) {
    const connection = (navigator as any).connection;
    return connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g';
  }
  return false;
};

/**
 * Preload critical resources
 */
export const preloadResource = (url: string, as: string = 'script') => {
  const link = document.createElement('link');
  link.rel = 'preload';
  link.href = url;
  link.as = as;
  document.head.appendChild(link);
};

/**
 * Remove console logs in production
 */
export const logger = {
  log: process.env.NODE_ENV === 'development' ? console.log : () => {},
  error: process.env.NODE_ENV === 'development' ? console.error : () => {},
  warn: process.env.NODE_ENV === 'development' ? console.warn : () => {},
};