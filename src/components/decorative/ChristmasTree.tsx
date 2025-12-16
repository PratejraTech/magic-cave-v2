import { motion } from 'framer-motion';

interface ChristmasTreeProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const ChristmasTree: React.FC<ChristmasTreeProps> = ({
  size = 'md',
  className = ''
}) => {
  const sizes = {
    sm: 60,
    md: 80,
    lg: 100
  };

  const selectedSize = sizes[size];

  return (
    <motion.svg
      width={selectedSize}
      height={selectedSize}
      viewBox="0 0 80 100"
      className={className}
      initial={{ scale: 0.95 }}
      animate={{ scale: [0.95, 1.05, 0.95] }}
      transition={{
        duration: 3,
        repeat: Infinity,
        ease: 'easeInOut'
      }}
    >
      {/* Tree trunk */}
      <rect
        x="34"
        y="80"
        width="12"
        height="18"
        fill="#8B4513"
        rx="2"
      />

      {/* Tree layers (from bottom to top) */}
      <path
        d="M20 80 L40 55 L60 80 Z"
        fill="#047857"
        opacity="0.9"
      />
      <path
        d="M25 65 L40 45 L55 65 Z"
        fill="#059669"
        opacity="0.95"
      />
      <path
        d="M28 50 L40 30 L52 50 Z"
        fill="#10b981"
        opacity="0.9"
      />
      <path
        d="M32 35 L40 20 L48 35 Z"
        fill="#34d399"
        opacity="0.95"
      />

      {/* Star on top */}
      <motion.g
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.8, 1, 0.8]
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
      >
        <path
          d="M40 8 L42 15 L49 15 L43 20 L46 27 L40 22 L34 27 L37 20 L31 15 L38 15 Z"
          fill="#fbbf24"
          stroke="#d97706"
          strokeWidth="1"
        />
      </motion.g>

      {/* Ornaments */}
      <motion.circle
        cx="35"
        cy="60"
        r="2.5"
        fill="#dc2626"
        animate={{ opacity: [0.7, 1, 0.7] }}
        transition={{ duration: 2, repeat: Infinity, delay: 0 }}
      />
      <motion.circle
        cx="45"
        cy="62"
        r="2.5"
        fill="#fbbf24"
        animate={{ opacity: [0.7, 1, 0.7] }}
        transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}
      />
      <motion.circle
        cx="38"
        cy="48"
        r="2"
        fill="#dc2626"
        animate={{ opacity: [0.7, 1, 0.7] }}
        transition={{ duration: 2, repeat: Infinity, delay: 0.6 }}
      />
      <motion.circle
        cx="42"
        cy="50"
        r="2"
        fill="#3b82f6"
        animate={{ opacity: [0.7, 1, 0.7] }}
        transition={{ duration: 2, repeat: Infinity, delay: 0.9 }}
      />
    </motion.svg>
  );
};
