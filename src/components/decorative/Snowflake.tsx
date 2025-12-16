import { motion } from 'framer-motion';

interface SnowflakeProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: '1' | '2' | '3';
  className?: string;
  delay?: number;
}

export const Snowflake: React.FC<SnowflakeProps> = ({
  size = 'md',
  variant = '1',
  className = '',
  delay = 0
}) => {
  const sizes = {
    sm: 24,
    md: 32,
    lg: 40
  };

  const selectedSize = sizes[size];

  const variants = {
    '1': (
      <g>
        <line x1="16" y1="4" x2="16" y2="28" stroke="currentColor" strokeWidth="2" />
        <line x1="4" y1="16" x2="28" y2="16" stroke="currentColor" strokeWidth="2" />
        <line x1="8" y1="8" x2="24" y2="24" stroke="currentColor" strokeWidth="2" />
        <line x1="24" y1="8" x2="8" y2="24" stroke="currentColor" strokeWidth="2" />
        <circle cx="16" cy="16" r="3" fill="currentColor" />
        <circle cx="16" cy="4" r="2" fill="currentColor" />
        <circle cx="16" cy="28" r="2" fill="currentColor" />
        <circle cx="4" cy="16" r="2" fill="currentColor" />
        <circle cx="28" cy="16" r="2" fill="currentColor" />
      </g>
    ),
    '2': (
      <g>
        <line x1="16" y1="4" x2="16" y2="28" stroke="currentColor" strokeWidth="1.5" />
        <line x1="4" y1="16" x2="28" y2="16" stroke="currentColor" strokeWidth="1.5" />
        <line x1="8" y1="8" x2="24" y2="24" stroke="currentColor" strokeWidth="1.5" />
        <line x1="24" y1="8" x2="8" y2="24" stroke="currentColor" strokeWidth="1.5" />
        <line x1="10" y1="6" x2="22" y2="6" stroke="currentColor" strokeWidth="1" />
        <line x1="10" y1="26" x2="22" y2="26" stroke="currentColor" strokeWidth="1" />
        <line x1="6" y1="10" x2="6" y2="22" stroke="currentColor" strokeWidth="1" />
        <line x1="26" y1="10" x2="26" y2="22" stroke="currentColor" strokeWidth="1" />
      </g>
    ),
    '3': (
      <g>
        <circle cx="16" cy="16" r="2" fill="currentColor" />
        {[0, 60, 120, 180, 240, 300].map((angle, i) => {
          const rad = (angle * Math.PI) / 180;
          const x1 = 16 + 4 * Math.cos(rad);
          const y1 = 16 + 4 * Math.sin(rad);
          const x2 = 16 + 12 * Math.cos(rad);
          const y2 = 16 + 12 * Math.sin(rad);
          return (
            <g key={i}>
              <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="currentColor" strokeWidth="1.5" />
              <circle cx={x2} cy={y2} r="1.5" fill="currentColor" />
            </g>
          );
        })}
      </g>
    )
  };

  return (
    <motion.svg
      width={selectedSize}
      height={selectedSize}
      viewBox="0 0 32 32"
      className={className}
      initial={{ rotate: 0, opacity: 0.3 }}
      animate={{
        rotate: 360,
        opacity: [0.3, 0.8, 0.3]
      }}
      transition={{
        rotate: {
          duration: 20,
          repeat: Infinity,
          ease: 'linear',
          delay
        },
        opacity: {
          duration: 3,
          repeat: Infinity,
          ease: 'easeInOut',
          delay
        }
      }}
    >
      {variants[variant]}
    </motion.svg>
  );
};
