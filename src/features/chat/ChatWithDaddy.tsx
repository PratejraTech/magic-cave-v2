import React, { useEffect, useMemo, useRef, useState } from 'react';
import type { ChatMessage, LetterChunk } from './chatService';
import {
  fetchDadsLetter,
  loadStoredMessages,
  persistMessages,
  requestDaddyResponse,
  logChatInput,
  resetSessionId,
  selectLetterChunk,
  formatLetterChunkPrompt,
} from './chatService';
import { CHAT_SYSTEM_PROMPT } from './systemPrompt';
import { photoPairs } from '../../data/photoPairs.generated';
import { SoundManager } from '../advent/utils/SoundManager';
import { playThemeAtRandomPoint, getRandomThemeTrackPath } from '../../lib/musicTheme';
import { logSessionEvent, EventTypes } from '../../lib/sessionEventLogger';

interface ChatWithDaddyProps {
  isOpen: boolean;
  onClose: () => void;
}

const firstTimeGreetings = [
  "Daddy wrote you a special letter. Let's read it together!",
  'Hi Harper! Daddy has a letter just for you.',
  "Hello sweetheart! Ready to read Daddy's letter?",
];

const welcomeBackGreetings = [
  "Welcome back, sweetie! Daddy loves reading with you again.",
  "Hi again, Harper! Let's enjoy Daddy's letter together.",
  "It's lovely to see you here again! Daddy is so happy to read with you.",
];

