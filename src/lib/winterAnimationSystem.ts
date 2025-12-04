/**
 * Winter Animation System - Core framework for managing animations and effects
 * with performance monitoring and accessibility support
 */

import { deviceCapabilities } from './deviceCapabilities';
import { performanceMonitor } from './performanceMonitor';

export interface AnimationConfig {
  duration?: number;
  easing?: string;
  delay?: number;
  iterations?: number;
  direction?: 'normal' | 'reverse' | 'alternate' | 'alternate-reverse';
  fillMode?: 'none' | 'forwards' | 'backwards' | 'both';
  reducedMotion?: boolean;
  performanceMode?: 'high' | 'medium' | 'low';
}

export interface AnimationResult {
  animation: Animation | null;
  promise: Promise<void>;
  cancel: () => void;
}

export class WinterAnimationSystem {
  private static instance: WinterAnimationSystem;
  private activeAnimations = new Map<string, AnimationResult>();

  static getInstance(): WinterAnimationSystem {
    if (!WinterAnimationSystem.instance) {
      WinterAnimationSystem.instance = new WinterAnimationSystem();
    }
    return WinterAnimationSystem.instance;
  }

  constructor() {
    // Listen for performance adjustments
    window.addEventListener('winter-performance-adjustment', (event: any) => {
      this.handlePerformanceAdjustment(event.detail.newTier);
    });

    // Start performance monitoring
    performanceMonitor.startMonitoring();
  }

  // Core animation methods
  async fadeIn(
    element: HTMLElement,
    config: AnimationConfig = {}
  ): Promise<AnimationResult> {
    return this.animateElement(element, {
      opacity: [0, 1],
      transform: ['translateY(20px)', 'translateY(0)']
    }, {
      duration: config.duration || 400,
      easing: config.easing || 'cubic-bezier(0.4, 0, 0.2, 1)',
      ...config
    });
  }

  async slideIn(
    element: HTMLElement,
    direction: 'left' | 'right' | 'up' | 'down' = 'up',
    config: AnimationConfig = {}
  ): Promise<AnimationResult> {
    const transforms = {
      left: ['translateX(-100%)', 'translateX(0)'],
      right: ['translateX(100%)', 'translateX(0)'],
      up: ['translateY(100%)', 'translateY(0)'],
      down: ['translateY(-100%)', 'translateY(0)']
    };

    return this.animateElement(element, {
      transform: transforms[direction],
      opacity: [0, 1]
    }, {
      duration: config.duration || 500,
      easing: config.easing || 'cubic-bezier(0.4, 0, 0.2, 1)',
      ...config
    });
  }

  async sparkle(
    element: HTMLElement,
    intensity: number = 1,
    config: AnimationConfig = {}
  ): Promise<AnimationResult> {
    const scale = 1 + (intensity * 0.1);
    const glowIntensity = intensity * 0.5;

    return this.animateElement(element, {
      transform: [`scale(1)`, `scale(${scale})`, `scale(1)`],
      filter: [
        'brightness(1)',
        `brightness(${1 + glowIntensity})`,
        'brightness(1)'
      ]
    }, {
      duration: config.duration || 600,
      easing: config.easing || 'cubic-bezier(0.4, 0, 0.6, 1)',
      iterations: config.iterations || 1,
      ...config
    });
  }

  async gentleFloat(
    element: HTMLElement,
    config: AnimationConfig = {}
  ): Promise<AnimationResult> {
    return this.animateElement(element, {
      transform: ['translateY(0)', 'translateY(-5px)', 'translateY(0)']
    }, {
      duration: config.duration || 3000,
      easing: config.easing || 'ease-in-out',
      iterations: config.iterations || Infinity,
      ...config
    });
  }

  async celebration(
    element: HTMLElement,
    config: AnimationConfig = {}
  ): Promise<AnimationResult> {
    return this.animateElement(element, {
      transform: [
        'scale(1) rotate(0deg)',
        'scale(1.1) rotate(5deg)',
        'scale(1.05) rotate(-3deg)',
        'scale(1) rotate(0deg)'
      ]
    }, {
      duration: config.duration || 800,
      easing: config.easing || 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      ...config
    });
  }

