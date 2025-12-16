import { motion } from 'framer-motion';

interface ChristmasOrnamentProps {
  color?: 'emerald' | 'burgundy' | 'gold';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const ChristmasOrnament: React.FC<ChristmasOrnamentProps> = ({
  color = 'emerald',
  size = 'md',
  className = ''
}) => {
  const colors = {
    emerald: { fill: '#047857', shine: '#10b981', shadow: '#065f46' },
    burgundy: { fill: '#991b1b', shine: '#dc2626', shadow: '#7f1d1d' },
    gold: { fill: '#d97706', shine: '#f59e0b', shadow: '#b45309' }
  };

  const sizes = {
    sm: 48,
    md: 64,
    lg: 80
  };

  const selectedColor = colors[color];
  const selectedSize = sizes[size];

  return (
    <motion.svg
      width={selectedSize}
      height={selectedSize}
      viewBox="0 0 64 64"
      className={className}
      initial={{ rotate: -10, scale: 0.9 }}
      animate={{
        rotate: [- 10, 10, -10],
        scale: [0.9, 1, 0.9]
      }}
      transition={{
        duration: 4,
        repeat: Infinity,
        ease: 'easeInOut'
      }}
    >
      {/* Ornament cap/hook */}
      <path
        d="M28 4 L28 8 L24 10 L40 10 L36 8 L36 4 Z"
        fill="#d4af37"
        opacity="0.9"
      />
      <circle cx="32" cy="6" r="2" fill="#b8860b" />

      {/* Main ornament ball */}
      <circle
        cx="32"
        cy="36"
        r="22"
        fill={selectedColor.fill}
        opacity="0.95"
      />

      {/* Shine/highlight */}
      <ellipse
        cx="26"
        cy="30"
        rx="8"
        ry="10"
        fill={selectedColor.shine}
        opacity="0.4"
      />

      {/* Shadow */}
      <ellipse
        cx="38"
        cy="42"
        rx="6"
        ry="8"
        fill={selectedColor.shadow}
        opacity="0.3"
      />

      {/* Decorative pattern */}
      <circle cx="32" cy="28" r="2" fill="white" opacity="0.6" />
      <circle cx="28" cy="36" r="1.5" fill="white" opacity="0.5" />
      <circle cx="36" cy="38" r="1.5" fill="white" opacity="0.5" />
    </motion.svg>
  );
};