export function ChatWithDaddy({ isOpen, onClose }: ChatWithDaddyProps) {
  const storedHistoryRef = useRef<ChatMessage[]>(loadStoredMessages());
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [letterChunks, setLetterChunks] = useState<LetterChunk[]>([]);
  const [usedChunks, setUsedChunks] = useState<number[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [chunkProgress, setChunkProgress] = useState<{ lastChunk: number; totalChunks: number } | null>(null);

  const soundManager = SoundManager.getInstance();

  useEffect(() => {
    // Load letter chunks on mount
    fetchDadsLetter()
      .then((chunks) => {
        setLetterChunks(chunks);
        console.log("Dad's letter loaded:", chunks.length, 'chunks');
        
        // Initialize chunk progress with total chunks
        if (chunks.length > 0) {
          setChunkProgress({ lastChunk: 0, totalChunks: chunks.length });
        }
        
        // Verify chat endpoint is accessible
        const testEndpoint = async () => {
          try {
            const response = await fetch('/api/chat-with-daddy', { 
              method: 'OPTIONS',
              headers: {
                'Access-Control-Request-Method': 'POST',
                'Access-Control-Request-Headers': 'Content-Type',
              }
            });
            console.log('Chat endpoint check:', response.status === 200 ? 'Available' : `Status: ${response.status}`);
          } catch (error) {
            console.error('Chat endpoint check failed:', error);
          }
        };
        testEndpoint();
      })
      .catch((error) => {
        console.error("Failed to load dad's letter:", error);
        setLetterChunks([]);
      });
  }, []);

  useEffect(() => {
    if (!isOpen) {
      storedHistoryRef.current = [];
      persistMessages([]);
      resetSessionId();
      setMessages([]);
      setInput('');
      setError(null);
      setLoading(false);
      setUsedChunks([]);
      return;
    }

    const history = storedHistoryRef.current;
    if (history.length === 0) {
      const greetingMessage: ChatMessage = {
        role: 'assistant',
        content: firstTimeGreetings[Math.floor(Math.random() * firstTimeGreetings.length)],
      };
      setMessages([greetingMessage]);
    } else {
      setMessages(history);
    }
    
    // Load chunk progress from last session if available
    // Progress will be updated from API responses
    if (letterChunks.length > 0 && !chunkProgress) {
      setChunkProgress({ lastChunk: 0, totalChunks: letterChunks.length });
    }
    soundManager.init().then(() => {
      if (!soundManager.isMusicPlaying()) {
        playThemeAtRandomPoint(soundManager).catch(() => undefined);
      } else {
        soundManager.playMusic(getRandomThemeTrackPath()).catch(() => undefined);
      }
    });
  }, [isOpen, soundManager]);

  const conversation = useMemo(() => {
    if (messages.length === 0) {
      const greetings = [
        "Hi Harper! Daddy wrote you a special letter. Let's read it together!",
        "Hello sweetheart! Ready to hear what Daddy wrote for you?",
        "Hi my sweet Harper! Daddy has a letter just for you.",
      ];
      return [
        {
          role: 'assistant' as const,
          content: greetings[Math.floor(Math.random() * greetings.length)],
        },
      ];
    }
    return messages;
  }, [messages]);

  const getRandomPhoto = () => {
    if (!photoPairs.length) return undefined;
    return photoPairs[Math.floor(Math.random() * photoPairs.length)].image;
  };

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userInput = input.trim();
    setInput('');
    setLoading(true);
    setError(null);

    // Display user's input message
    const userMessage: ChatMessage = { role: 'user', content: userInput };
    const newMessages: ChatMessage[] = [...messages, userMessage];
    setMessages(newMessages);
    
    logChatInput(userMessage);

    // Calculate expected next chunk number for sequential reading
    const expectedNextChunk = chunkProgress 
      ? chunkProgress.lastChunk + 1 
      : 1;
    
    // Select appropriate letter chunk - enforce sequential reading
    const selectedChunk = selectLetterChunk(
      letterChunks, 
      userInput, 
      usedChunks,
      expectedNextChunk
    );
    
    if (!selectedChunk) {
      setError(`Couldn't find the next part. Expected part ${expectedNextChunk}.`);
      setLoading(false);
      return;
    }
    
    // Log chat event
    await logSessionEvent(EventTypes.CHAT, { 
      messageLength: userInput.length,
      isLetterMode: !!selectedChunk,
      chunkNumber: selectedChunk?.chunk,
    });

    // Track used chunk
    setUsedChunks((prev) => [...prev, selectedChunk.chunk].slice(-5)); // Keep last 5

    // Format the chunk prompt for the API
    // The chunk prompt becomes the user message sent to the API
    // (user's original input is shown in UI but chunk content is what gets read)
    const chunkPrompt = formatLetterChunkPrompt(selectedChunk);
    
    // Create messages for API: use stored history + chunk prompt as user message
    // The user's actual input is shown in UI, but chunk content is sent to API
    const apiMessages: ChatMessage[] = [
      ...storedHistoryRef.current,
      { role: 'user', content: chunkPrompt },
    ];

    // Create assistant message placeholder for streaming
    const initialAssistantMessage: ChatMessage = {
      role: 'assistant',
      content: '',
      imageUrl: Math.random() < 0.4 ? getRandomPhoto() : undefined,
    };
    const messagesWithPlaceholder = [...newMessages, initialAssistantMessage];
    setMessages(messagesWithPlaceholder);

    try {
      // Fetch children-based quotes and children quotes for letter mode responses
      const { fetchDaddyQuotes, fetchChildrenQuotes } = await import('./chatService');
      const [allQuotes, childrenQuotes] = await Promise.all([
        fetchDaddyQuotes(),
        fetchChildrenQuotes(),
      ]);
      // Filter to children-based quotes: "joy", "Dad and Harper", "calendar_quote"
      const childrenBasedQuotes = allQuotes.filter((quote) => 
        quote.response_type === 'joy' || 
        quote.response_type === 'Dad and Harper' || 
        quote.response_type === 'calendar_quote'
      );
      
      // Request streaming response with letter chunks, children-based quotes, and children quotes
      // The API will use the chunk prompt as the user message
      const reply = await requestDaddyResponse(
        apiMessages,
        childrenBasedQuotes,
        undefined,
        [selectedChunk],
        childrenQuotes,
        (chunk, fullReply) => {
          // Update message in real-time as chunks arrive
          setMessages((prev) => {
            const updated = [...prev];
            const lastIndex = updated.length - 1;
            if (lastIndex >= 0 && updated[lastIndex].role === 'assistant') {
              updated[lastIndex] = {
                ...updated[lastIndex],
                content: fullReply,
              };
            }
            return updated;
          });
        },
        (progress) => {
          // Update chunk progress when received from API
          setChunkProgress(progress);
        }
      );
      
      // Final update with complete message
      const finalAssistantMessage: ChatMessage = {
        role: 'assistant',
        content: reply,
        imageUrl: initialAssistantMessage.imageUrl,
      };
      const finalMessages = [...newMessages, finalAssistantMessage];
      setMessages(finalMessages);
      const persisted = [...storedHistoryRef.current, userMessage, finalAssistantMessage].slice(-5);
      storedHistoryRef.current = persisted;
      persistMessages(persisted);
    } catch (error) {
      console.error('Chat service error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error details:', errorMessage);
      
      // Fallback: use chunk content directly
      const fallbackContent = selectedChunk.content || "Daddy's thinking about you right now, sweetheart.";
      const fallbackAssistantMessage: ChatMessage = {
        role: 'assistant',
        content: fallbackContent,
        imageUrl: Math.random() < 0.4 ? getRandomPhoto() : undefined,
      };
      const updatedMessages = [...newMessages, fallbackAssistantMessage];
      setMessages(updatedMessages);
      const persisted = [...storedHistoryRef.current, userMessage, fallbackAssistantMessage].slice(-5);
      storedHistoryRef.current = persisted;
      persistMessages(persisted);
      setError(`Chat service is taking a nap. Reading letter directly instead. (${errorMessage})`);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex flex-col">
      <header className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 text-white shadow-lg">
        <div className="flex-1">
          <p className="text-xs uppercase tracking-[0.4em]">Read Dad's</p>
          <h2 className="text-2xl font-extrabold">Letter</h2>
        </div>
        {chunkProgress && chunkProgress.totalChunks > 0 && (
          <div className="mx-4 px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-sm font-semibold">
            Part {chunkProgress.lastChunk + 1} of {chunkProgress.totalChunks} {'<3'}
          </div>
        )}
        <button
          onClick={onClose}
          className="px-4 py-2 rounded-full bg-white text-slate-800 font-semibold shadow hover:scale-105 transition"
        >
          Close
        </button>
      </header>

      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 bg-gradient-to-b from-slate-950 via-slate-900 to-black text-white">
        {conversation.map((message, index) => (
          <div
            key={`${message.role}-${index}`}
            className={`max-w-xl rounded-2xl px-4 py-3 shadow-lg space-y-2 ${
              message.role === 'user'
                ? 'ml-auto bg-pink-500/80'
                : 'mr-auto bg-white/90 text-slate-900'
            }`}
          >
            <div>{message.content}</div>
            {message.imageUrl && message.role === 'assistant' && (
              <img
                src={message.imageUrl}
                alt="Memory moment"
                className="w-full h-40 object-cover rounded-2xl"
              />
            )}
          </div>
        ))}
        {loading && (
          <div className="mr-auto flex items-center gap-2 text-sm text-cyan-200">
            <span>Reading the letter...</span>
            <span className="flex items-center gap-1">
              {[0, 1, 2].map((dot) => (
                <span
                  key={dot}
                  className="inline-block w-2 h-2 rounded-full bg-cyan-200 animate-bounce"
                  style={{ animationDelay: `${dot * 0.2}s` }}
                />
              ))}
            </span>
          </div>
        )}
        {error && <div className="text-xs text-amber-400">{error}</div>}
      </div>

      <div className="p-4 bg-black/60 flex gap-3">
        <textarea
          value={input}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={handleKey}
          placeholder="Tell Daddy what you're thinking or feeling..."
          className="flex-1 rounded-2xl p-4 bg-white/90 text-slate-900 focus:outline-none resize-none h-24 shadow-inner"
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={true}
          data-lpignore="true"
          data-form-type="other"
          data-1p-ignore="true"
        />
        <button
          onClick={sendMessage}
          disabled={loading}
          className="self-end px-6 py-3 rounded-2xl bg-gradient-to-r from-cyan-400 to-fuchsia-500 text-white font-semibold shadow-lg disabled:opacity-50"
        >
          Send
        </button>
      </div>
    </div>
  );
}
