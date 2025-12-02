import { motion } from 'framer-motion';
import { Butterfly } from '../../../components/Butterfly';

interface ButterflyPathProps {
  path: { x: number; y: number }[];
  butterflies: { type: 'blue' | 'orange' | 'pink' | 'lavender'; position: number }[];
}

export function ButterflyPath({ path, butterflies }: ButterflyPathProps) {
  return (
    <svg className="absolute inset-0 pointer-events-none" style={{ width: '100%', height: '100%' }}>
      {/* Draw the path */}
      <motion.path
        d={`M ${path.map(p => `${p.x},${p.y}`).join(' L ')}`}
        stroke="rgba(255, 255, 255, 0.3)"
        strokeWidth="4"
        fill="none"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 3, ease: "easeInOut" }}
      />

      {/* Place butterflies along the path */}
      {butterflies.map((butterfly, index) => {
        const point = path[Math.floor(butterfly.position * (path.length - 1))];
        return (
          <motion.g
            key={index}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: index * 0.5 }}
            style={{ transform: `translate(${point.x - 20}px, ${point.y - 20}px)` }}
          >
            <Butterfly color={butterfly.type} />
          </motion.g>
        );
      })}
    </svg>
  );
}