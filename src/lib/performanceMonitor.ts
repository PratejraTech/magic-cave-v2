/**
 * Performance monitoring and automatic quality adjustment for Winter Wonderland animations
 */

import { deviceCapabilities } from './deviceCapabilities';

export interface PerformanceMetrics {
  fps: number;
  memoryUsage?: number;
  animationDuration: number;
  particleCount: number;
  lastAdjustment: number;
}

export interface PerformanceIssue {
  type: 'low_fps' | 'high_memory' | 'long_frames';
  severity: 'low' | 'medium' | 'high';
  timestamp: number;
  details: Record<string, any>;
}

export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private frameCount = 0;
  private lastTime = 0;
  private fps = 60;
  private frameTimes: number[] = [];
  private maxFrameHistory = 60; // Track last 60 frames
  private observers: ((metrics: PerformanceMetrics) => void)[] = [];
  private issues: PerformanceIssue[] = [];
  private adjustmentCooldown = 5000; // 5 seconds between adjustments
  private lastAdjustment = 0;

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  startMonitoring(): void {
    this.lastTime = performance.now();
    this.monitorFrame();
  }

  stopMonitoring(): void {
    // Cancel any ongoing monitoring
  }

  private monitorFrame = (): void => {
    const now = performance.now();
    const deltaTime = now - this.lastTime;

    if (deltaTime >= 1000 / 60) { // ~60fps
      this.frameCount++;
      this.frameTimes.push(deltaTime);

      // Keep only recent frames
      if (this.frameTimes.length > this.maxFrameHistory) {
        this.frameTimes.shift();
      }

      // Calculate FPS every second
      if (this.frameCount % 60 === 0) {
        const avgFrameTime = this.frameTimes.reduce((a, b) => a + b, 0) / this.frameTimes.length;
        this.fps = Math.round(1000 / avgFrameTime);

        // Check for performance issues
        this.checkPerformanceIssues();

        // Notify observers
        this.notifyObservers();
      }

      this.lastTime = now;
    }

    // Continue monitoring
    requestAnimationFrame(this.monitorFrame);
  };

  private checkPerformanceIssues(): void {
    const avgFrameTime = this.frameTimes.reduce((a, b) => a + b, 0) / this.frameTimes.length;

    // Low FPS detection
    if (this.fps < 30) {
      this.reportIssue({
        type: 'low_fps',
        severity: this.fps < 15 ? 'high' : 'medium',
        timestamp: Date.now(),
        details: { fps: this.fps, avgFrameTime }
      });
    }

    // Long frame detection (>16.67ms for 60fps)
    if (avgFrameTime > 20) {
      this.reportIssue({
        type: 'long_frames',
        severity: avgFrameTime > 33 ? 'high' : 'medium',
        timestamp: Date.now(),
        details: { avgFrameTime, maxFrameTime: Math.max(...this.frameTimes) }
      });
    }

    // Memory usage (if available)
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      const memoryUsageMB = memory.usedJSHeapSize / 1024 / 1024;

      if (memoryUsageMB > 100) { // Over 100MB
        this.reportIssue({
          type: 'high_memory',
          severity: memoryUsageMB > 200 ? 'high' : 'medium',
          timestamp: Date.now(),
          details: { memoryUsageMB, totalHeapSize: memory.totalJSHeapSize / 1024 / 1024 }
        });
      }
    }
  }

  private reportIssue(issue: PerformanceIssue): void {
    this.issues.push(issue);

    // Keep only recent issues (last 10)
    if (this.issues.length > 10) {
      this.issues.shift();
    }

    // Auto-adjust quality if needed
    if (Date.now() - this.lastAdjustment > this.adjustmentCooldown) {
      this.autoAdjustQuality(issue);
    }
  }

  private autoAdjustQuality(issue: PerformanceIssue): void {
    const currentTier = deviceCapabilities.getPerformanceTier();

    if (issue.severity === 'high') {
      // Force downgrade to lower tier
      switch (currentTier) {
        case 'high':
          this.adjustToTier('medium');
          break;
        case 'medium':
          this.adjustToTier('low');
          break;
        case 'low':
          this.adjustToTier('minimal');
          break;
      }
    } else if (issue.severity === 'medium' && currentTier === 'high') {
      // Gradual downgrade
      this.adjustToTier('medium');
    }

    this.lastAdjustment = Date.now();
  }

  private adjustToTier(tier: 'high' | 'medium' | 'low' | 'minimal'): void {
    // Dispatch custom event for components to listen to
    const event = new CustomEvent('winter-performance-adjustment', {
      detail: { newTier: tier, reason: 'performance_issue' }
    });
    window.dispatchEvent(event);
  }

  getCurrentMetrics(): PerformanceMetrics {
    return {
      fps: this.fps,
      memoryUsage: ('memory' in performance) ?
        (performance as any).memory.usedJSHeapSize / 1024 / 1024 : undefined,
      animationDuration: this.frameTimes.length > 0 ?
        this.frameTimes.reduce((a, b) => a + b, 0) / this.frameTimes.length : 0,
      particleCount: deviceCapabilities.getParticleCount(),
      lastAdjustment: this.lastAdjustment
    };
  }

  getRecentIssues(): PerformanceIssue[] {
    return [...this.issues];
  }

  subscribe(callback: (metrics: PerformanceMetrics) => void): () => void {
    this.observers.push(callback);
    return () => {
      const index = this.observers.indexOf(callback);
      if (index > -1) {
        this.observers.splice(index, 1);
      }
    };
  }

  private notifyObservers(): void {
    const metrics = this.getCurrentMetrics();
    this.observers.forEach(callback => callback(metrics));
  }

  // Utility methods for components
  shouldThrottleAnimations(): boolean {
    return this.fps < 45;
  }

  getRecommendedParticleCount(): number {
    if (this.fps < 30) return Math.max(10, deviceCapabilities.getParticleCount() * 0.3);
    if (this.fps < 45) return Math.max(20, deviceCapabilities.getParticleCount() * 0.6);
    return deviceCapabilities.getParticleCount();
  }
}

// Export singleton instance
export const performanceMonitor = PerformanceMonitor.getInstance();