import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '../lib/utils';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  text?: string;
  photo?: string;
  children?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeClasses = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl'
};

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  text,
  photo,
  children,
  size = 'md',
  className
}) => {
  const textVariants = {
    hidden: { opacity: 0 },
    visible: (i: number) => ({
      opacity: 1,
      transition: {
        delay: i * 0.02, // Slightly faster
      },
    }),
  };

  // Close on escape key
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Prevent body scroll when modal is open
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-text-primary/40 backdrop-blur-sm"
            aria-hidden="true"
          />

          {/* Modal */}
          <motion.div
            initial={{ scale: 0.95, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 20 }}
            transition={{ duration: 0.3, ease: [0, 0, 0.2, 1] }}
            className={cn(
              'relative w-full bg-white rounded-2xl shadow-2xl overflow-hidden',
              sizeClasses[size],
              className
            )}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? 'modal-title' : undefined}
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-10 rounded-lg p-2 text-text-tertiary hover:text-text-primary hover:bg-bg-soft transition-colors"
              aria-label="Close modal"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Content */}
            {children ? (
              children
            ) : (
              <div className="p-8">
                {/* Title */}
                {title && (
                  <h2
                    id="modal-title"
                    className="text-2xl font-bold text-text-primary mb-4 pr-8"
                  >
                    {title}
                  </h2>
                )}

                {/* Photo */}
                {photo && (
                  <div className="relative -mx-8 mb-6 aspect-video overflow-hidden">
                    <img
                      src={photo}
                      alt={title || 'Modal image'}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                  </div>
                )}

                {/* Text with character animation */}
                {text && (
                  <div className="text-text-secondary leading-relaxed">
                    {text.split('').map((char, i) => (
                      <motion.span
                        key={i}
                        custom={i}
                        variants={textVariants}
                        initial="hidden"
                        animate="visible"
                      >
                        {char}
                      </motion.span>
                    ))}
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Modal compound components for custom content
export const ModalHeader: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className
}) => (
  <div className={cn('px-8 pt-8 pb-4 border-b border-bg-muted', className)}>
    {children}
  </div>
);

export const ModalBody: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className
}) => (
  <div className={cn('px-8 py-6', className)}>
    {children}
  </div>
);

export const ModalFooter: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className
}) => (
  <div className={cn('px-8 pb-8 pt-4 flex items-center justify-end gap-3 border-t border-bg-muted', className)}>
    {children}
  </div>
);

export const ModalTitle: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className
}) => (
  <h2 className={cn('text-2xl font-semibold text-text-primary pr-8', className)}>
    {children}
  </h2>
);

export const ModalDescription: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className
}) => (
  <p className={cn('text-sm text-text-secondary mt-2', className)}>
    {children}
  </p>
);

export default Modal;
