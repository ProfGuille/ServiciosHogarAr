// frontend/src/components/pwa/PerformanceOptimizer.tsx
import React, { Suspense, lazy } from 'react';

// Lazy loading wrapper component
export function LazyLoadWrapper({ 
  children, 
  fallback = <div className="flex items-center justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div> 
}: { 
  children: React.ReactNode; 
  fallback?: React.ReactNode; 
}) {
  return (
    <Suspense fallback={fallback}>
      {children}
    </Suspense>
  );
}

// Image lazy loading component
interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  placeholder?: string;
  className?: string;
}

export function LazyImage({ src, alt, placeholder, className, ...props }: LazyImageProps) {
  const [isLoaded, setIsLoaded] = React.useState(false);
  const [isInView, setIsInView] = React.useState(false);
  const imgRef = React.useRef<HTMLImageElement>(null);

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={imgRef} className={`relative overflow-hidden ${className}`}>
      {!isLoaded && placeholder && (
        <div 
          className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center"
          style={{ 
            backgroundImage: placeholder ? `url(${placeholder})` : undefined,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        >
          {!placeholder && (
            <div className="w-8 h-8 bg-gray-300 rounded animate-pulse"></div>
          )}
        </div>
      )}
      
      {isInView && (
        <img
          src={src}
          alt={alt}
          onLoad={() => setIsLoaded(true)}
          className={`transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
          loading="lazy"
          {...props}
        />
      )}
    </div>
  );
}

// Critical CSS inlining (for build process)
export function InlineCriticalCSS() {
  React.useEffect(() => {
    // Inline critical CSS for faster loading
    const criticalCSS = `
      /* Critical CSS for above-the-fold content */
      .critical-nav {
        position: sticky;
        top: 0;
        z-index: 50;
        background: rgba(255, 255, 255, 0.95);
        backdrop-filter: blur(10px);
      }
      
      .critical-hero {
        min-height: 60vh;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      
      .critical-loading {
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: 200px;
      }
      
      /* Critical responsive utilities */
      @media (max-width: 640px) {
        .critical-hero {
          min-height: 50vh;
          padding: 1rem;
        }
      }
    `;

    const style = document.createElement('style');
    style.textContent = criticalCSS;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return null;
}

// Preloader for critical resources
export function ResourcePreloader() {
  React.useEffect(() => {
    // Preload critical images
    const criticalImages = [
      '/icons/icon-192x192.png',
      '/icons/icon-512x512.png',
      '/hero-image.webp'
    ];

    criticalImages.forEach(src => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = src;
      document.head.appendChild(link);
    });

    // Preload critical fonts
    const criticalFonts = [
      '/fonts/inter-var.woff2'
    ];

    criticalFonts.forEach(src => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'font';
      link.type = 'font/woff2';
      link.href = src;
      link.crossOrigin = 'anonymous';
      document.head.appendChild(link);
    });

    // DNS prefetch for external resources
    const dnsPrefetch = [
      'https://fonts.googleapis.com',
      'https://fonts.gstatic.com'
    ];

    dnsPrefetch.forEach(domain => {
      const link = document.createElement('link');
      link.rel = 'dns-prefetch';
      link.href = domain;
      document.head.appendChild(link);
    });

  }, []);

  return null;
}

// Performance monitoring
export function usePerformanceMonitoring() {
  React.useEffect(() => {
    // Monitor Core Web Vitals
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'largest-contentful-paint') {
          console.log('LCP:', entry.startTime);
        }
        
        if (entry.entryType === 'first-input') {
          console.log('FID:', entry.processingStart - entry.startTime);
        }
        
        if (entry.entryType === 'layout-shift') {
          if (!entry.hadRecentInput) {
            console.log('CLS:', entry.value);
          }
        }
      }
    });

    try {
      observer.observe({ entryTypes: ['largest-contentful-paint', 'first-input', 'layout-shift'] });
    } catch (error) {
      console.log('Performance Observer not supported');
    }

    // Monitor bundle loading performance
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    if (navigation) {
      console.log('Page Load Time:', navigation.loadEventEnd - navigation.fetchStart);
      console.log('DOM Content Loaded:', navigation.domContentLoadedEventEnd - navigation.fetchStart);
    }

    return () => observer.disconnect();
  }, []);
}

// Virtual scrolling for large lists
interface VirtualScrollProps {
  items: any[];
  itemHeight: number;
  containerHeight: number;
  renderItem: (item: any, index: number) => React.ReactNode;
}

export function VirtualScroll({ items, itemHeight, containerHeight, renderItem }: VirtualScrollProps) {
  const [scrollTop, setScrollTop] = React.useState(0);
  
  const visibleStart = Math.floor(scrollTop / itemHeight);
  const visibleEnd = Math.min(visibleStart + Math.ceil(containerHeight / itemHeight) + 1, items.length);
  
  const visibleItems = items.slice(visibleStart, visibleEnd);
  const totalHeight = items.length * itemHeight;
  const offsetY = visibleStart * itemHeight;

  return (
    <div 
      style={{ height: containerHeight, overflow: 'auto' }}
      onScroll={(e) => setScrollTop(e.currentTarget.scrollTop)}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div style={{ transform: `translateY(${offsetY}px)` }}>
          {visibleItems.map((item, index) => 
            renderItem(item, visibleStart + index)
          )}
        </div>
      </div>
    </div>
  );
}

// Memory management utility
export function useMemoryManagement() {
  const [memoryInfo, setMemoryInfo] = React.useState<any>(null);

  React.useEffect(() => {
    const checkMemory = () => {
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        setMemoryInfo({
          usedJSHeapSize: Math.round(memory.usedJSHeapSize / 1048576),
          totalJSHeapSize: Math.round(memory.totalJSHeapSize / 1048576),
          jsHeapSizeLimit: Math.round(memory.jsHeapSizeLimit / 1048576)
        });
      }
    };

    checkMemory();
    const interval = setInterval(checkMemory, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const cleanupMemory = React.useCallback(() => {
    // Force garbage collection if available
    if ('gc' in window && typeof (window as any).gc === 'function') {
      (window as any).gc();
    }
    
    // Clear caches if memory usage is high
    if (memoryInfo && memoryInfo.usedJSHeapSize > 100) {
      caches.keys().then(cacheNames => {
        cacheNames.forEach(cacheName => {
          if (cacheName.includes('temp') || cacheName.includes('old')) {
            caches.delete(cacheName);
          }
        });
      });
    }
  }, [memoryInfo]);

  return { memoryInfo, cleanupMemory };
}