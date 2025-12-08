/**
 * Voice Magic - Speech recognition system for magical voice commands
 * Supports commands like "open my gift", "make it snow more", etc.
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { deviceCapabilities } from '../../lib/deviceCapabilities';

export interface VoiceCommand {
  command: string;
  confidence: number;
  timestamp: number;
  rawTranscript: string;
}

interface VoiceMagicProps {
  onVoiceCommand: (command: VoiceCommand) => void;
  enabled?: boolean;
  language?: string;
  continuous?: boolean;
  className?: string;
}

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message?: string;
}

interface SpeechGrammarList {
  readonly length: number;
  item(index: number): SpeechGrammar;
  [index: number]: SpeechGrammar;
  addFromURI(src: string, weight?: number): void;
  addFromString(string: string, weight?: number): void;
}

interface SpeechGrammar {
  src: string;
  weight: number;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  grammars: SpeechGrammarList;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  serviceURI: string;
  start(): void;
  stop(): void;
  abort(): void;
  onaudiostart: ((this: SpeechRecognition, ev: Event) => void) | null;
  onaudioend: ((this: SpeechRecognition, ev: Event) => void) | null;
  onend: ((this: SpeechRecognition, ev: Event) => void) | null;
  onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => void) | null;
  onnomatch: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => void) | null;
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => void) | null;
  onsoundstart: ((this: SpeechRecognition, ev: Event) => void) | null;
  onsoundend: ((this: SpeechRecognition, ev: Event) => void) | null;
  onspeechstart: ((this: SpeechRecognition, ev: Event) => void) | null;
  onspeechend: ((this: SpeechRecognition, ev: Event) => void) | null;
  onstart: ((this: SpeechRecognition, ev: Event) => void) | null;
}

interface SpeechRecognitionConstructor {
  new (): SpeechRecognition;
}

declare global {
  interface Window {
    SpeechRecognition: SpeechRecognitionConstructor;
    webkitSpeechRecognition: SpeechRecognitionConstructor;
  }
}

const VoiceMagic: React.FC<VoiceMagicProps> = ({
  onVoiceCommand,
  enabled = true,
  language = 'en-US',
  continuous = true,
  className = ''
}) => {
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Voice command patterns with fuzzy matching
  const commandPatterns = [
    // Gift-related commands
    { pattern: /\b(open|unwrap|reveal)\s+(my|the|a)?\s*(gift|present|surprise)\b/i, command: 'open_gift' },
    { pattern: /\b(show|display|see)\s+(my|the|a)?\s*(gift|present|surprise)\b/i, command: 'show_gift' },
    { pattern: /\b(next|another|different)\s+(gift|present|surprise)\b/i, command: 'next_gift' },

    // Snow and weather commands
    { pattern: /\b(make|let|start)\s+it\s+(snow|snowing)\b/i, command: 'start_snow' },
    { pattern: /\b(more|increase|heavier)\s+snow\b/i, command: 'more_snow' },
    { pattern: /\b(less|decrease|lighter)\s+snow\b/i, command: 'less_snow' },
    { pattern: /\b(stop|end|halt)\s+(snow|snowing)\b/i, command: 'stop_snow' },

    // Light and decoration commands
    { pattern: /\b(turn|make)\s+(on|bright|brighter)\s+(lights?|decorations?)\b/i, command: 'lights_on' },
    { pattern: /\b(turn|make)\s+(off|dim|dimmer)\s+(lights?|decorations?)\b/i, command: 'lights_off' },
    { pattern: /\b(twinkle|blink|flash)\s+(lights?|decorations?)\b/i, command: 'twinkle_lights' },

    // Celebration commands
    { pattern: /\b(celebrate|party|hooray|yay)\b/i, command: 'celebrate' },
    { pattern: /\b(magic|magical|wonderful|amazing)\b/i, command: 'magic_burst' },

    // Theme commands
    { pattern: /\b(change|switch)\s+(theme|color|style)\b/i, command: 'change_theme' },
    { pattern: /\b(winter|christmas|holiday)\s+(mode|theme)\b/i, command: 'winter_theme' },

    // Help and interaction commands
    { pattern: /\b(help|what|how)\s+(can|do|to)\s+(you|i)\s+(do|say)\b/i, command: 'help' },
    { pattern: /\b(listen|listening|hear)\s+(me|you)\b/i, command: 'start_listening' },
    { pattern: /\b(stop|quiet|shh)\s+(listen|listening)\b/i, command: 'stop_listening' }
  ];

  const matchCommand = useCallback((transcript: string): { command: string; confidence: number } | null => {
    for (const { pattern, command } of commandPatterns) {
      const match = transcript.match(pattern);
      if (match) {
        // Calculate confidence based on how well the match fits
        const matchLength = match[0].length;
        const transcriptLength = transcript.trim().length;
        const confidence = Math.min(matchLength / transcriptLength, 1);
        return { command, confidence };
      }
    }
    return null;
  }, []);

  const initializeSpeechRecognition = useCallback(() => {
    // Check for Speech Recognition support
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setIsSupported(false);
      setError('Speech recognition not supported in this browser');
      return null;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = continuous;
    recognition.interimResults = false;
    recognition.lang = language;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
      setError(null);
    };

    recognition.onend = () => {
      setIsListening(false);
      // Auto-restart if continuous mode and still enabled
      if (continuous && enabled && isSupported) {
        setTimeout(() => {
          if (recognitionRef.current && enabled) {
            try {
              recognition.start();
            } catch {
              // Ignore restart errors
            }
          }
        }, 1000);
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      setError(`Speech recognition error: ${event.error}`);
      setIsListening(false);
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const results = event.results;
      if (results.length > 0) {
        const result = results[results.length - 1];
        if (result.isFinal) {
          const transcript = result[0].transcript.trim().toLowerCase();

          // Match against command patterns
          const matchedCommand = matchCommand(transcript);
          if (matchedCommand && matchedCommand.confidence > 0.3) { // Minimum confidence threshold
            const voiceCommand: VoiceCommand = {
              command: matchedCommand.command,
              confidence: matchedCommand.confidence,
              timestamp: Date.now(),
              rawTranscript: transcript
            };

            onVoiceCommand(voiceCommand);
          }
        }
      }
    };

    return recognition;
  }, [continuous, language, enabled, isSupported, matchCommand, onVoiceCommand]);

  const startListening = useCallback(() => {
    if (!recognitionRef.current || !enabled || !isSupported) return;

    try {
      recognitionRef.current.start();
    } catch {
      setError('Failed to start speech recognition');
    }
  }, [enabled, isSupported]);

  const stopListening = useCallback(() => {
    if (!recognitionRef.current) return;

    try {
      recognitionRef.current.stop();
    } catch {
      // Ignore stop errors
    }
  }, []);

  useEffect(() => {
    const checkSupport = async () => {
      const capabilities = await deviceCapabilities.detectCapabilities();

      // Check if speech recognition is supported and user has granted permissions
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const hasSupport = !!SpeechRecognition;

      // Additional checks for mobile devices (speech recognition can be battery-intensive)
      const isMobile = capabilities.screenSize === 'mobile';
      const batteryOk = !capabilities.batteryLevel || capabilities.batteryLevel > 0.3;

      setIsSupported(hasSupport && (!isMobile || batteryOk));
    };

    checkSupport();
  }, []);

  useEffect(() => {
    if (isSupported && enabled) {
      recognitionRef.current = initializeSpeechRecognition();

      // Start listening immediately if continuous mode
      if (continuous) {
        startListening();
      }
    } else {
      stopListening();
      recognitionRef.current = null;
    }

    return () => {
      stopListening();
      recognitionRef.current = null;
    };
  }, [isSupported, enabled, continuous, initializeSpeechRecognition, startListening, stopListening]);

  // Don't render anything if not supported or disabled
  if (!isSupported || !enabled) {
    return null;
  }

  return (
    <div
      className={`voice-magic-container ${className}`}
      style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        zIndex: 15,
        pointerEvents: 'none'
      }}
      aria-hidden="true"
    >
      {/* Voice listening indicator */}
      {isListening && (
        <div
          className="voice-listening-indicator"
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.6) 50%, rgba(255,255,255,0.2) 100%)',
            border: '2px solid rgba(255,255,255,0.8)',
            boxShadow: '0 0 20px rgba(255,255,255,0.6)',
            animation: 'voicePulse 1.5s ease-in-out infinite',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <div
            style={{
              width: '20px',
              height: '20px',
              background: 'rgba(255,255,255,0.9)',
              borderRadius: '50%',
              animation: 'voiceInnerPulse 1.5s ease-in-out infinite'
            }}
          />
        </div>
      )}

      {/* Error indicator */}
      {error && process.env.NODE_ENV === 'development' && (
        <div
          style={{
            position: 'absolute',
            top: '50px',
            right: '0',
            background: 'rgba(255,0,0,0.8)',
            color: 'white',
            padding: '5px 10px',
            borderRadius: '4px',
            fontSize: '12px',
            maxWidth: '200px'
          }}
        >
          Voice Error: {error}
        </div>
      )}

      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes voicePulse {
            0%, 100% {
              transform: scale(1);
              opacity: 1;
            }
            50% {
              transform: scale(1.2);
              opacity: 0.7;
            }
          }

          @keyframes voiceInnerPulse {
            0%, 100% {
              transform: scale(1);
              opacity: 0.8;
            }
            50% {
              transform: scale(0.8);
              opacity: 1;
            }
          }
        `
      }} />
    </div>
  );
};

export default VoiceMagic;