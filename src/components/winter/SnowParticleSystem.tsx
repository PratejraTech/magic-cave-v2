/**
 * Snow Particle System - Creates realistic falling snow effects
 * with physics-based animation and performance optimization
 */

import React, { useEffect, useRef, useState } from 'react';
import { deviceCapabilities } from '../../lib/deviceCapabilities';
import { performanceMonitor } from '../../lib/performanceMonitor';
import { winterAnimationSystem, WinterAnimationSystem } from '../../lib/winterAnimationSystem';

export interface SnowParticle {
  id: string;
  x: number;
  y: number;
  size: number;
  speed: number;
  wind: number;
  opacity: number;
  rotation: number;
  lifecycle: 'falling' | 'melting' | 'settling';
}

interface SnowParticleSystemProps {
  intensity?: 'light' | 'medium' | 'heavy';
  windEnabled?: boolean;
  interactive?: boolean;
  className?: string;
}

const SnowParticleSystem: React.FC<SnowParticleSystemProps> = ({
  intensity = 'medium',
  windEnabled = true,
  interactive = true,
  className = ''
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [particles, setParticles] = useState<SnowParticle[]>([]);
  const [isActive, setIsActive] = useState(false);
  const animationFrameRef = useRef<number>();
  const lastTimeRef = useRef<number>(0);
  const windOffsetRef = useRef<number>(0);

  // Performance monitoring
  const fpsRef = useRef<number>(60);
  const particleCountRef = useRef<number>(0);

  useEffect(() => {
    // Check if we should enable snow particles
    const shouldEnable = deviceCapabilities.shouldUseParticles() &&
                        !WinterAnimationSystem.respectReducedMotion();

    if (!shouldEnable) {
      setIsActive(false);
      return;
    }

    setIsActive(true);

    // Initialize particles
    initializeParticles();

    // Start animation loop
    startAnimationLoop();

    // Subscribe to performance monitoring
    const unsubscribe = performanceMonitor.subscribe((metrics) => {
      fpsRef.current = metrics.fps;

      // Adjust particle count based on performance
      const recommendedCount = performanceMonitor.getRecommendedParticleCount();
      if (recommendedCount !== particleCountRef.current) {
        adjustParticleCount(recommendedCount);
      }
    });

    return () => {
      unsubscribe();
      stopAnimationLoop();
    };
  }, [intensity]);

  const getParticleCount = (): number => {
    const baseCount = deviceCapabilities.getParticleCount();

    switch (intensity) {
      case 'light': return Math.floor(baseCount * 0.6);
      case 'medium': return baseCount;
      case 'heavy': return Math.floor(baseCount * 1.4);
      default: return baseCount;
    }
  };

  const initializeParticles = (): void => {
    const count = getParticleCount();
    particleCountRef.current = count;

    const newParticles: SnowParticle[] = [];
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    for (let i = 0; i < count; i++) {
      newParticles.push({
        id: `snow-${i}-${Date.now()}`,
        x: Math.random() * viewportWidth,
        y: Math.random() * viewportHeight * -1, // Start above viewport
        size: Math.random() * 3 + 1, // 1-4px
        speed: Math.random() * 0.5 + 0.2, // 0.2-0.7
        wind: windEnabled ? (Math.random() - 0.5) * 0.3 : 0, // -0.15 to 0.15
        opacity: Math.random() * 0.6 + 0.4, // 0.4-1.0
        rotation: Math.random() * 360,
        lifecycle: 'falling'
      });
    }

    setParticles(newParticles);
  };

  const adjustParticleCount = (newCount: number): void => {
    setParticles(currentParticles => {
      if (newCount > currentParticles.length) {
        // Add particles
        const additionalParticles: SnowParticle[] = [];
        const viewportWidth = window.innerWidth;

        for (let i = currentParticles.length; i < newCount; i++) {
          additionalParticles.push({
            id: `snow-${i}-${Date.now()}`,
            x: Math.random() * viewportWidth,
            y: Math.random() * -100,
            size: Math.random() * 3 + 1,
            speed: Math.random() * 0.5 + 0.2,
            wind: windEnabled ? (Math.random() - 0.5) * 0.3 : 0,
            opacity: Math.random() * 0.6 + 0.4,
            rotation: Math.random() * 360,
            lifecycle: 'falling'
          });
        }

        return [...currentParticles, ...additionalParticles];
      } else if (newCount < currentParticles.length) {
        // Remove particles
        return currentParticles.slice(0, newCount);
      }

      return currentParticles;
    });

    particleCountRef.current = newCount;
  };

  const startAnimationLoop = (): void => {
    const animate = (currentTime: number): void => {
      if (!isActive) return;

      const deltaTime = currentTime - lastTimeRef.current;
      lastTimeRef.current = currentTime;

      // Throttle updates based on performance
      if (fpsRef.current < 30 || deltaTime > 50) {
        animationFrameRef.current = requestAnimationFrame(animate);
        return;
      }

      updateParticles(deltaTime);
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);
  };

  const stopAnimationLoop = (): void => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
  };

  const updateParticles = (deltaTime: number): void => {
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // Update wind offset for gentle breeze effect
    if (windEnabled) {
      windOffsetRef.current += deltaTime * 0.001;
    }

    setParticles(currentParticles =>
      currentParticles.map(particle => {
        let newY = particle.y + (particle.speed * deltaTime * 0.1);
        let newX = particle.x;
        let newLifecycle = particle.lifecycle;

        // Apply wind with sine wave for natural movement
        if (windEnabled) {
          const windStrength = particle.wind + Math.sin(windOffsetRef.current + particle.id.length) * 0.1;
          newX += windStrength * deltaTime * 0.1;
        }

        // Handle particle lifecycle
        if (newY > viewportHeight + 50) {
          // Reset particle to top
          newY = Math.random() * -100;
          newX = Math.random() * viewportWidth;
          newLifecycle = 'falling';
        } else if (newY > viewportHeight - 20 && particle.lifecycle === 'falling') {
          // Start melting/settling near bottom
          newLifecycle = Math.random() > 0.7 ? 'melting' : 'settling';
        }

        // Update rotation for tumbling effect
        const newRotation = particle.rotation + (particle.speed * deltaTime * 0.5);

        return {
          ...particle,
          x: newX,
          y: newY,
          rotation: newRotation,
          lifecycle: newLifecycle
        };
      })
    );
  };

  const handleParticleInteraction = (particleId: string): void => {
    if (!interactive) return;

    // Add sparkle effect on interaction
    const particleElement = document.querySelector(`[data-particle-id="${particleId}"]`) as HTMLElement;
    if (particleElement) {
      winterAnimationSystem.sparkle(particleElement, 0.5, { duration: 300 });
    }
  };

  if (!isActive) return null;

  return (
    <div
      ref={containerRef}
      className={`winter-snow-particle-system ${className}`}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: interactive ? 'auto' : 'none',
        zIndex: 1
      }}
      aria-hidden="true"
    >
      {particles.map(particle => (
        <div
          key={particle.id}
          data-particle-id={particle.id}
          className={`winter-snow-particle ${particle.lifecycle}`}
          style={{
            position: 'absolute',
            left: `${particle.x}px`,
            top: `${particle.y}px`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            background: 'radial-gradient(circle, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.6) 70%, transparent 100%)',
            borderRadius: '50%',
            opacity: particle.opacity,
            transform: `rotate(${particle.rotation}deg)`,
            willChange: 'transform, opacity',
            pointerEvents: interactive ? 'auto' : 'none',
            cursor: interactive ? 'pointer' : 'default'
          }}
          onClick={() => handleParticleInteraction(particle.id)}
          onMouseEnter={() => interactive && handleParticleInteraction(particle.id)}
        />
      ))}
    </div>
  );
};

export default SnowParticleSystem;