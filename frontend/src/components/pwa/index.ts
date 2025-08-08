// frontend/src/components/pwa/index.ts
export { PWAInstallPrompt, usePWAInstall } from './PWAInstallPrompt';
export { PWAUpdateNotification, usePWAUpdate } from './PWAUpdateNotification';
export { MobileOptimizer, useMobileDetection, useSwipeGesture } from './MobileOptimizer';
export { 
  LazyLoadWrapper, 
  LazyImage, 
  InlineCriticalCSS, 
  ResourcePreloader, 
  usePerformanceMonitoring, 
  VirtualScroll, 
  useMemoryManagement 
} from './PerformanceOptimizer';