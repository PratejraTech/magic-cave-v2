/**
 * Winter Effects Context - Manages interactive winter wonderland effects across the app
 * Provides centralized state management for gestures, voice commands, and personalization
 */

import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { GestureEvent } from '../components/winter/GestureMagic';
import { VoiceCommand } from '../components/winter/VoiceMagic';
import { PersonalizationProfile, AdaptiveEffect } from '../components/winter/AIPersonalization';

interface CelebrationTrigger {
  type: string;
  position?: { x: number; y: number };
  metadata?: Record<string, any>;
}

interface WinterEffectsState {
  celebrationTrigger: CelebrationTrigger | null;
  isGestureActive: boolean;
  isVoiceActive: boolean;
  personalizationProfile: PersonalizationProfile | null;
  lastGesture: GestureEvent | null;
  lastVoiceCommand: VoiceCommand | null;
}

interface WinterEffectsContextType {
  state: WinterEffectsState;

  // Event handlers
  handleGestureMagic: (gesture: GestureEvent) => void;
  handleVoiceCommand: (command: VoiceCommand) => void;
  handlePersonalizationUpdate: (profile: PersonalizationProfile) => void;
  handleAdaptiveEffect: (effect: AdaptiveEffect) => void;

  // Action triggers
  triggerCelebration: (type: string, position?: { x: number; y: number }, metadata?: Record<string, any>) => void;
  clearCelebration: () => void;

  // Utility functions
  getGestureHistory: () => GestureEvent[];
  getVoiceHistory: () => VoiceCommand[];
  getMoodScore: () => number;
}

const WinterEffectsContext = createContext<WinterEffectsContextType | undefined>(undefined);

export const useWinterEffects = () => {
  const context = useContext(WinterEffectsContext);
  if (!context) {
    throw new Error('useWinterEffects must be used within a WinterEffectsProvider');
  }
  return context;
};

interface WinterEffectsProviderProps {
  children: React.ReactNode;
}

export const WinterEffectsProvider: React.FC<WinterEffectsProviderProps> = ({ children }) => {
  const [state, setState] = useState<WinterEffectsState>({
    celebrationTrigger: null,
    isGestureActive: false,
    isVoiceActive: false,
    personalizationProfile: null,
    lastGesture: null,
    lastVoiceCommand: null
  });

  // History tracking
  const gestureHistoryRef = useRef<GestureEvent[]>([]);
  const voiceHistoryRef = useRef<VoiceCommand[]>([]);

  // Celebration timeout ref
  const celebrationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleGestureMagic = useCallback((gesture: GestureEvent) => {
    console.log('🎭 Gesture Magic:', gesture);

    // Update state
    setState(prev => ({
      ...prev,
      lastGesture: gesture,
      isGestureActive: true
    }));

    // Add to history (keep last 50)
    gestureHistoryRef.current.push(gesture);
    gestureHistoryRef.current = gestureHistoryRef.current.slice(-50);

    // Trigger celebration based on gesture type
    let celebrationType = '';
    switch (gesture.type) {
      case 'swipe':
        celebrationType = gesture.direction === 'up' ? 'magical_swipe_up' :
                         gesture.direction === 'down' ? 'magical_swipe_down' :
                         gesture.direction === 'left' ? 'magical_swipe_left' : 'magical_swipe_right';
        break;
      case 'pinch':
        celebrationType = gesture.scale && gesture.scale > 1 ? 'magical_zoom_in' : 'magical_zoom_out';
        break;
      case 'longpress':
        celebrationType = 'magical_long_press';
        break;
      case 'tap':
        celebrationType = 'magical_tap';
        break;
    }

    if (celebrationType) {
      triggerCelebration(celebrationType, gesture.position);
    }

    // Reset gesture active state after a delay
    setTimeout(() => {
      setState(prev => ({ ...prev, isGestureActive: false }));
    }, 1000);
  }, []);

  const handleVoiceCommand = useCallback((command: VoiceCommand) => {
    console.log('🎤 Voice Command:', command);

    // Update state
    setState(prev => ({
      ...prev,
      lastVoiceCommand: command,
      isVoiceActive: true
    }));

    // Add to history (keep last 20)
    voiceHistoryRef.current.push(command);
    voiceHistoryRef.current = voiceHistoryRef.current.slice(-20);

    // Trigger celebration for voice commands
    triggerCelebration('voice_magic', undefined, { command: command.command, confidence: command.confidence });

    // Reset voice active state after a delay
    setTimeout(() => {
      setState(prev => ({ ...prev, isVoiceActive: false }));
    }, 2000);
  }, []);

  const handlePersonalizationUpdate = useCallback((profile: PersonalizationProfile) => {
    console.log('🧠 Personalization Update:', profile);

    setState(prev => ({
      ...prev,
      personalizationProfile: profile
    }));

    // Trigger celebration for personalization milestones
    if (profile.adaptation.confidenceThreshold > 0.8) {
      triggerCelebration('personalization_mastery');
    }
  }, []);

  const handleAdaptiveEffect = useCallback((effect: AdaptiveEffect) => {
    console.log('✨ Adaptive Effect:', effect);

    // Trigger the appropriate celebration based on adaptive effect type
    switch (effect.type) {
      case 'gesture_response':
        triggerCelebration('adaptive_gesture', effect.position);
        break;
      case 'voice_response':
        triggerCelebration('adaptive_voice', effect.position, effect.metadata);
        break;
      case 'proactive_magic':
        triggerCelebration('proactive_magic', effect.position, effect.metadata);
        break;
      case 'mood_boost':
        triggerCelebration('mood_boost', effect.position, effect.metadata);
        break;
      case 'celebration_prediction':
        triggerCelebration('celebration_prediction', effect.position, effect.metadata);
        break;
    }
  }, []);

  const triggerCelebration = useCallback((type: string, position?: { x: number; y: number }, metadata?: Record<string, any>) => {
    // Clear any existing celebration
    if (celebrationTimeoutRef.current) {
      clearTimeout(celebrationTimeoutRef.current);
    }

    setState(prev => ({
      ...prev,
      celebrationTrigger: { type, position, metadata }
    }));

    // Auto-clear celebration after 3 seconds
    celebrationTimeoutRef.current = setTimeout(() => {
      setState(prev => ({
        ...prev,
        celebrationTrigger: null
      }));
    }, 3000);
  }, []);

  const clearCelebration = useCallback(() => {
    if (celebrationTimeoutRef.current) {
      clearTimeout(celebrationTimeoutRef.current);
    }
    setState(prev => ({
      ...prev,
      celebrationTrigger: null
    }));
  }, []);

  const getGestureHistory = useCallback(() => {
    return [...gestureHistoryRef.current];
  }, []);

  const getVoiceHistory = useCallback(() => {
    return [...voiceHistoryRef.current];
  }, []);

  const getMoodScore = useCallback(() => {
    const profile = state.personalizationProfile;
    if (!profile || !profile.behavior.moodIndicators.length) return 0.5;

    const recentMoods = profile.behavior.moodIndicators.slice(-5);
    return recentMoods.reduce((sum, mood) => sum + mood, 0) / recentMoods.length;
  }, [state.personalizationProfile]);

  const contextValue: WinterEffectsContextType = {
    state,
    handleGestureMagic,
    handleVoiceCommand,
    handlePersonalizationUpdate,
    handleAdaptiveEffect,
    triggerCelebration,
    clearCelebration,
    getGestureHistory,
    getVoiceHistory,
    getMoodScore
  };

  return (
    <WinterEffectsContext.Provider value={contextValue}>
      {children}
    </WinterEffectsContext.Provider>
  );
};