import { useState, useEffect } from 'react';
import { Butterfly } from '../../../components/Butterfly';
import { SoundManager } from '../utils/SoundManager';

interface Butterfly {
  id: string;
  type: 'blue' | 'orange' | 'pink' | 'lavender';
  caught: boolean;
  x: number;
  y: number;
}

interface ButterflyCollectionProps {
  onButterflyCaught: (type: string) => void;
}

export function ButterflyCollection({ onButterflyCaught }: ButterflyCollectionProps) {
  const [butterflies, setButterflies] = useState<Butterfly[]>([]);
  const soundManager = SoundManager.getInstance();

  useEffect(() => {
    // Spawn butterflies periodically
    const spawnButterfly = () => {
      const types: ('blue' | 'orange' | 'pink' | 'lavender')[] = ['blue', 'orange', 'pink', 'lavender'];
      const newButterfly: Butterfly = {
        id: Math.random().toString(),
        type: types[Math.floor(Math.random() * types.length)],
        caught: false,
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight * 0.6 + 100
      };
      setButterflies(prev => [...prev, newButterfly]);

      // Remove after 10 seconds if not caught
      setTimeout(() => {
        setButterflies(prev => prev.filter(b => b.id !== newButterfly.id));
      }, 10000);
    };

    const interval = setInterval(spawnButterfly, 15000); // Every 15 seconds
    return () => clearInterval(interval);
  }, []);

  const catchButterfly = (id: string) => {
    setButterflies(prev => prev.map(b =>
      b.id === id ? { ...b, caught: true } : b
    ));
    soundManager.play('butterfly-caught');
    const butterfly = butterflies.find(b => b.id === id);
    if (butterfly) {
      onButterflyCaught(butterfly.type);
    }
    // Remove after animation
    setTimeout(() => {
      setButterflies(prev => prev.filter(b => b.id !== id));
    }, 1000);
  };

  return (
    <div className="absolute inset-0 pointer-events-none">
      {butterflies.map(butterfly => (
        <div
          key={butterfly.id}
          className="absolute cursor-pointer pointer-events-auto butterfly"
          style={{ left: butterfly.x, top: butterfly.y }}
          onClick={() => catchButterfly(butterfly.id)}
        >
          <Butterfly color={butterfly.type} />
        </div>
      ))}
    </div>
  );
}