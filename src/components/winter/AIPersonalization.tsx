/**
 * AI Personalization - Adaptive magic system that learns from user behavior
 * Analyzes interactions to create personalized magical experiences
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { GestureEvent } from './GestureMagic';
import { VoiceCommand } from './VoiceMagic';

export interface UserBehavior {
  gesturePatterns: GestureEvent[];
  voiceCommands: VoiceCommand[];
  interactionFrequency: number;
  preferredTimes: number[];
  favoriteEffects: string[];
  moodIndicators: number[]; // 0-1 scale, higher = more engaged/happy
  sessionDuration: number;
  lastInteraction: number;
}

export interface PersonalizationProfile {
  userId: string;
  behavior: UserBehavior;
  preferences: {
    snowIntensity: 'light' | 'medium' | 'heavy';
    decorationStyle: 'subtle' | 'moderate' | 'festive';
    celebrationStyle: 'subtle' | 'moderate' | 'spectacular';
    interactionSensitivity: 'low' | 'medium' | 'high';
    themeVariant: 'feminine' | 'masculine' | 'neutral';
    voiceActivation: boolean;
    gestureActivation: boolean;
  };
  adaptation: {
    learningRate: number;
    confidenceThreshold: number;
    lastUpdated: number;
  };
}

interface AIPersonalizationProps {
  userId?: string;
  onPersonalizationUpdate: (profile: PersonalizationProfile) => void;
  onAdaptiveEffect: (effect: AdaptiveEffect) => void;
  enabled?: boolean;
}

export interface AdaptiveEffect {
  type: 'gesture_response' | 'voice_response' | 'proactive_magic' | 'mood_boost' | 'celebration_prediction';
  trigger: string;
  intensity: number;
  position?: { x: number; y: number };
  metadata?: Record<string, unknown>;
}

const AIPersonalization: React.FC<AIPersonalizationProps> = ({
  userId = 'default_user',
  onPersonalizationUpdate,
  onAdaptiveEffect,
  enabled = true
}) => {
  const [profile, setProfile] = useState<PersonalizationProfile | null>(null);
  const behaviorBufferRef = useRef<UserBehavior>({
    gesturePatterns: [],
    voiceCommands: [],
    interactionFrequency: 0,
    preferredTimes: [],
    favoriteEffects: [],
    moodIndicators: [],
    sessionDuration: 0,
    lastInteraction: Date.now()
  });
  const sessionStartRef = useRef<number>(Date.now());
  const analysisIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Load existing profile from localStorage
  const loadProfile = useCallback((): PersonalizationProfile | null => {
    try {
      const stored = localStorage.getItem(`winter_magic_profile_${userId}`);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.warn('Failed to load personalization profile:', error);
      return null;
    }
  }, [userId]);

  // Save profile to localStorage
  const saveProfile = useCallback((profile: PersonalizationProfile) => {
    try {
      localStorage.setItem(`winter_magic_profile_${userId}`, JSON.stringify(profile));
    } catch (error) {
      console.warn('Failed to save personalization profile:', error);
    }
  }, [userId]);

  // Initialize profile
  const initializeProfile = useCallback(() => {
    const existingProfile = loadProfile();
    if (existingProfile) {
      setProfile(existingProfile);
      // Restore behavior buffer with recent data
      behaviorBufferRef.current = {
        ...existingProfile.behavior,
        gesturePatterns: existingProfile.behavior.gesturePatterns.slice(-50), // Keep last 50 gestures
        voiceCommands: existingProfile.behavior.voiceCommands.slice(-20), // Keep last 20 commands
        lastInteraction: Date.now()
      };
    } else {
      // Create new profile with defaults
      const newProfile: PersonalizationProfile = {
        userId,
        behavior: { ...behaviorBufferRef.current },
        preferences: {
          snowIntensity: 'medium',
          decorationStyle: 'moderate',
          celebrationStyle: 'moderate',
          interactionSensitivity: 'medium',
          themeVariant: 'neutral',
          voiceActivation: true,
          gestureActivation: true
        },
        adaptation: {
          learningRate: 0.1,
          confidenceThreshold: 0.6,
          lastUpdated: Date.now()
        }
      };
      setProfile(newProfile);
      saveProfile(newProfile);
    }
  }, [userId, loadProfile, saveProfile]);

  // Analyze behavior patterns
  const analyzeBehavior = useCallback(() => {
    if (!profile) return;

    const behavior = behaviorBufferRef.current;
    const now = Date.now();
    const sessionDuration = (now - sessionStartRef.current) / 1000 / 60; // minutes

    // Update session duration
    behavior.sessionDuration = sessionDuration;

    // Analyze gesture patterns
    const recentGestures = behavior.gesturePatterns.slice(-20);
    const gestureFrequency = recentGestures.length / Math.max(sessionDuration, 1); // gestures per minute

    // Analyze voice commands
    const recentCommands = behavior.voiceCommands.slice(-10);
    const voiceFrequency = recentCommands.length / Math.max(sessionDuration, 1); // commands per minute

    // Calculate interaction frequency
    behavior.interactionFrequency = gestureFrequency + voiceFrequency;

    // Detect preferred interaction times (hour of day)
    const gestureHours = recentGestures.map(() => new Date(Date.now()).getHours()); // Use current time for gestures
    const commandHours = recentCommands.map(cmd => new Date(cmd.timestamp).getHours());
    behavior.preferredTimes = [...gestureHours, ...commandHours];

    // Analyze favorite effects based on command frequency
    const commandCounts: Record<string, number> = {};
    recentCommands.forEach(cmd => {
      commandCounts[cmd.command] = (commandCounts[cmd.command] || 0) + 1;
    });
    behavior.favoriteEffects = Object.entries(commandCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([effect]) => effect);

    // Calculate mood indicators based on interaction patterns
    const avgConfidence = recentCommands.reduce((sum, cmd) => sum + cmd.confidence, 0) / Math.max(recentCommands.length, 1);
    const interactionVariety = new Set([...recentGestures.map(g => g.type), ...recentCommands.map(c => c.command)]).size;
    const moodScore = Math.min((avgConfidence * 0.6 + interactionVariety * 0.4), 1);
    behavior.moodIndicators.push(moodScore);
    behavior.moodIndicators = behavior.moodIndicators.slice(-10); // Keep last 10 readings

    // Update profile with new behavior data
    const updatedProfile: PersonalizationProfile = {
      ...profile,
      behavior: { ...behavior },
      adaptation: {
        ...profile.adaptation,
        lastUpdated: now
      }
    };

    // Adaptive preference updates based on behavior

    // Adjust snow intensity based on interaction frequency
    if (gestureFrequency > 2) {
      updatedProfile.preferences.snowIntensity = 'heavy';
    } else if (gestureFrequency < 0.5) {
      updatedProfile.preferences.snowIntensity = 'light';
    }

    // Adjust decoration style based on mood
    const avgMood = behavior.moodIndicators.reduce((sum, mood) => sum + mood, 0) / behavior.moodIndicators.length;
    if (avgMood > 0.8) {
      updatedProfile.preferences.decorationStyle = 'festive';
    } else if (avgMood < 0.4) {
      updatedProfile.preferences.decorationStyle = 'subtle';
    }

    // Adjust interaction sensitivity
    if (behavior.interactionFrequency > 3) {
      updatedProfile.preferences.interactionSensitivity = 'high';
    } else if (behavior.interactionFrequency < 1) {
      updatedProfile.preferences.interactionSensitivity = 'low';
    }

    setProfile(updatedProfile);
    saveProfile(updatedProfile);
    onPersonalizationUpdate(updatedProfile);
  }, [profile, onPersonalizationUpdate, saveProfile]);

  // Generate adaptive effects based on behavior
  const generateAdaptiveEffects = useCallback(() => {
    if (!profile) return;

    const behavior = behaviorBufferRef.current;
    const now = Date.now();

    // Proactive magic based on time since last interaction
    const timeSinceLastInteraction = (now - behavior.lastInteraction) / 1000 / 60; // minutes
    if (timeSinceLastInteraction > 5 && behavior.interactionFrequency > 1) {
      onAdaptiveEffect({
        type: 'proactive_magic',
        trigger: 'user_idle',
        intensity: Math.min(timeSinceLastInteraction / 10, 1),
        metadata: { idleTime: timeSinceLastInteraction }
      });
    }

    // Mood boost when mood is low
    const recentMood = behavior.moodIndicators.slice(-3);
    const avgRecentMood = recentMood.reduce((sum, mood) => sum + mood, 0) / recentMood.length;
    if (avgRecentMood < 0.5 && recentMood.length >= 3) {
      onAdaptiveEffect({
        type: 'mood_boost',
        trigger: 'low_mood_detected',
        intensity: 1 - avgRecentMood,
        metadata: { moodScore: avgRecentMood }
      });
    }

    // Celebration prediction based on behavior patterns
    const recentCommands = behavior.voiceCommands.slice(-5);
    const celebrationCommands = recentCommands.filter(cmd =>
      ['celebrate', 'hooray', 'yay', 'magic_burst'].includes(cmd.command)
    );
    if (celebrationCommands.length >= 2) {
      onAdaptiveEffect({
        type: 'celebration_prediction',
        trigger: 'celebration_pattern',
        intensity: celebrationCommands.length / 5,
        metadata: { patternLength: celebrationCommands.length }
      });
    }
  }, [profile, onAdaptiveEffect]);

  // Handle gesture events
  const handleGesture = useCallback((gesture: GestureEvent) => {
    if (!enabled) return;

    const behavior = behaviorBufferRef.current;
    behavior.gesturePatterns.push(gesture);
    behavior.gesturePatterns = behavior.gesturePatterns.slice(-100); // Keep last 100 gestures
    behavior.lastInteraction = Date.now();

    // Immediate adaptive response
    onAdaptiveEffect({
      type: 'gesture_response',
      trigger: gesture.type,
      intensity: gesture.type === 'swipe' ? (gesture.velocity || 0) / 2 : 0.5,
      position: gesture.position,
      metadata: { direction: gesture.direction, scale: gesture.scale }
    });
  }, [enabled, onAdaptiveEffect]);

  // Handle voice commands
  const handleVoiceCommand = useCallback((command: VoiceCommand) => {
    if (!enabled) return;

    const behavior = behaviorBufferRef.current;
    behavior.voiceCommands.push(command);
    behavior.voiceCommands = behavior.voiceCommands.slice(-50); // Keep last 50 commands
    behavior.lastInteraction = Date.now();

    // Immediate adaptive response
    onAdaptiveEffect({
      type: 'voice_response',
      trigger: command.command,
      intensity: command.confidence,
      metadata: { rawTranscript: command.rawTranscript }
    });
  }, [enabled, onAdaptiveEffect]);

  // Expose handlers for external use
  useEffect(() => {
    // Attach to window for external access (gesture and voice components will call these)
    interface WindowWithHandlers extends Window {
      aiPersonalizationGestureHandler?: typeof handleGesture;
      aiPersonalizationVoiceHandler?: typeof handleVoiceCommand;
    }
    const w = window as WindowWithHandlers;
    w.aiPersonalizationGestureHandler = handleGesture;
    w.aiPersonalizationVoiceHandler = handleVoiceCommand;

    return () => {
      delete w.aiPersonalizationGestureHandler;
      delete w.aiPersonalizationVoiceHandler;
    };
  }, [handleGesture, handleVoiceCommand]);

  // Initialize and start analysis
  useEffect(() => {
    if (!enabled) return;

    initializeProfile();

    // Start periodic analysis
    analysisIntervalRef.current = setInterval(() => {
      analyzeBehavior();
      generateAdaptiveEffects();
    }, 30000); // Analyze every 30 seconds

    return () => {
      if (analysisIntervalRef.current) {
        clearInterval(analysisIntervalRef.current);
      }
    };
  }, [enabled, initializeProfile, analyzeBehavior, generateAdaptiveEffects]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (analysisIntervalRef.current) {
        clearInterval(analysisIntervalRef.current);
      }
    };
  }, []);

  // Don't render anything - this is a logic-only component
  return null;
};

export default AIPersonalization;