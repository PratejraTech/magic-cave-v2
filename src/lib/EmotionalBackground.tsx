import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type EmotionalState = 'default' | 'joy' | 'anticipation' | 'reflection' | 'celebration';

interface EmotionalBackgroundContextType {
  currentState: EmotionalState;
  setEmotionalState: (state: EmotionalState) => void;
  transitionToState: (state: EmotionalState, duration?: number) => void;
}

const EmotionalBackgroundContext = createContext<EmotionalBackgroundContextType | undefined>(undefined);

interface EmotionalBackgroundProviderProps {
  children: ReactNode;
}

export const EmotionalBackgroundProvider: React.FC<EmotionalBackgroundProviderProps> = ({ children }) => {
  const [currentState, setCurrentState] = useState<EmotionalState>('default');
  const [isTransitioning, setIsTransitioning] = useState(false);

  const setEmotionalState = (state: EmotionalState) => {
    if (state !== currentState) {
      setCurrentState(state);
      updateBackgroundClasses(state);
    }
  };

  const transitionToState = (state: EmotionalState, duration: number = 1000) => {
    if (state !== currentState && !isTransitioning) {
      setIsTransitioning(true);

      // Add transition class
      document.body.classList.add('background-transitioning');

      setTimeout(() => {
        setEmotionalState(state);
        setIsTransitioning(false);

        // Remove transition class after transition completes
        setTimeout(() => {
          document.body.classList.remove('background-transitioning');
        }, 500);
      }, duration);
    }
  };

  const updateBackgroundClasses = (state: EmotionalState) => {
    const backgroundElement = document.querySelector('.christmas-village-bg');
    if (backgroundElement) {
      // Remove all emotional state classes
      backgroundElement.classList.remove('joy', 'anticipation', 'reflection', 'celebration');

      // Add the new state class (skip 'default')
      if (state !== 'default') {
        backgroundElement.classList.add(state);
      }
    }
  };

  // Initialize on mount
  useEffect(() => {
    updateBackgroundClasses(currentState);
  }, []);

  // Auto-transition based on time/context (optional enhancement)
  useEffect(() => {
    const checkTimeBasedState = () => {
      const now = new Date();
      const hour = now.getHours();

      // Morning joy, afternoon anticipation, evening reflection
      if (hour >= 6 && hour < 12) {
        setEmotionalState('joy');
      } else if (hour >= 12 && hour < 18) {
        setEmotionalState('anticipation');
      } else {
        setEmotionalState('reflection');
      }
    };

    // Check every hour
    const interval = setInterval(checkTimeBasedState, 60 * 60 * 1000);

    // Initial check
    checkTimeBasedState();

    return () => clearInterval(interval);
  }, []);

  const value: EmotionalBackgroundContextType = {
    currentState,
    setEmotionalState,
    transitionToState,
  };

  return (
    <EmotionalBackgroundContext.Provider value={value}>
      {children}
    </EmotionalBackgroundContext.Provider>
  );
};

export const useEmotionalBackground = (): EmotionalBackgroundContextType => {
  const context = useContext(EmotionalBackgroundContext);
  if (context === undefined) {
    throw new Error('useEmotionalBackground must be used within an EmotionalBackgroundProvider');
  }
  return context;
};

// Hook for triggering emotional responses based on user actions
export const useEmotionalResponse = () => {
  const { transitionToState } = useEmotionalBackground();

  const triggerJoy = (duration?: number) => transitionToState('joy', duration);
  const triggerAnticipation = (duration?: number) => transitionToState('anticipation', duration);
  const triggerReflection = (duration?: number) => transitionToState('reflection', duration);
  const triggerCelebration = (duration?: number) => transitionToState('celebration', duration);

  return {
    triggerJoy,
    triggerAnticipation,
    triggerReflection,
    triggerCelebration,
  };
};