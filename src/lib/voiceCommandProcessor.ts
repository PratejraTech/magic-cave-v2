/**
 * Voice Command Processor - Handles voice commands for calendar interactions
 * Processes natural language commands and converts them to calendar actions
 */

import { VoiceCommand } from '../components/winter/VoiceMagic';
import { CalendarTile, Gift } from '../types/calendar';

export interface VoiceCommandResult {
  action: string;
  target?: CalendarTile | number | string;
  confidence: number;
  response: string;
  celebration?: string;
}

export interface CalendarVoiceContext {
  availableTiles: CalendarTile[];
  unlockedTiles: CalendarTile[];
  currentDay: number;
  totalDays: number;
  lastUnlockedGift?: Gift | null;
}

export class VoiceCommandProcessor {
  private context: CalendarVoiceContext;

  constructor(context: CalendarVoiceContext) {
    this.context = context;
  }

  updateContext(context: Partial<CalendarVoiceContext>) {
    this.context = { ...this.context, ...context };
  }

  processCommand(command: VoiceCommand): VoiceCommandResult | null {
    const { command: cmdText, confidence } = command;

    // Normalize command text
    const normalizedCommand = cmdText.toLowerCase().trim();

    // Gift-related commands
    if (this.isGiftCommand(normalizedCommand)) {
      return this.processGiftCommand(normalizedCommand, confidence);
    }

    // Navigation commands
    if (this.isNavigationCommand(normalizedCommand)) {
      return this.processNavigationCommand(normalizedCommand, confidence);
    }

    // Information commands
    if (this.isInfoCommand(normalizedCommand)) {
      return this.processInfoCommand(normalizedCommand, confidence);
    }

    // Celebration commands
    if (this.isCelebrationCommand(normalizedCommand)) {
      return this.processCelebrationCommand(normalizedCommand, confidence);
    }

    // Fallback - try fuzzy matching
    return this.fuzzyMatchCommand(normalizedCommand, confidence);
  }

  private isGiftCommand(command: string): boolean {
    const giftKeywords = [
      'gift', 'present', 'surprise', 'unlock', 'open', 'reveal',
      'day', 'calendar', 'tile', 'box', 'package'
    ];
    return giftKeywords.some(keyword => command.includes(keyword));
  }

  private isNavigationCommand(command: string): boolean {
    const navKeywords = [
      'next', 'previous', 'show', 'display', 'go to', 'find',
      'look at', 'see', 'view', 'scroll', 'navigate'
    ];
    return navKeywords.some(keyword => command.includes(keyword));
  }

  private isInfoCommand(command: string): boolean {
    const infoKeywords = [
      'how many', 'what', 'status', 'progress', 'remaining',
      'completed', 'done', 'left', 'help', 'what can'
    ];
    return infoKeywords.some(keyword => command.includes(keyword));
  }

  private isCelebrationCommand(command: string): boolean {
    const celebrationKeywords = [
      'celebrate', 'yay', 'hooray', 'amazing', 'wonderful',
      'magic', 'magical', 'fantastic', 'awesome', 'great'
    ];
    return celebrationKeywords.some(keyword => command.includes(keyword));
  }

  private processGiftCommand(command: string, confidence: number): VoiceCommandResult | null {
    const { availableTiles, unlockedTiles, currentDay } = this.context;

    // "open my gift" or "unlock today's gift"
    if (command.includes('open') || command.includes('unlock')) {
      // Find the current day's tile
      const todayTile = availableTiles.find(tile => tile.day === currentDay);

      if (todayTile && !todayTile.gift_unlocked) {
        return {
          action: 'unlock_tile',
          target: todayTile,
          confidence,
          response: `Opening your gift for Day ${currentDay}! 🎁`,
          celebration: 'gift_unlock_magic'
        };
      }

      // Find next available gift
      const nextTile = availableTiles.find(tile => !tile.gift_unlocked);
      if (nextTile) {
        return {
          action: 'unlock_tile',
          target: nextTile,
          confidence,
          response: `Opening your gift for Day ${nextTile.day}! 🎁`,
          celebration: 'gift_unlock_magic'
        };
      }

      return {
        action: 'no_action',
        confidence,
        response: 'All gifts are already unlocked! 🎉'
      };
    }

    // "show my gifts" or "what gifts do I have"
    if (command.includes('show') && command.includes('gift')) {
      return {
        action: 'show_unlocked_gifts',
        confidence,
        response: `You have ${unlockedTiles.length} unlocked gifts! 🎁`,
        celebration: 'gift_show_magic'
      };
    }

    // "next gift" or "find next gift"
    if (command.includes('next') && command.includes('gift')) {
      const nextTile = availableTiles.find(tile => !tile.gift_unlocked);
      if (nextTile) {
        return {
          action: 'highlight_tile',
          target: nextTile,
          confidence,
          response: `Your next gift is for Day ${nextTile.day}! 🎯`,
          celebration: 'navigation_magic'
        };
      }

      return {
        action: 'no_action',
        confidence,
        response: 'All gifts are unlocked! 🎊'
      };
    }

    return null;
  }

