import { useEffect, useRef, useState } from 'react';

const MESSAGE = 'I Love You, Harper - Daddy';
const STREAM_INTERVAL_MS = 10000;
const LETTER_DELAY_MS = 120;

export function LoveNote() {
  const [displayed, setDisplayed] = useState('');
  const timeoutsRef = useRef<number[]>([]);
  const intervalRef = useRef<number | null>(null);

  const startStreaming = () => {
    timeoutsRef.current.forEach((timeoutId) => window.clearTimeout(timeoutId));
    timeoutsRef.current = [];
    setDisplayed('');

    MESSAGE.split('').forEach((char, index) => {
      const timeoutId = window.setTimeout(() => {
        setDisplayed((prev) => prev + char);
      }, LETTER_DELAY_MS * index);
      timeoutsRef.current.push(timeoutId);
    });
  };

  useEffect(() => {
    startStreaming();
    intervalRef.current = window.setInterval(startStreaming, STREAM_INTERVAL_MS);

    return () => {
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
      }
      timeoutsRef.current.forEach((timeoutId) => window.clearTimeout(timeoutId));
    };
  }, []);

  return (
    <div className="flex flex-col items-center gap-4 text-center">
      <img
        src="/assets/love-heart.svg"
        alt="Love heart"
        className="w-32 h-auto drop-shadow-[0_0_30px_rgba(255,111,177,0.6)] animate-pulse"
      />
      <div className="relative px-6 py-4 bg-white/90 rounded-3xl shadow-[0_20px_45px_rgba(0,0,0,0.25)]">
        <span className="text-2xl font-bold bg-gradient-to-r from-pink-500 via-rose-500 to-amber-400 text-transparent bg-clip-text">
          {displayed}
        </span>
        <span className="ml-1 inline-block w-2 h-6 bg-pink-400 animate-pulse align-middle" />
      </div>
    </div>
  );
}
