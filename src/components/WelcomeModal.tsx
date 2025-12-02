import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { getOrCreateSession } from '../lib/cookieStorage';

interface WelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ChatMessage {
  role: string;
  content: string;
}

export function WelcomeModal({ isOpen, onClose }: WelcomeModalProps) {
  const [conversationSummary, setConversationSummary] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      fetchConversationSummary();
      // Auto-dismiss after 5 seconds
      const timer = setTimeout(() => {
        onClose();
      }, 5000);
      return () => clearTimeout(timer);
    } else {
      setConversationSummary('');
      setIsLoading(true);
    }
  }, [isOpen, onClose]);

  const fetchConversationSummary = async () => {
    try {
      setIsLoading(true);
      const sessionId = getOrCreateSession();
      const response = await fetch(`/api/chat-history?sessionId=${encodeURIComponent(sessionId)}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch conversation history');
      }

      const data = await response.json();
      const messages: ChatMessage[] = data.messages || [];

      if (messages.length === 0) {
        setConversationSummary("You haven't chatted with Daddy yet. Let's start a conversation!");
      } else {
        // Create a simple, child-friendly summary
        const userMessages = messages.filter((m) => m.role === 'user');
        const assistantMessages = messages.filter((m) => m.role === 'assistant');

        if (userMessages.length > 0 && assistantMessages.length > 0) {
          // Extract a snippet from the last assistant message
          const lastMessage = assistantMessages[assistantMessages.length - 1];
          const snippet = lastMessage.content.substring(0, 100);
          setConversationSummary(
            `Last time, you and Daddy talked about special things. ${snippet}${snippet.length < lastMessage.content.length ? '...' : ''}`
          );
        } else {
          setConversationSummary("You've been chatting with Daddy! Ready to continue?");
        }
      }
    } catch (error) {
      console.error('Error fetching conversation summary:', error);
      setConversationSummary("Welcome back! Ready to chat with Daddy again?");
    } finally {
      setIsLoading(false);
    }
  };

  const stopPropagation = (event: React.MouseEvent | React.TouchEvent) => {
    event.stopPropagation();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          onTouchStart={onClose}
          role="dialog"
          aria-modal="true"
          aria-labelledby="welcome-title"
        >
          <motion.div
            className="relative max-w-md w-full bg-gradient-to-br from-pink-50 via-purple-50 to-cyan-50 rounded-3xl overflow-hidden shadow-[0_25px_60px_rgba(255,105,180,0.4)]"
            onClick={stopPropagation}
            onTouchStart={stopPropagation}
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: 'spring', stiffness: 200, damping: 25 }}
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/50 transition-colors text-gray-600 hover:text-gray-800 z-10"
              aria-label="Close welcome message"
            >
              <X size={20} />
            </button>

            {/* Content */}
            <div className="p-8 text-center space-y-4">
              <motion.h2
                id="welcome-title"
                className="text-3xl font-extrabold bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 bg-clip-text text-transparent"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                Hello Again, Harper!
              </motion.h2>

              {isLoading ? (
                <motion.div
                  className="flex items-center justify-center gap-2 py-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <span className="text-gray-600">Loading your memories...</span>
                  <span className="flex items-center gap-1">
                    {[0, 1, 2].map((dot) => (
                      <span
                        key={dot}
                        className="inline-block w-2 h-2 rounded-full bg-pink-400 animate-bounce"
                        style={{ animationDelay: `${dot * 0.2}s` }}
                      />
                    ))}
                  </span>
                </motion.div>
              ) : (
                <motion.p
                  className="text-gray-700 text-lg leading-relaxed"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  {conversationSummary}
                </motion.p>
              )}

              <motion.div
                className="pt-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                <button
                  onClick={onClose}
                  className="px-6 py-3 rounded-full bg-gradient-to-r from-pink-400 to-purple-500 text-white font-semibold shadow-lg hover:scale-105 active:scale-95 transition-all duration-200"
                >
                  Let's Go!
                </button>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

