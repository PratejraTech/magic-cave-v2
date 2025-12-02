import { motion } from 'framer-motion';

export function NorthernLights() {
  const colors = [
    'rgba(0,255,127,0.3)',
    'rgba(0,191,255,0.2)',
    'rgba(138,43,226,0.3)'
  ];

  return (
    <div className="northern-lights absolute top-0 left-0 w-full h-1/3 overflow-hidden pointer-events-none">
      <motion.div
        className="absolute top-0 left-0 w-full h-full"
        animate={{
          background: [
            `linear-gradient(180deg, ${colors[0]} 0%, ${colors[1]} 50%, ${colors[2]} 100%)`,
            `linear-gradient(180deg, ${colors[2]} 0%, ${colors[0]} 50%, ${colors[1]} 100%)`,
            `linear-gradient(180deg, ${colors[1]} 0%, ${colors[2]} 50%, ${colors[0]} 100%)`
          ]
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
    </div>
  );
}