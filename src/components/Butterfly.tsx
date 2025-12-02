import { useEffect } from 'react';

interface ButterflyProps {
  delay?: number;
  color?: 'blue' | 'orange' | 'pink' | 'lavender';
  x?: number;
  y?: number;
  className?: string;
  onAnimationComplete?: () => void;
}

const colorMap = {
  blue: 'from-sky-300 to-blue-400',
  orange: 'from-orange-300 to-amber-400',
  pink: 'from-pink-300 to-rose-400',
  lavender: 'from-purple-300 to-violet-400',
};

export function Butterfly({ delay = 0, color = 'blue', x, y, className, onAnimationComplete }: ButterflyProps) {
  const gradientClass = colorMap[color];

  useEffect(() => {
    if (!onAnimationComplete) return;
    const timer = setTimeout(() => onAnimationComplete?.(), 2000);
    return () => clearTimeout(timer);
  }, [onAnimationComplete]);

  return (
    <div
      className={`butterfly absolute opacity-70 ${className || ''}`}
      style={{
        animationDelay: `${delay}s`,
        left: x,
        top: y,
      }}
    >
      <div className="butterfly-wings flex gap-1">
        <div className={`wing-left w-8 h-12 rounded-full bg-gradient-to-br ${gradientClass} shadow-lg`}></div>
        <div className={`wing-right w-8 h-12 rounded-full bg-gradient-to-br ${gradientClass} shadow-lg`}></div>
      </div>
    </div>
  );
}
