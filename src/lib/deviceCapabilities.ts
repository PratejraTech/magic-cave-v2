/**
 * Device capability detection and progressive enhancement utilities
 * for Winter Wonderland animations and effects
 */

export interface DeviceCapabilities {
  gpuAcceleration: boolean;
  highRefreshRate: boolean;
  batteryLevel?: number;
  connectionSpeed: 'slow' | 'fast' | 'unknown';
  memoryAvailable?: number;
  screenSize: 'mobile' | 'tablet' | 'desktop';
  touchEnabled: boolean;
  prefersReducedMotion: boolean;
  supportsBackdropFilter: boolean;
  supportsWebGL: boolean;
}

export type PerformanceTier = 'high' | 'medium' | 'low' | 'minimal';

export class DeviceCapabilityDetector {
  private static instance: DeviceCapabilityDetector;
  private capabilities: DeviceCapabilities | null = null;
  private performanceTier: PerformanceTier = 'high';

  static getInstance(): DeviceCapabilityDetector {
    if (!DeviceCapabilityDetector.instance) {
      DeviceCapabilityDetector.instance = new DeviceCapabilityDetector();
    }
    return DeviceCapabilityDetector.instance;
  }

  async detectCapabilities(): Promise<DeviceCapabilities> {
    if (this.capabilities) return this.capabilities;

    const capabilities: DeviceCapabilities = {
      gpuAcceleration: this.detectGPUAcceleration(),
      highRefreshRate: window.devicePixelRatio > 1,
      connectionSpeed: this.detectConnectionSpeed(),
      memoryAvailable: (navigator as any).deviceMemory,
      screenSize: this.detectScreenSize(),
      touchEnabled: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
      prefersReducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
      supportsBackdropFilter: this.detectBackdropFilter(),
      supportsWebGL: this.detectWebGL()
    };

    // Detect battery level if available
    if ('getBattery' in navigator) {
      try {
        const battery = await (navigator as any).getBattery();
        capabilities.batteryLevel = battery.level;
      } catch (error) {
        // Battery API not available or failed
      }
    }

    this.capabilities = capabilities;
    this.performanceTier = this.calculatePerformanceTier(capabilities);

    return capabilities;
  }

  getPerformanceTier(): PerformanceTier {
    return this.performanceTier;
  }

  private detectGPUAcceleration(): boolean {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') as WebGLRenderingContext | null ||
               canvas.getContext('experimental-webgl') as WebGLRenderingContext | null;
    if (!gl) return false;

    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
    if (!debugInfo) return false;

    const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
    return !renderer.includes('Software');
  }

  private detectConnectionSpeed(): 'slow' | 'fast' | 'unknown' {
    const connection = (navigator as any).connection;
    if (!connection) return 'unknown';

    const effectiveType = connection.effectiveType;
    if (effectiveType === 'slow-2g' || effectiveType === '2g') return 'slow';
    if (effectiveType === '3g') return 'slow';
    return 'fast';
  }

  private detectScreenSize(): 'mobile' | 'tablet' | 'desktop' {
    const width = window.innerWidth;
    if (width < 768) return 'mobile';
    if (width < 1024) return 'tablet';
    return 'desktop';
  }

  private detectBackdropFilter(): boolean {
    const testEl = document.createElement('div');
    testEl.style.backdropFilter = 'blur(1px)';
    return testEl.style.backdropFilter !== '';
  }

  private detectWebGL(): boolean {
    try {
      const canvas = document.createElement('canvas');
      return !!(canvas.getContext('webgl') || canvas.getContext('experimental-webgl'));
    } catch (e) {
      return false;
    }
  }

  private calculatePerformanceTier(capabilities: DeviceCapabilities): PerformanceTier {
    // Reduced motion takes precedence
    if (capabilities.prefersReducedMotion) return 'minimal';

    // Battery level considerations
    if (capabilities.batteryLevel !== undefined && capabilities.batteryLevel < 0.2) {
      return 'low';
    }

    // Connection speed
    if (capabilities.connectionSpeed === 'slow') return 'low';

    // Screen size and capabilities
    if (capabilities.screenSize === 'mobile') {
      return capabilities.gpuAcceleration ? 'medium' : 'low';
    }

    // Desktop with good capabilities
    if (capabilities.gpuAcceleration && capabilities.highRefreshRate) {
      return 'high';
    }

    return 'medium';
  }

  // Utility methods for components
  shouldUseParticles(): boolean {
    return this.performanceTier === 'high' || this.performanceTier === 'medium';
  }

  getParticleCount(): number {
    switch (this.performanceTier) {
      case 'high': return 150;
      case 'medium': return 80;
      case 'low': return 30;
      case 'minimal': return 0;
      default: return 50;
    }
  }

  shouldUseBackdropFilter(): boolean {
    return this.capabilities?.supportsBackdropFilter ?? false;
  }

  shouldUseComplexAnimations(): boolean {
    return this.performanceTier === 'high';
  }
}

// Export singleton instance
export const deviceCapabilities = DeviceCapabilityDetector.getInstance();