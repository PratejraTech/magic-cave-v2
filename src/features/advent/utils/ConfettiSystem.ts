import confetti from 'canvas-confetti';

export class ConfettiSystem {
  static burst({
    type,
    count = 50,
    origin = { x: 0.5, y: 0.6 }
  }: {
    type: 'snow' | 'stars' | 'candy' | 'reindeer';
    count?: number;
    origin?: { x: number; y: number };
  }) {
    const colors = {
      snow: ['#FFFFFF', '#E0F6FF', '#B8D4E3'],
      stars: ['#FFD700', '#FFA500', '#FFFF00', '#FFF8DC'],
      candy: ['#FF69B4', '#00FF7F', '#87CEEB', '#FF1493'],
      reindeer: ['#8B4513', '#FFD700', '#FF0000', '#DC143C']
    };

    confetti({
      particleCount: count,
      spread: 70,
      origin,
      colors: colors[type] || colors.snow,
      gravity: 0.8,
      drift: 0.1,
      ticks: 200,
      shapes: type === 'stars' ? ['star'] : ['circle', 'square'],
      scalar: type === 'snow' ? 0.8 : 1
    });
  }

  static snowstorm() {
    const duration = 3000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 2,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#FFFFFF', '#E0F6FF']
      });

      confetti({
        particleCount: 2,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#FFFFFF', '#E0F6FF']
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };

    frame();
  }
}