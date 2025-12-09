import React, { useState, useEffect } from 'react';
import ChildCalendar from './ChildCalendar';
import TemplateErrorBoundary from './TemplateErrorBoundary';
import { useCalendarData } from '../lib/useCalendarData';
import { useAuth } from '../lib/AuthContext';
import { useEmotionalResponse } from '../lib/EmotionalBackground';
import { useWinterEffects } from '../contexts/WinterEffectsContext';
import { Gift, CalendarTile, GiftType, TemplateMetadata, Child } from '../types/calendar';
import { applyTemplateStyling } from '../lib/templateStyling';
import { VoiceCommandProcessor } from '../lib/voiceCommandProcessor';
import type { VoiceCommand } from './winter/VoiceMagic';
import { BackgroundGradientAnimation } from './ui/background-gradient-animation';
import WonderlandLayout from './layout/WonderlandLayout';
import { Button } from './ui/WonderButton';

interface ChildCalendarViewProps {
  testMode?: boolean;
}

const ChildCalendarView: React.FC<ChildCalendarViewProps> = ({ testMode = false }) => {
  const { userType, isAuthenticated, child } = useAuth();
  const { triggerJoy, triggerCelebration, triggerAnticipation } = useEmotionalResponse();
  const { triggerCelebration: triggerWinterEffectsCelebration } = useWinterEffects();
  const [showCelebration, setShowCelebration] = React.useState(false);
  const [celebrationMessage, setCelebrationMessage] = React.useState('');
  const [unlockedCount, setUnlockedCount] = React.useState(0);

  // Voice command state
  const [voiceFeedback, setVoiceFeedback] = React.useState<string | null>(null);
  const [highlightedTile, setHighlightedTile] = React.useState<CalendarTile | null>(null);
  const [voiceCommandProcessor, setVoiceCommandProcessor] = React.useState<VoiceCommandProcessor | null>(null);

  // Mock data for testing
  const mockTiles: CalendarTile[] = Array.from({ length: 25 }, (_, i) => ({
    tile_id: `tile-${i + 1}`,
    calendar_id: 'test-calendar',
    day: i + 1,
    title: i < 5 ? `Day ${i + 1} Message` : undefined,
    body: i < 5 ? `This is the message for day ${i + 1}` : undefined,
    media_url: i === 0 ? 'test-image.jpg' : undefined,
    gift: i < 3 ? {
      type: 'sticker' as GiftType,
      title: `Gift ${i + 1}`,
      description: `A special gift for day ${i + 1}`,
      sticker: '🎁'
    } : undefined,
    gift_unlocked: i < 2,
    version: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }));

  const defaultTemplate: TemplateMetadata = {
    colors: { primary: '#FFB3BA', secondary: '#BAFFC9', accent: '#BAE1FF' },
    fonts: { heading: 'Comic Sans MS', body: 'Arial' },
    icons: ['butterfly', 'star', 'heart'],
    layout: 'rounded_tiles'
  };

  const calendarData = useCalendarData();
  const { tiles, loading, error, unlockTile, template } = testMode
    ? {
        tiles: mockTiles,
        loading: false,
        error: null,
        unlockTile: async (): Promise<Gift> => ({ type: 'sticker' as GiftType, title: 'Test Gift', description: 'Test', sticker: '🎁' }),
        template: defaultTemplate
      }
    : calendarData;
  const [lastUnlockedGift, setLastUnlockedGift] = useState<Gift | null>(null);
  const [childData, setChildData] = useState<Child | null>(null);

  // Check if user has access (authenticated child, guest, or test mode)
  const hasAccess = testMode ||
    (isAuthenticated && userType === 'child') ||
    childData ||
    localStorage.getItem('guest_session') !== null;

  // Apply template styling when template changes
  useEffect(() => {
    if (template) {
      applyTemplateStyling(template);
    }
  }, [template]);

  // Load child data from localStorage if not in context (including guest sessions)
  useEffect(() => {
    if (!child) {
      // First check for regular child session
      const storedChildSession = localStorage.getItem('child_session');
      if (storedChildSession) {
        try {
          const parsed = JSON.parse(storedChildSession);
          if (parsed.child) {
            setChildData(parsed.child);
          }
        } catch (error) {
          console.error('Error parsing child session:', error);
        }
      }

      // Then check for guest session
      const storedGuestSession = localStorage.getItem('guest_session');
      if (storedGuestSession && !childData) {
        try {
          const parsed = JSON.parse(storedGuestSession);
          if (parsed.child && parsed.isGuest) {
            setChildData(parsed.child);
          }
        } catch (error) {
          console.error('Error parsing guest session:', error);
        }
      }
    } else {
      setChildData(child);
    }
  }, [child, childData]);

  // Initialize voice command processor
  useEffect(() => {
    if (tiles.length > 0) {
      const context = {
        availableTiles: tiles,
        unlockedTiles: tiles.filter(tile => tile.gift_unlocked),
        currentDay: new Date().getDate(),
        totalDays: tiles.length,
        lastUnlockedGift: lastUnlockedGift
      };

      const processor = new VoiceCommandProcessor(context);
      setVoiceCommandProcessor(processor);
    }
  }, [tiles, lastUnlockedGift]);

  // Define handleUnlockTile early so it can be used in useCallback
  const handleUnlockTile = React.useCallback(async (tileId: string, note?: string): Promise<Gift> => {
    try {
      const gift = await unlockTile(tileId, note);
      setLastUnlockedGift(gift);

      // Trigger emotional responses based on unlock
      const newUnlockedCount = tiles.filter(t => t.gift_unlocked).length + 1;
      setUnlockedCount(newUnlockedCount);

      // Emotional celebration based on progress
      if (newUnlockedCount === 1) {
        // First unlock - pure joy
        triggerJoy(2000);
        setCelebrationMessage("🎉 Your first surprise! The magic begins!");
        setShowCelebration(true);
      } else if (newUnlockedCount === tiles.length) {
        // All unlocked - celebration
        triggerCelebration(5000);
        setCelebrationMessage("🎊 Congratulations! You've unlocked all 25 days of magic!");
        setShowCelebration(true);
      } else if (newUnlockedCount % 5 === 0) {
        // Milestone every 5 unlocks
        triggerJoy(3000);
        setCelebrationMessage(`🌟 Amazing! ${newUnlockedCount} magical surprises unlocked!`);
        setShowCelebration(true);
      } else {
        // Regular unlock - anticipation for next
        triggerAnticipation(1500);
      }

      // Auto-hide celebration after 4 seconds
      if (showCelebration) {
        setTimeout(() => setShowCelebration(false), 4000);
      }

      return gift;
    } catch (err) {
      console.error('Failed to unlock tile:', err);
      throw err;
    }
  }, [unlockTile, tiles, triggerJoy, triggerCelebration, triggerAnticipation, showCelebration]);

  // Voice command handler (defined after handleUnlockTile to avoid hoisting issues)
  const handleVoiceCommand = React.useCallback(async (command: VoiceCommand) => {
    if (!voiceCommandProcessor) return;

    const result = voiceCommandProcessor.processCommand(command);
    if (!result) return;

    console.log('🎤 Processed voice command:', result);

    // Show voice feedback
    setVoiceFeedback(result.response);

    // Handle different actions
    switch (result.action) {
      case 'unlock_tile':
        if (result.target && typeof result.target === 'object' && 'tile_id' in result.target) {
          try {
            await handleUnlockTile((result.target as CalendarTile).tile_id);
            setVoiceFeedback('🎁 Gift unlocked successfully!');
          } catch {
            setVoiceFeedback('❌ Sorry, couldn\'t unlock that gift right now.');
          }
        }
        break;

      case 'highlight_tile':
        if (result.target && typeof result.target === 'object' && 'tile_id' in result.target) {
          setHighlightedTile(result.target as CalendarTile);
          // Auto-clear highlight after 3 seconds
          setTimeout(() => setHighlightedTile(null), 3000);
        }
        break;

      case 'show_unlocked_gifts':
        // Trigger celebration for showing gifts
        triggerWinterEffectsCelebration(result.celebration || 'gift_show_magic');
        break;

      case 'show_calendar':
        // Scroll to top to show calendar
        window.scrollTo({ top: 0, behavior: 'smooth' });
        triggerWinterEffectsCelebration(result.celebration || 'calendar_show_magic');
        break;

      case 'show_progress':
      case 'show_status': {
        // Update progress display
        const unlocked = tiles.filter(t => t.gift_unlocked).length;
        setUnlockedCount(unlocked);
        triggerWinterEffectsCelebration(result.celebration || 'progress_magic');
        break;
      }

      case 'show_help': {
        // Show available commands
        const commands = voiceCommandProcessor.getAvailableCommands();
        setVoiceFeedback(`Try saying: ${commands.slice(0, 3).join(', ')}... 🎤`);
        triggerWinterEffectsCelebration(result.celebration || 'help_magic');
        break;
      }

      case 'celebrate':
        triggerCelebration(2000);
        setCelebrationMessage(result.response);
        setShowCelebration(true);
        setTimeout(() => setShowCelebration(false), 3000);
        break;

      case 'no_action':
        // Just show the response
        break;
    }

    // Trigger celebration if specified
    if (result.celebration) {
      triggerWinterEffectsCelebration(result.celebration);
    }

    // Auto-clear voice feedback after 4 seconds
    setTimeout(() => setVoiceFeedback(null), 4000);
  }, [voiceCommandProcessor, handleUnlockTile, tiles, triggerWinterEffectsCelebration, triggerCelebration]);

  // Connect voice command handler to WinterEffects context
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as Window & { calendarVoiceHandler?: (command: VoiceCommand) => Promise<void> }).calendarVoiceHandler = handleVoiceCommand;
    }

    return () => {
      if (typeof window !== 'undefined') {
        delete (window as Window & { calendarVoiceHandler?: (command: VoiceCommand) => Promise<void> }).calendarVoiceHandler;
      }
    };
  }, [handleVoiceCommand]);

  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-magic-primary/20 via-magic-secondary/20 to-magic-accent/20 flex items-center justify-center p-6">
        <div className="max-w-lg rounded-3xl border border-bg-muted bg-white p-8 text-center shadow-lg">
          <p className="text-lg text-text-primary">This page is only accessible to children.</p>
          <Button
            fullWidth
            variant="primary"
            size="lg"
            onClick={() => (window.location.href = '/auth')}
            className="mt-4"
          >
            Return to Login
          </Button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-magic-primary/20 via-magic-secondary/20 to-magic-accent/20 flex items-center justify-center p-6">
        <div className="flex flex-col items-center gap-4 rounded-3xl border border-bg-muted bg-white px-10 py-8 shadow-lg">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-bg-muted border-t-primary-rose" />
          <p className="text-text-secondary">Loading your calendar...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-magic-primary/20 via-magic-secondary/20 to-magic-accent/20 flex items-center justify-center p-6">
        <div className="max-w-lg rounded-3xl border border-bg-muted bg-white p-8 text-center shadow-lg">
          <p className="text-lg text-text-primary">{error}</p>
          <Button
            fullWidth
            variant="primary"
            size="lg"
            onClick={() => window.location.reload()}
            className="mt-4"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <TemplateErrorBoundary>
      <WonderlandLayout
        title={childData?.name ? `${childData.name}'s Enchanted Calendar` : 'Welcome, Little Explorer'}
        subtitle="Unlock a new memory filled with love, snow, and sparkle each day."
        mood="aurora"
        showSnow
        showButterflies
        contentClassName="mx-auto flex w-full max-w-5xl flex-col gap-8"
      >
        <div className="relative overflow-hidden rounded-[2.5rem] border border-white/20 bg-white/10 p-6 shadow-2xl backdrop-blur-2xl">
          <BackgroundGradientAnimation
            gradientBackgroundStart="rgb(2, 6, 23)"
            gradientBackgroundEnd="rgb(15, 23, 42)"
            firstColor="34, 197, 94"
            secondColor="239, 68, 68"
            thirdColor="251, 191, 36"
            fourthColor="168, 85, 247"
            fifthColor="236, 72, 153"
            interactive
            containerClassName="absolute inset-0 opacity-40"
          />
          <div className="relative z-10 text-center text-white">
            <h1 className="text-3xl font-semibold tracking-tight drop-shadow sm:text-4xl">
              {childData?.name ? `${childData.name}'s Magical Calendar` : 'Your Magical Calendar'}
            </h1>
            <p className="mt-3 text-white/80">Discover daily surprises and messages from your loved ones! ✨</p>

            <div className="mx-auto mt-6 w-full max-w-md rounded-2xl border border-white/30 bg-white/10 p-4 shadow-lg shadow-rose-500/20 backdrop-blur-xl">
              <div className="mb-2 flex items-center justify-between text-sm text-white/80">
                <span>Your Progress</span>
                <span>{unlockedCount}/25 Magical Days</span>
              </div>
              <div className="h-3 w-full rounded-full border border-white/20 bg-white/10">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-rose-400 via-pink-500 to-fuchsia-500 shadow-lg shadow-rose-500/40 transition-all duration-1000"
                  style={{ width: `${(unlockedCount / 25) * 100}%` }}
                  role="progressbar"
                  aria-valuenow={unlockedCount}
                  aria-valuemax={25}
                  aria-label={`Progress: ${unlockedCount} of 25 magical surprises unlocked`}
                />
              </div>
              <div className="mt-2 flex justify-between text-[10px] uppercase tracking-[0.3em] text-white/50">
                <span>Start</span>
                <span>{unlockedCount > 0 ? `${Math.round((unlockedCount / 25) * 100)}%` : 'Ready'}</span>
                <span>Finish</span>
              </div>
            </div>

            <Button
              variant="secondary"
              size="lg"
              className="mt-6 rounded-full border border-white/30 bg-white/10"
              onClick={() => (window.location.href = '/parent/dashboard')}
            >
              Switch to Parent View 👨‍👩‍👧‍👦
            </Button>
          </div>
        </div>

        {/* Celebration Overlay */}
        {showCelebration && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="winter-wonderland-card frosted celebration p-8 text-center max-w-md mx-4 animate-bounce winter-ornamentation">
              <div className="text-6xl mb-4">🎊</div>
              <h2 className="headline-2 text-brand mb-2">Amazing!</h2>
              <p className="body-large text-secondary">{celebrationMessage}</p>
              <div className="mt-4 flex justify-center space-x-2">
                <div className="w-2 h-2 bg-brand-primary rounded-full animate-pulse"></div>
                <div className="w-2 h-2 bg-brand-secondary rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 bg-brand-tertiary rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>
          </div>
        )}

        {/* Voice Feedback Overlay */}
        {voiceFeedback && (
          <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-40">
            <div className="winter-wonderland-card frosted p-4 text-center animate-bounce">
              <div className="text-2xl mb-2">🎤</div>
              <p className="text-sm font-medium">{voiceFeedback}</p>
            </div>
          </div>
        )}

        <div className="relative z-10 space-y-6">
          <ChildCalendar
            tiles={tiles}
            onUnlockTile={handleUnlockTile}
            layout={template?.layout}
            gradients={template?.gradients}
            animations={template?.animations}
            highlightedTile={highlightedTile}
          />

          {lastUnlockedGift && (
            <div className="rounded-3xl border border-white/20 bg-white/10 p-6 text-center text-white shadow-2xl backdrop-blur-xl">
              <h2 className="text-xl font-semibold">Latest Unlock</h2>
              <div className="mt-4 text-4xl" role="img" aria-label="celebration">
                🎉
              </div>
              <h3 className="mt-3 text-lg font-semibold">{lastUnlockedGift.title}</h3>
              {lastUnlockedGift.description && <p className="mt-1 text-white/80">{lastUnlockedGift.description}</p>}
            </div>
          )}
        </div>
      </WonderlandLayout>
    </TemplateErrorBoundary>
  );
};

export default ChildCalendarView;
