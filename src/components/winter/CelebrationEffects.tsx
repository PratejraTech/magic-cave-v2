/**
 * Celebration Effects - Confetti bursts, sparkle effects, and achievement animations
 * for special moments in the Advent calendar experience
 */

import React, { useEffect, useState, useRef } from 'react';
import { deviceCapabilities } from '../../lib/deviceCapabilities';

export interface ConfettiParticle {
  id: string;
  x: number;
  y: number;
  size: number;
  color: string;
  shape: 'circle' | 'square' | 'triangle';
  velocityX: number;
  velocityY: number;
  rotation: number;
  rotationSpeed: number;
  life: number;
  maxLife: number;
}

export interface SparkleEffect {
  id: string;
  x: number;
  y: number;
  size: number;
  intensity: number;
  duration: number;
}

interface CelebrationEffectsProps {
  trigger?: string; // Event that triggers celebration
  position?: { x: number; y: number }; // Position for effects
  intensity?: 'subtle' | 'moderate' | 'spectacular';
  className?: string;
}

const CelebrationEffects: React.FC<CelebrationEffectsProps> = ({
  trigger,
  position = { x: window.innerWidth / 2, y: window.innerHeight / 2 },
  intensity = 'moderate',
  className = ''
}) => {
  const [confettiParticles, setConfettiParticles] = useState<ConfettiParticle[]>([]);
  const [sparkles, setSparkles] = useState<SparkleEffect[]>([]);
  const [isActive, setIsActive] = useState(false);
  const animationFrameRef = useRef<number>();
  const lastTimeRef = useRef<number>(0);

  useEffect(() => {
    if (trigger) {
      triggerCelebration();
    }
  }, [trigger]);

  useEffect(() => {
    if (isActive && (confettiParticles.length > 0 || sparkles.length > 0)) {
      startAnimationLoop();
    } else {
      stopAnimationLoop();
    }

    return () => stopAnimationLoop();
  }, [isActive, confettiParticles.length, sparkles.length]);

  const triggerCelebration = (): void => {
    if (!deviceCapabilities.shouldUseParticles()) return;

    setIsActive(true);

    // Create confetti burst
    createConfettiBurst();

    // Create sparkle effects
    createSparkleBurst();

    // Auto-cleanup after animation
    setTimeout(() => {
      setIsActive(false);
      setConfettiParticles([]);
      setSparkles([]);
    }, getCelebrationDuration());
  };

  const createConfettiBurst = (): void => {
    const particleCount = getParticleCount();
    const newParticles: ConfettiParticle[] = [];

    const colors = [
      '#E8A5B5', '#C9A0D8', '#F8F4FF', '#4A90A4', '#2C5F2D', '#10B981',
      '#FFE4E1', '#E6E6FA', '#F0F8FF', '#FFF8DC', '#F5F5DC'
    ];

    const shapes: ConfettiParticle['shape'][] = ['circle', 'square', 'triangle'];

    for (let i = 0; i < particleCount; i++) {
      const angle = (Math.PI * 2 * i) / particleCount + Math.random() * 0.5;
      const speed = 2 + Math.random() * 3;
      const life = 2000 + Math.random() * 1000; // 2-3 seconds

      newParticles.push({
        id: `confetti-${Date.now()}-${i}`,
        x: position.x,
        y: position.y,
        size: 4 + Math.random() * 8, // 4-12px
        color: colors[Math.floor(Math.random() * colors.length)],
        shape: shapes[Math.floor(Math.random() * shapes.length)],
        velocityX: Math.cos(angle) * speed,
        velocityY: Math.sin(angle) * speed - Math.random() * 2, // Slight upward bias
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 10, // -5 to 5 degrees per frame
        life: life,
        maxLife: life
      });
    }

    setConfettiParticles(newParticles);
  };

  const createSparkleBurst = (): void => {
    const sparkleCount = Math.min(8, getParticleCount() / 3);
    const newSparkles: SparkleEffect[] = [];

    for (let i = 0; i < sparkleCount; i++) {
      newSparkles.push({
        id: `sparkle-${Date.now()}-${i}`,
        x: position.x + (Math.random() - 0.5) * 100,
        y: position.y + (Math.random() - 0.5) * 100,
        size: 20 + Math.random() * 30, // 20-50px
        intensity: 0.5 + Math.random() * 0.5, // 0.5-1.0
        duration: 800 + Math.random() * 400 // 800-1200ms
      });
    }

    setSparkles(newSparkles);
  };

  const getParticleCount = (): number => {
    const baseCount = intensity === 'subtle' ? 20 :
                     intensity === 'moderate' ? 40 : 80;

    // Adjust based on performance tier
    const tier = deviceCapabilities.getPerformanceTier();
    const multiplier = tier === 'high' ? 1.0 :
                      tier === 'medium' ? 0.7 : 0.4;

    return Math.floor(baseCount * multiplier);
  };

  const getCelebrationDuration = (): number => {
    return intensity === 'subtle' ? 2500 :
           intensity === 'moderate' ? 3500 : 5000;
  };

  const startAnimationLoop = (): void => {
    const animate = (currentTime: number): void => {
      if (!isActive) return;

      const deltaTime = currentTime - lastTimeRef.current;
      lastTimeRef.current = currentTime;

      updateParticles(deltaTime);
      updateSparkles(deltaTime);

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
    setConfettiParticles(currentParticles =>
      currentParticles
        .map(particle => ({
          ...particle,
          x: particle.x + particle.velocityX * deltaTime * 0.1,
          y: particle.y + particle.velocityY * deltaTime * 0.1,
          velocityY: particle.velocityY + 0.1 * deltaTime * 0.01, // Gravity
          rotation: particle.rotation + particle.rotationSpeed * deltaTime * 0.1,
          life: particle.life - deltaTime
        }))
        .filter(particle => particle.life > 0)
    );
  };

  const updateSparkles = (deltaTime: number): void => {
    setSparkles(currentSparkles =>
      currentSparkles
        .map(sparkle => ({
          ...sparkle,
          duration: sparkle.duration - deltaTime
        }))
        .filter(sparkle => sparkle.duration > 0)
    );
  };

  const renderConfettiParticle = (particle: ConfettiParticle): JSX.Element => {
    const opacity = particle.life / particle.maxLife;
    const scale = 0.5 + (opacity * 0.5); // Fade out by scaling down

    let shapeElement: JSX.Element;

    switch (particle.shape) {
      case 'circle':
        shapeElement = (
          <div
            style={{
              width: '100%',
              height: '100%',
              borderRadius: '50%',
              background: particle.color
            }}
          />
        );
        break;
      case 'square':
        shapeElement = (
          <div
            style={{
              width: '100%',
              height: '100%',
              background: particle.color
            }}
          />
        );
        break;
      case 'triangle':
        shapeElement = (
          <div
            style={{
              width: 0,
              height: 0,
              borderLeft: `${particle.size/2}px solid transparent`,
              borderRight: `${particle.size/2}px solid transparent`,
              borderBottom: `${particle.size}px solid ${particle.color}`,
              margin: 'auto'
            }}
          />
        );
        break;
      default:
        shapeElement = <div />;
    }

    return (
      <div
        key={particle.id}
        className="winter-confetti-particle"
        style={{
          position: 'fixed',
          left: `${particle.x}px`,
          top: `${particle.y}px`,
          width: `${particle.size}px`,
          height: `${particle.size}px`,
          transform: `rotate(${particle.rotation}deg) scale(${scale})`,
          opacity: opacity,
          pointerEvents: 'none',
          zIndex: 1000
        }}
      >
        {shapeElement}
      </div>
    );
  };

  const renderSparkle = (sparkle: SparkleEffect): JSX.Element => {
    const progress = 1 - (sparkle.duration / 800); // Assuming 800ms base duration
    const scale = 0.5 + (progress * 0.5);
    const opacity = Math.sin(progress * Math.PI); // Sine wave for smooth fade

    return (
      <div
        key={sparkle.id}
        className="winter-sparkle-effect"
        style={{
          position: 'fixed',
          left: `${sparkle.x}px`,
          top: `${sparkle.y}px`,
          width: `${sparkle.size}px`,
          height: `${sparkle.size}px`,
          background: `radial-gradient(circle, rgba(255,255,255,${sparkle.intensity}) 0%, transparent 70%)`,
          borderRadius: '50%',
          transform: `scale(${scale})`,
          opacity: opacity,
          pointerEvents: 'none',
          zIndex: 999
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            width: '4px',
            height: '4px',
            background: 'white',
            borderRadius: '50%',
            transform: 'translate(-50%, -50%)',
            boxShadow: `0 0 10px rgba(255,255,255,${sparkle.intensity})`
          }}
        />
      </div>
    );
  };

  if (!isActive) return null;

  return (
    <div
      className={`winter-celebration-effects ${className}`}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 1000
      }}
      aria-hidden="true"
    >
      {/* Render confetti particles */}
      {confettiParticles.map(renderConfettiParticle)}

      {/* Render sparkle effects */}
      {sparkles.map(renderSparkle)}
    </div>
  );
};

export default CelebrationEffects;