  // Core animation engine
  private async animateElement(
    element: HTMLElement,
    keyframes: Keyframe[] | PropertyIndexedKeyframes,
    config: AnimationConfig
  ): Promise<AnimationResult> {
    // Check if animations are disabled
    if (this.shouldSkipAnimation(config)) {
      return {
        animation: null,
        promise: Promise.resolve(),
        cancel: () => {}
      };
    }

    // Adjust config based on performance
    const adjustedConfig = this.adjustConfigForPerformance(config);

    // Create animation ID for tracking
    const animationId = `winter-anim-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;

    // Create promise for animation completion
    let resolvePromise: () => void;
    const promise = new Promise<void>((resolve) => {
      resolvePromise = resolve;
    });

    // Create the animation
    const animation = element.animate(keyframes, adjustedConfig);

    // Track the animation
    const result: AnimationResult = {
      animation,
      promise,
      cancel: () => {
        animation.cancel();
        this.activeAnimations.delete(animationId);
      }
    };

    this.activeAnimations.set(animationId, result);

    // Handle animation completion
    animation.addEventListener('finish', () => {
      this.activeAnimations.delete(animationId);
      resolvePromise();
    });

    animation.addEventListener('cancel', () => {
      this.activeAnimations.delete(animationId);
    });

    return result;
  }

  // Utility methods
  private shouldSkipAnimation(config: AnimationConfig): boolean {
    // Respect reduced motion preference
    if (WinterAnimationSystem.respectReducedMotion()) {
      return true;
    }

    // Skip if performance mode is minimal
    if (config.performanceMode === 'low' && deviceCapabilities.getPerformanceTier() === 'minimal') {
      return true;
    }

    return false;
  }

  private adjustConfigForPerformance(config: AnimationConfig): AnimationConfig {
    const tier = deviceCapabilities.getPerformanceTier();
    const adjustedConfig = { ...config };

    // Adjust duration based on performance tier
    if (tier === 'low' || tier === 'minimal') {
      adjustedConfig.duration = (config.duration || 400) * 0.7; // Faster on low-end devices
    } else if (tier === 'high') {
      adjustedConfig.duration = (config.duration || 400) * 1.2; // Smoother on high-end devices
    }

    // Reduce iterations on low performance
    if (tier === 'low' && config.iterations === Infinity) {
      adjustedConfig.iterations = 3; // Limit infinite animations
    }

    return adjustedConfig;
  }

  private handlePerformanceAdjustment(newTier: string): void {
    // Cancel heavy animations if performance degrades
    if (newTier === 'low' || newTier === 'minimal') {
      this.cancelHeavyAnimations();
    }
  }

  private cancelHeavyAnimations(): void {
    // Cancel animations that might be causing performance issues
    for (const [id, result] of this.activeAnimations) {
      if (id.includes('particle') || id.includes('complex')) {
        result.cancel();
      }
    }
  }

  // Public API methods
  cancelAllAnimations(): void {
    for (const result of this.activeAnimations.values()) {
      result.cancel();
    }
    this.activeAnimations.clear();
  }

  getActiveAnimationCount(): number {
    return this.activeAnimations.size;
  }

  // Batch animation utilities
  async animateSequence(
    animations: Array<{ element: HTMLElement; keyframes: Keyframe[]; config: AnimationConfig }>
  ): Promise<AnimationResult[]> {
    const results: AnimationResult[] = [];
    const staggerDelay = 100; // ms between animations

    for (let i = 0; i < animations.length; i++) {
      const { element, keyframes, config } = animations[i];
      const delayedConfig = {
        ...config,
        delay: (config.delay || 0) + (i * staggerDelay)
      };

      const result = await this.animateElement(element, keyframes, delayedConfig);
      results.push(result);
    }

    return results;
  }

  // Accessibility helpers
  static respectReducedMotion(): boolean {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  static getAnimationPreferences(): {
    duration: number;
    easing: string;
    enabled: boolean;
  } {
    const tier = deviceCapabilities.getPerformanceTier();

    return {
      duration: tier === 'high' ? 400 : tier === 'medium' ? 300 : 200,
      easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
      enabled: tier !== 'minimal'
    };
  }
}

// Export singleton instance
export const winterAnimationSystem = WinterAnimationSystem.getInstance();