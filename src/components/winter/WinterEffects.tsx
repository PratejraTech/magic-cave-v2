/**
 * Winter Effects - Main orchestrator for all winter wonderland animations and effects
 * Combines snow particles, holiday decorations, and celebration effects
 */

import React, { useEffect, useState } from 'react';
import { useWinterTheme } from '../../contexts/WinterThemeContext';
import { deviceCapabilities } from '../../lib/deviceCapabilities';
import SnowParticleSystem from './SnowParticleSystem';
import HolidayDecorations from './HolidayDecorations';
import CelebrationEffects from './CelebrationEffects';
import GestureMagic, { GestureEvent } from './GestureMagic';
import VoiceMagic, { VoiceCommand } from './VoiceMagic';
import AIPersonalization, { PersonalizationProfile, AdaptiveEffect } from './AIPersonalization';

interface WinterEffectsProps {
  celebrationTrigger?: string;
  celebrationPosition?: { x: number; y: number };
  onGestureMagic?: (gesture: GestureEvent) => void;
  onVoiceCommand?: (command: VoiceCommand) => void;
  onPersonalizationUpdate?: (profile: PersonalizationProfile) => void;
  onAdaptiveEffect?: (effect: AdaptiveEffect) => void;
  className?: string;
}

const WinterEffects: React.FC<WinterEffectsProps> = ({
  celebrationTrigger,
  celebrationPosition,
  onGestureMagic,
  onVoiceCommand,
  onPersonalizationUpdate,
  onAdaptiveEffect,
  className = ''
}) => {
  const { isWinterActive, variant } = useWinterTheme();
  const [isEnabled, setIsEnabled] = useState(false);
  const [performanceTier, setPerformanceTier] = useState<'high' | 'medium' | 'low' | 'minimal'>('high');

  useEffect(() => {
    // Check if winter effects should be enabled
    const shouldEnable = isWinterActive &&
                        deviceCapabilities.getPerformanceTier() !== 'minimal';

    setIsEnabled(shouldEnable);
    setPerformanceTier(deviceCapabilities.getPerformanceTier());
  }, [isWinterActive]);

  // Don't render anything if winter theme is not active or performance is minimal
  if (!isEnabled) {
    return null;
  }

  // Configure effects based on performance tier and variant
  const getSnowIntensity = (): 'light' | 'medium' | 'heavy' => {
    if (performanceTier === 'high') return 'medium';
    if (performanceTier === 'medium') return 'light';
    return 'light';
  };

  const getDecorationIntensity = (): 'subtle' | 'moderate' | 'festive' => {
    if (performanceTier === 'high') return 'moderate';
    if (performanceTier === 'medium') return 'subtle';
    return 'subtle';
  };

  const getCelebrationIntensity = (): 'subtle' | 'moderate' | 'spectacular' => {
    if (performanceTier === 'high') return 'moderate';
    if (performanceTier === 'medium') return 'subtle';
    return 'subtle';
  };

  return (
    <div
      className={`winter-effects-container ${className}`}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 10
      }}
      aria-hidden="true"
    >
      {/* Gesture Magic - Advanced gesture recognition for magical effects */}
      {onGestureMagic && (
        <GestureMagic
          onGesture={onGestureMagic}
          enabled={performanceTier !== 'minimal'}
        />
      )}

      {/* Voice Magic - Speech recognition for magical voice commands */}
      {onVoiceCommand && (
        <VoiceMagic
          onVoiceCommand={onVoiceCommand}
          enabled={performanceTier !== 'minimal'}
          continuous={true}
        />
      )}

      {/* AI Personalization - Adaptive magic system */}
      {onPersonalizationUpdate && onAdaptiveEffect && (
        <AIPersonalization
          onPersonalizationUpdate={onPersonalizationUpdate}
          onAdaptiveEffect={onAdaptiveEffect}
          enabled={performanceTier !== 'minimal'}
        />
      )}

      {/* Snow Particle System - Always enabled for winter theme */}
      <SnowParticleSystem
        intensity={getSnowIntensity()}
        windEnabled={true}
        interactive={performanceTier === 'high'}
      />

      {/* Holiday Decorations - Ornaments and lights */}
      <HolidayDecorations
        showOrnaments={performanceTier !== 'low'}
        showLights={performanceTier !== 'low'}
        intensity={getDecorationIntensity()}
      />

      {/* Celebration Effects - Triggered by specific events */}
      {celebrationTrigger && (
        <CelebrationEffects
          trigger={celebrationTrigger}
          position={celebrationPosition}
          intensity={getCelebrationIntensity()}
        />
      )}

      {/* Seasonal overlay effects based on variant */}
      <div
        className={`winter-variant-overlay winter-variant-${variant}`}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: -1,
          opacity: performanceTier === 'high' ? 0.1 : 0.05
        }}
      />

      {/* Performance indicator for debugging (only in development) */}
      {process.env.NODE_ENV === 'development' && (
        <div
          style={{
            position: 'fixed',
            bottom: '10px',
            right: '10px',
            background: 'rgba(0,0,0,0.8)',
            color: 'white',
            padding: '5px 10px',
            borderRadius: '4px',
            fontSize: '12px',
            pointerEvents: 'auto',
            zIndex: 10000
          }}
        >
          Winter Effects: {performanceTier}
        </div>
      )}
    </div>
  );
};

export default WinterEffects;