/**
 * Holiday Decorations - Christmas ornaments, lights, and festive elements
 * with gentle animations and seasonal theming
 */

import React, { useEffect, useState } from 'react';
import { deviceCapabilities } from '../../lib/deviceCapabilities';
import { winterAnimationSystem, WinterAnimationSystem } from '../../lib/winterAnimationSystem';

interface OrnamentProps {
  x: number;
  y: number;
  size: number;
  color: string;
  shape: 'bauble' | 'star' | 'bell';
  id: string;
}

interface TwinkleLightProps {
  x: number;
  y: number;
  color: string;
  id: string;
}

interface HolidayDecorationsProps {
  showOrnaments?: boolean;
  showLights?: boolean;
  intensity?: 'subtle' | 'moderate' | 'festive';
  className?: string;
}

const HolidayDecorations: React.FC<HolidayDecorationsProps> = ({
  showOrnaments = true,
  showLights = true,
  intensity = 'moderate',
  className = ''
}) => {
  const [ornaments, setOrnaments] = useState<OrnamentProps[]>([]);
  const [lights, setLights] = useState<TwinkleLightProps[]>([]);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    // Check if we should enable decorations
    const shouldEnable = deviceCapabilities.getPerformanceTier() !== 'minimal' &&
                        !WinterAnimationSystem.respectReducedMotion();

    if (!shouldEnable) {
      setIsActive(false);
      return;
    }

    setIsActive(true);
    initializeDecorations();
  }, [intensity, showOrnaments, showLights]);

  const getDecorationCount = (): number => {
    const baseCount = deviceCapabilities.getPerformanceTier() === 'high' ? 8 :
                     deviceCapabilities.getPerformanceTier() === 'medium' ? 5 : 3;

    const intensityMultiplier = intensity === 'subtle' ? 0.6 :
                               intensity === 'moderate' ? 1.0 : 1.4;

    return Math.floor(baseCount * intensityMultiplier);
  };

  const initializeDecorations = (): void => {
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // Initialize ornaments
    if (showOrnaments) {
      const ornamentCount = getDecorationCount();
      const newOrnaments: OrnamentProps[] = [];

      for (let i = 0; i < ornamentCount; i++) {
        const shapes: OrnamentProps['shape'][] = ['bauble', 'star', 'bell'];
        const colors = ['#E8A5B5', '#C9A0D8', '#F8F4FF', '#4A90A4', '#2C5F2D', '#10B981'];

        newOrnaments.push({
          id: `ornament-${i}`,
          x: Math.random() * (viewportWidth - 60) + 30, // Keep away from edges
          y: Math.random() * (viewportHeight * 0.6) + viewportHeight * 0.2, // Middle 60% of screen
          size: Math.random() * 20 + 15, // 15-35px
          color: colors[Math.floor(Math.random() * colors.length)],
          shape: shapes[Math.floor(Math.random() * shapes.length)]
        });
      }

      setOrnaments(newOrnaments);
    }

    // Initialize lights
    if (showLights) {
      const lightCount = getDecorationCount();
      const newLights: TwinkleLightProps[] = [];
      const lightColors = ['#FFE4E1', '#E6E6FA', '#F0F8FF', '#FFF8DC', '#F5F5DC'];

      for (let i = 0; i < lightCount; i++) {
        newLights.push({
          id: `light-${i}`,
          x: Math.random() * (viewportWidth - 40) + 20,
          y: Math.random() * (viewportHeight * 0.5) + viewportHeight * 0.1,
          color: lightColors[Math.floor(Math.random() * lightColors.length)]
        });
      }

      setLights(newLights);
    }
  };

  const renderOrnament = (ornament: OrnamentProps): JSX.Element => {
    const { x, y, size, color, shape, id } = ornament;

    let ornamentElement: JSX.Element;

    switch (shape) {
      case 'bauble':
        ornamentElement = (
          <div
            key={id}
            className="winter-ornament winter-ornament-bauble"
            style={{
              position: 'absolute',
              left: `${x}px`,
              top: `${y}px`,
              width: `${size}px`,
              height: `${size * 1.2}px`,
              background: `radial-gradient(ellipse at top, ${color} 0%, ${color}DD 50%, ${color}AA 100%)`,
              borderRadius: `${size/2}px ${size/2}px ${size/2}px ${size/2}px`,
              boxShadow: `0 2px 8px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.3)`,
              border: `1px solid rgba(255,255,255,0.4)`,
              transformOrigin: '50% 20%'
            }}
          >
            {/* Shimmer effect */}
            <div
              style={{
                position: 'absolute',
                top: '15%',
                left: '20%',
                width: '30%',
                height: '40%',
                background: 'linear-gradient(135deg, rgba(255,255,255,0.6) 0%, transparent 50%, rgba(255,255,255,0.3) 100%)',
                borderRadius: '50%',
                transform: 'rotate(45deg)'
              }}
            />
            {/* Hanging thread */}
            <div
              style={{
                position: 'absolute',
                top: '-8px',
                left: '50%',
                width: '1px',
                height: '8px',
                background: 'rgba(255,255,255,0.6)',
                transform: 'translateX(-50%)'
              }}
            />
          </div>
        );
        break;

      case 'star':
        ornamentElement = (
          <div
            key={id}
            className="winter-ornament winter-ornament-star"
            style={{
              position: 'absolute',
              left: `${x}px`,
              top: `${y}px`,
              width: `${size}px`,
              height: `${size}px`,
              background: color,
              clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)',
              filter: `drop-shadow(0 2px 4px rgba(0,0,0,0.3))`,
              transformOrigin: '50% 80%'
            }}
          >
            {/* Hanging thread */}
            <div
              style={{
                position: 'absolute',
                top: '-6px',
                left: '50%',
                width: '1px',
                height: '6px',
                background: 'rgba(255,255,255,0.6)',
                transform: 'translateX(-50%)'
              }}
            />
          </div>
        );
        break;

      case 'bell':
        ornamentElement = (
          <div
            key={id}
            className="winter-ornament winter-ornament-bell"
            style={{
              position: 'absolute',
              left: `${x}px`,
              top: `${y}px`,
              width: `${size * 0.8}px`,
              height: `${size}px`,
              background: color,
              borderRadius: `${size * 0.4}px ${size * 0.4}px 0 0`,
              border: `2px solid rgba(255,255,255,0.3)`,
              borderBottom: 'none',
              boxShadow: `0 2px 6px rgba(0,0,0,0.3)`,
              transformOrigin: '50% 90%'
            }}
          >
            {/* Bell clapper */}
            <div
              style={{
                position: 'absolute',
                bottom: '15%',
                left: '50%',
                width: '3px',
                height: '8px',
                background: 'rgba(0,0,0,0.6)',
                borderRadius: '2px',
                transform: 'translateX(-50%)'
              }}
            />
            {/* Hanging thread */}
            <div
              style={{
                position: 'absolute',
                top: '-8px',
                left: '50%',
                width: '1px',
                height: '8px',
                background: 'rgba(255,255,255,0.6)',
                transform: 'translateX(-50%)'
              }}
            />
          </div>
        );
        break;

      default:
        ornamentElement = <div key={id} />;
    }

    return ornamentElement;
  };

  const renderTwinkleLight = (light: TwinkleLightProps): JSX.Element => {
    const { x, y, color, id } = light;

    return (
      <div
        key={id}
        className="winter-twinkle-light"
        style={{
          position: 'absolute',
          left: `${x}px`,
          top: `${y}px`,
          width: '8px',
          height: '8px',
          background: color,
          borderRadius: '50%',
          boxShadow: `0 0 12px ${color}80, 0 0 24px ${color}40`,
          animation: `winter-twinkle ${2 + Math.random() * 2}s ease-in-out infinite`,
          animationDelay: `${Math.random() * 2}s`
        }}
      />
    );
  };

  // Add CSS animations for ornaments and lights
  useEffect(() => {
    if (!isActive) return;

    // Animate ornaments with gentle swinging
    ornaments.forEach((ornament, index) => {
      const element = document.querySelector(`[key="${ornament.id}"]`) as HTMLElement;
      if (element) {
        winterAnimationSystem.gentleFloat(element, {
          duration: 4000 + (index * 500),
          delay: index * 200
        });
      }
    });
  }, [ornaments, isActive]);

  if (!isActive) return null;

  return (
    <div
      className={`winter-holiday-decorations ${className}`}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 2
      }}
      aria-hidden="true"
    >
      {/* Render ornaments */}
      {showOrnaments && ornaments.map(renderOrnament)}

      {/* Render twinkle lights */}
      {showLights && lights.map(renderTwinkleLight)}
    </div>
  );
};

export default HolidayDecorations;