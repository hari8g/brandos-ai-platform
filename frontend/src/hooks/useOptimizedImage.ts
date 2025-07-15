import { useState, useEffect, useRef } from 'react';

interface UseOptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  threshold?: number;
  rootMargin?: string;
}

interface OptimizedImageResult {
  src: string;
  isLoaded: boolean;
  isLoading: boolean;
  error: string | null;
  ref: React.RefObject<HTMLImageElement>;
}

export const useOptimizedImage = ({
  src,
  alt,
  width,
  height,
  threshold = 0.1,
  rootMargin = '50px'
}: UseOptimizedImageProps): OptimizedImageResult => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isIntersecting, setIsIntersecting] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  // Intersection Observer for lazy loading
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsIntersecting(true);
          observer.disconnect();
        }
      },
      {
        threshold,
        rootMargin,
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [threshold, rootMargin]);

  // Load image when intersecting
  useEffect(() => {
    if (!isIntersecting) return;

    setIsLoading(true);
    setError(null);

    const img = new Image();
    
    img.onload = () => {
      setIsLoaded(true);
      setIsLoading(false);
    };
    
    img.onerror = () => {
      setError('Failed to load image');
      setIsLoading(false);
    };

    // Optimize image URL (in production, this would use actual optimization service)
    let optimizedSrc = src;
    if (width && height) {
      // Placeholder for actual image optimization
      optimizedSrc = src;
    }

    img.src = optimizedSrc;
  }, [isIntersecting, src, width, height]);

  return {
    src: isLoaded ? src : '',
    isLoaded,
    isLoading,
    error,
    ref: imgRef,
  };
};