import { motion } from 'framer-motion';

const floatingHearts = Array.from({ length: 14 }, (_, index) => ({
  id: index,
  size: 30 + Math.random() * 40,
  delay: Math.random() * 4,
  duration: 8 + Math.random() * 6,
  x: Math.random() * 100,
  y: 20 + Math.random() * 60,
}));

const shootingStars = Array.from({ length: 3 }, (_, index) => ({
  id: index,
  delay: index * 3,
}));

export function EnchantedBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* dreamy gradient that subtly shifts colors */}
      <motion.div
        className="absolute inset-0"
        animate={{
          background: [
            'radial-gradient(circle at top, rgba(19,16,63,0.95), rgba(4,9,35,0.95) 40%, rgba(1,4,15,0.9))',
            'radial-gradient(circle at 20% 20%, rgba(18,8,41,0.98), rgba(5,16,55,0.96) 50%, rgba(0,0,0,0.92))',
            'radial-gradient(circle at 80% 0%, rgba(14,12,66,0.98), rgba(9,14,48,0.95) 40%, rgba(2,5,20,0.9))',
          ],
        }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* neon aurora */}
      <motion.div
        className="absolute inset-0"
        animate={{
          opacity: [0.4, 0.8, 0.4],
          filter: [
            'blur(40px) hue-rotate(0deg)',
            'blur(40px) hue-rotate(45deg)',
            'blur(40px) hue-rotate(0deg)',
          ],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          background:
            'radial-gradient(circle at 30% 20%, rgba(0,255,255,0.4), transparent 45%), radial-gradient(circle at 70% 30%, rgba(255,0,184,0.4), transparent 55%), radial-gradient(circle at 60% 80%, rgba(110,0,255,0.35), transparent 60%)',
        }}
      />

      {/* glowing horizon */}
      <motion.div
        className="absolute bottom-0 left-0 w-full h-1/3"
        initial={{ opacity: 0.6 }}
        animate={{ opacity: [0.4, 0.8, 0.4] }}
        transition={{ duration: 6, repeat: Infinity }}
        style={{
          background:
            'linear-gradient(180deg, rgba(255,255,255,0), rgba(255,0,179,0.35) 55%, rgba(255,128,0,0.5))',
        }}
      />

      {/* orbiting hearts */}
      {floatingHearts.map((heart) => (
        <motion.span
          key={heart.id}
          className="absolute text-transparent drop-shadow-[0_0_12px_rgba(255,0,175,0.8)]"
          style={{
            fontSize: heart.size,
            left: `${heart.x}%`,
            top: `${heart.y}%`,
            background:
              'linear-gradient(180deg, rgba(255,99,233,0.9), rgba(0,255,255,0.9))',
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
          }}
          animate={{
            y: ['0%', '-30%', '0%'],
            x: ['0%', '5%', '-3%', '0%'],
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: heart.duration,
            delay: heart.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          ❤
        </motion.span>
      ))}

      {/* shooting stars to add extra magic */}
      {shootingStars.map((star) => (
        <motion.div
          key={star.id}
          className="absolute w-24 h-1 rounded-full shadow-[0_0_12px_rgba(0,255,255,0.8)]"
          style={{
            top: `${10 + star.id * 12}%`,
            left: '-20%',
            background:
              'linear-gradient(90deg, rgba(0,255,255,1), rgba(255,0,255,0.6), transparent)',
          }}
          animate={{ x: ['-20%', '120%'], opacity: [0, 1, 0] }}
          transition={{ duration: 4, delay: star.delay, repeat: Infinity, ease: 'easeOut' }}
        />
      ))}
    </div>
  );
}