  private processNavigationCommand(command: string, confidence: number): VoiceCommandResult | null {
    const { availableTiles, currentDay } = this.context;

    // "show calendar" or "show all days"
    if (command.includes('show') && command.includes('calendar')) {
      return {
        action: 'show_calendar',
        confidence,
        response: 'Here\'s your magical calendar! ✨',
        celebration: 'calendar_show_magic'
      };
    }

    // "go to day X" or "show day X"
    const dayMatch = command.match(/(?:go to|show|find) day (\d+)/i);
    if (dayMatch) {
      const dayNumber = parseInt(dayMatch[1]);
      const targetTile = availableTiles.find(tile => tile.day === dayNumber);

      if (targetTile) {
        return {
          action: 'highlight_tile',
          target: targetTile,
          confidence,
          response: `Showing Day ${dayNumber}! 🎯`,
          celebration: 'navigation_magic'
        };
      }

      return {
        action: 'no_action',
        confidence,
        response: `Day ${dayNumber} is not available yet. 📅`
      };
    }

    // "show today" or "today's gift"
    if (command.includes('today')) {
      const todayTile = availableTiles.find(tile => tile.day === currentDay);
      if (todayTile) {
        return {
          action: 'highlight_tile',
          target: todayTile,
          confidence,
          response: `Here's today's gift for Day ${currentDay}! 🎁`,
          celebration: 'navigation_magic'
        };
      }
    }

    return null;
  }

  private processInfoCommand(command: string, confidence: number): VoiceCommandResult | null {
    const { unlockedTiles, totalDays } = this.context;

    // "how many gifts" or "what's my progress"
    if (command.includes('how many') || command.includes('progress')) {
      const unlocked = unlockedTiles.length;
      const remaining = totalDays - unlocked;

      return {
        action: 'show_progress',
        confidence,
        response: `You have unlocked ${unlocked} out of ${totalDays} gifts! ${remaining > 0 ? `${remaining} more to go!` : 'All done!'} 🎊`,
        celebration: 'progress_magic'
      };
    }

    // "what can I do" or "help"
    if (command.includes('help') || command.includes('what can')) {
      return {
        action: 'show_help',
        confidence,
        response: 'You can say: "open my gift", "show calendar", "next gift", or "how many gifts"! 🎤',
        celebration: 'help_magic'
      };
    }

    // "status" or "how am I doing"
    if (command.includes('status') || command.includes('doing')) {
      const unlocked = unlockedTiles.length;
      const percentage = Math.round((unlocked / totalDays) * 100);

      return {
        action: 'show_status',
        confidence,
        response: `You're ${percentage}% complete with ${unlocked} magical surprises unlocked! 🌟`,
        celebration: 'status_magic'
      };
    }

    return null;
  }

  private processCelebrationCommand(command: string, confidence: number): VoiceCommandResult | null {
    // "celebrate" or "yay" or "hooray"
    if (command.includes('celebrate') || command.includes('yay') || command.includes('hooray')) {
      return {
        action: 'celebrate',
        confidence,
        response: 'Celebrating your magical journey! 🎉🎊',
        celebration: 'voice_celebration'
      };
    }

    // "that's amazing" or "wonderful"
    if (command.includes('amazing') || command.includes('wonderful') || command.includes('fantastic')) {
      return {
        action: 'celebrate',
        confidence,
        response: 'Thank you! Creating more magic for you! ✨',
        celebration: 'voice_celebration'
      };
    }

    return null;
  }

  private fuzzyMatchCommand(command: string, confidence: number): VoiceCommandResult | null {
    // Simple fuzzy matching for common misheard commands

    // "open gift" -> "open my gift"
    if (command.includes('open') && command.includes('gift')) {
      return this.processGiftCommand('open my gift', confidence * 0.8);
    }

    // "show calendar" -> "show calendar"
    if (command.includes('show') && command.includes('calendar')) {
      return this.processNavigationCommand('show calendar', confidence * 0.8);
    }

    // "next" -> "next gift"
    if (command === 'next' || command.includes('next')) {
      return this.processGiftCommand('next gift', confidence * 0.7);
    }

    // "help" -> "help"
    if (command === 'help') {
      return this.processInfoCommand('help', confidence * 0.9);
    }

    return null;
  }

  // Utility methods for voice feedback
  getVoiceFeedback(result: VoiceCommandResult): string {
    switch (result.action) {
      case 'unlock_tile':
        return '🎁 Gift unlocked! Check it out!';
      case 'show_unlocked_gifts':
        return '📋 Here are your unlocked gifts!';
      case 'highlight_tile':
        return '🎯 Found it! Take a look!';
      case 'show_calendar':
        return '📅 Here\'s your calendar!';
      case 'show_progress':
        return '📊 Here\'s your progress!';
      case 'show_help':
        return '💡 Here\'s how to use voice commands!';
      case 'show_status':
        return '📈 Here\'s your current status!';
      case 'celebrate':
        return '🎉 Yay! Let\'s celebrate!';
      default:
        return '✨ Magic happening!';
    }
  }

  getAvailableCommands(): string[] {
    return [
      'Open my gift',
      'Show calendar',
      'Next gift',
      'How many gifts',
      'What\'s my progress',
      'Help',
      'Celebrate',
      'Show today'
    ];
  }
}