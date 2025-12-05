import React from 'react';
import { motion } from 'framer-motion';
import { Heart, Snowflake } from 'lucide-react';

import { cn } from '../../lib/utils';
import DarkModeToggle from '../DarkModeToggle';

type WonderlandMood = 'aurora' | 'frost' | 'ember';

interface WonderlandLayoutProps {
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
  mood?: WonderlandMood;
  showSnow?: boolean;
  showButterflies?: boolean;
  showHearts?: boolean;
  showDarkToggle?: boolean;
  className?: string;
  contentClassName?: string;
  children: React.ReactNode;
}

const gradientMap: Record<WonderlandMood, string> = {
  aurora: 'from-[#0f172a] via-[#312e81] to-[#9333ea]',
  frost: 'from-[#0b1120] via-[#0f766e] to-[#14b8a6]',
  ember: 'from-[#3b0764] via-[#9d174d] to-[#f97316]'
};

const glowMap: Record<WonderlandMood, { color: string; size: string }[]> = {
  aurora: [
    { color: 'bg-fuchsia-500/30', size: 'size-[28rem]' },
    { color: 'bg-sky-400/20', size: 'size-[22rem]' },
    { color: 'bg-emerald-400/30', size: 'size-[30rem]' }
  ],
  frost: [
    { color: 'bg-cyan-400/30', size: 'size-[28rem]' },
    { color: 'bg-indigo-400/20', size: 'size-[22rem]' },
    { color: 'bg-emerald-300/30', size: 'size-[30rem]' }
  ],
  ember: [
    { color: 'bg-amber-400/30', size: 'size-[28rem]' },
    { color: 'bg-rose-500/20', size: 'size-[22rem]' },
    { color: 'bg-purple-500/30', size: 'size-[30rem]' }
  ]
};

const ButterflyIcon: React.FC<{ size?: number }> = ({ size = 34 }) => (
  <svg
    viewBox="0 0 64 64"
    width={size}
    height={size}
    fill="currentColor"
    aria-hidden="true"
    focusable="false"
  >
    <ellipse cx="20" cy="20" rx="12" ry="16" opacity="0.85" />
    <ellipse cx="20" cy="46" rx="12" ry="16" opacity="0.55" />
    <ellipse cx="44" cy="20" rx="12" ry="16" opacity="0.85" />
    <ellipse cx="44" cy="46" rx="12" ry="16" opacity="0.55" />
    <rect x="30" y="16" width="4" height="32" rx="1.5" opacity="0.9" />
    <circle cx="32" cy="14" r="2" opacity="0.9" />
  </svg>
);

const SnowLayer: React.FC<{ count?: number }> = ({ count = 32 }) => {
  const flakes = React.useMemo(
    () =>
      Array.from({ length: count }, (_, idx) => ({
        id: idx,
        delay: Math.random() * 4,
        duration: 8 + Math.random() * 6,
        left: Math.random() * 100,
        size: Math.random() * 12 + 6
      })),
    [count]
  );

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {flakes.map((flake) => (
        <motion.span
          key={flake.id}
          className="absolute text-white/70"
          style={{ left: `${flake.left}%`, fontSize: flake.size }}
          initial={{ y: '-5%', opacity: 0 }}
          animate={{ y: '105%', opacity: [0, 1, 0.6, 0] }}
          transition={{ duration: flake.duration, delay: flake.delay, repeat: Infinity, ease: 'linear' }}
        >
          <Snowflake size={flake.size} />
        </motion.span>
      ))}
    </div>
  );
};

const ButterflyLayer: React.FC<{ count?: number }> = ({ count = 8 }) => {
  const butterflies = React.useMemo(
    () =>
      Array.from({ length: count }, (_, idx) => ({
        id: idx,
        delay: Math.random() * 1.5,
        duration: 14 + Math.random() * 12,
        startX: Math.random() * 80,
        startY: Math.random() * 60,
        scale: 0.9 + Math.random() * 0.5,
        color: Math.random() > 0.5 ? 'text-rose-200' : 'text-amber-200'
      })),
    [count]
  );

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {butterflies.map((butterfly) => (
        <motion.div
          key={butterfly.id}
          className={cn('absolute drop-shadow-[0_0_12px_rgba(244,114,182,0.65)]', butterfly.color)}
          style={{ left: `${butterfly.startX}%`, top: `${butterfly.startY}%` }}
          initial={{ opacity: 0, y: 20, scale: butterfly.scale }}
          animate={{
            opacity: [0, 1, 0],
            x: [0, 50, -30, 0],
            y: [0, -40, 20, 0],
            rotate: [0, 14, -12, 0],
            filter: ['blur(0px)', 'blur(0.5px)', 'blur(0px)']
          }}
          transition={{
            duration: butterfly.duration,
            delay: butterfly.delay,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
        >
          <ButterflyIcon size={34} />
        </motion.div>
      ))}
    </div>
  );
};

const LoveLayer: React.FC<{ count?: number }> = ({ count = 10 }) => {
  const hearts = React.useMemo(
    () =>
      Array.from({ length: count }, (_, idx) => ({
        id: idx,
        delay: Math.random() * 3,
        duration: 10 + Math.random() * 6,
        left: 10 + Math.random() * 80,
        bottom: Math.random() * 40,
        scale: 0.6 + Math.random() * 0.8
      })),
    [count]
  );

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {hearts.map((heart) => (
        <motion.div
          key={heart.id}
          className="absolute text-rose-200/80"
          style={{ left: `${heart.left}%`, bottom: `${heart.bottom}%` }}
          initial={{ opacity: 0, scale: heart.scale, y: 0 }}
          animate={{
            opacity: [0, 0.85, 0],
            y: [-10, -60],
            rotate: [0, 8, -8, 0]
          }}
          transition={{
            duration: heart.duration,
            delay: heart.delay,
            repeat: Infinity,
            ease: 'easeOut'
          }}
        >
          <Heart size={22} fill="currentColor" />
        </motion.div>
      ))}
    </div>
  );
};

const SnowShaderCanvas: React.FC = () => {
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const animationRef = React.useRef<number>();

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext('webgl');
    if (!gl) return;

    const vertexShaderSource = `
      attribute vec2 a_position;
      void main() {
        gl_Position = vec4(a_position, 0.0, 1.0);
      }
    `;

    const fragmentShaderSource = `
      precision mediump float;
      uniform vec2 u_resolution;
      uniform float u_time;

      float hash(vec2 p) {
        p = vec2(dot(p, vec2(127.1, 311.7)),
                 dot(p, vec2(269.5, 183.3)));
        return -1.0 + 2.0 * fract(sin(dot(p, vec2(12.9898,78.233))) * 43758.5453123);
      }

      float snowfall(vec2 uv, float scale) {
        float t = u_time * 0.2 + scale * 40.0;
        vec2 gv = fract(uv * scale) - 0.5;
        vec2 id = floor(uv * scale);
        float n = hash(id);
        float glow = smoothstep(0.0, 0.4, 0.5 - length(gv - vec2(n * 0.1, fract(t))));
        return glow;
      }

      void main() {
        vec2 uv = gl_FragCoord.xy / u_resolution.xy;
        vec2 centred = uv * vec2(u_resolution.x / u_resolution.y, 1.0);

        float c = 0.0;
        c += snowfall(centred + 0.02 * u_time, 6.0) * 0.2;
        c += snowfall(centred + vec2(0.3, 0.1) + 0.04 * u_time, 12.0) * 0.4;
        c += snowfall(centred - vec2(0.1, 0.3) + 0.08 * u_time, 24.0) * 0.8;

        vec3 color = vec3(0.8, 0.9, 1.0) * c;
        gl_FragColor = vec4(color, c);
      }
    `;

    const compileShader = (type: number, source: string) => {
      const shader = gl.createShader(type);
      if (!shader) {
        throw new Error('Unable to create shader');
      }
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        const info = gl.getShaderInfoLog(shader);
        gl.deleteShader(shader);
        throw new Error(`Could not compile shader: ${info}`);
      }
      return shader;
    };

    const vertexShader = compileShader(gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = compileShader(gl.FRAGMENT_SHADER, fragmentShaderSource);

    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      const info = gl.getProgramInfoLog(program);
      gl.deleteProgram(program);
      throw new Error(`Could not link program: ${info}`);
    }

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW
    );

    const positionLocation = gl.getAttribLocation(program, 'a_position');
    const resolutionUniform = gl.getUniformLocation(program, 'u_resolution');
    const timeUniform = gl.getUniformLocation(program, 'u_time');

    const resize = () => {
      const { innerWidth, innerHeight } = window;
      canvas.width = innerWidth;
      canvas.height = innerHeight;
      gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
    };

    resize();
    window.addEventListener('resize', resize);

    const render = (time: number) => {
      gl.useProgram(program);
      gl.enableVertexAttribArray(positionLocation);
      gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
      gl.uniform2f(resolutionUniform, canvas.width, canvas.height);
      gl.uniform1f(timeUniform, time * 0.001);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
      animationRef.current = requestAnimationFrame(render);
    };

    animationRef.current = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', resize);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      gl.deleteShader(vertexShader);
      gl.deleteShader(fragmentShader);
      gl.deleteProgram(program);
    };
  }, []);

  return <canvas ref={canvasRef} className="pointer-events-none absolute inset-0 opacity-60" style={{ filter: 'blur(0.5px)' }} />;
};

const GarlandLayer: React.FC = () => {
  const strands = React.useMemo(
    () =>
      Array.from({ length: 3 }, (_, index) => ({
        id: index,
        y: 10 + index * 20,
        colors: ['#fbbf24', '#f472b6', '#34d399', '#60a5fa']
      })),
    []
  );
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {strands.map((strand) => (
        <motion.div
          key={strand.id}
          className="absolute flex w-full justify-between px-6"
          style={{ top: `${strand.y}%` }}
          animate={{ opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 6 + strand.id * 2, repeat: Infinity }}
        >
          {strand.colors.map((color, idx) => (
            <motion.span
              key={`${strand.id}-${idx}`}
              className="size-3 rounded-full shadow-lg"
              style={{ backgroundColor: color }}
              animate={{ opacity: [0.4, 1, 0.4], scale: [0.8, 1.1, 0.8] }}
              transition={{ duration: 2 + idx * 0.4, repeat: Infinity }}
            />
          ))}
        </motion.div>
      ))}
    </div>
  );
};

const CandyLayer: React.FC = () => {
  const candies = React.useMemo(
    () =>
      Array.from({ length: 12 }, (_, idx) => ({
        id: idx,
        left: Math.random() * 100,
        top: Math.random() * 80,
        rotation: Math.random() * 360
      })),
    []
  );

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {candies.map((candy) => (
        <motion.span
          key={candy.id}
          className="absolute text-white/80 drop-shadow-xl"
          style={{ left: `${candy.left}%`, top: `${candy.top}%` }}
          initial={{ rotate: candy.rotation, opacity: 0 }}
          animate={{ rotate: candy.rotation + 20, opacity: [0, 0.5, 0] }}
          transition={{ duration: 14, delay: candy.id * 0.4, repeat: Infinity }}
        >
          🍬
        </motion.span>
      ))}
    </div>
  );
};

const WonderlandLayout: React.FC<WonderlandLayoutProps> = ({
  title,
  subtitle,
  actions,
  mood = 'aurora',
  showSnow = true,
  showButterflies = true,
  showHearts = true,
  showDarkToggle = true,
  className,
  contentClassName,
  children
}) => {
  const glows = glowMap[mood];

  return (
    <div className={cn('wonderland-layout relative min-h-screen w-full overflow-hidden', className)}>
      <div className={cn('absolute inset-0 bg-gradient-to-br', gradientMap[mood])} />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.18),transparent_45%)]" />
      <SnowShaderCanvas />
      <GarlandLayer />
      <CandyLayer />

      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {glows.map((glow, index) => (
          <motion.div
            key={index}
            className={cn('absolute rounded-full blur-3xl', glow.color, glow.size)}
            style={{ top: `${10 + index * 25}%`, left: index % 2 === 0 ? '10%' : '60%' }}
            animate={{ scale: [0.8, 1.05, 0.95], opacity: [0.4, 0.8, 0.5] }}
            transition={{ duration: 10 + index * 3, repeat: Infinity, ease: 'easeInOut' }}
          />
        ))}
      </div>

      {showSnow && <SnowLayer />}
      {showButterflies && <ButterflyLayer />}
      {showHearts && <LoveLayer />}

      <motion.div
        className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-white/10 via-white/5 to-transparent"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.2 }}
      />

      <div className="relative z-10 flex min-h-screen flex-col gap-6 px-4 py-10 text-white sm:px-6 lg:px-12">
        {(title || subtitle || actions || showDarkToggle) && (
          <div className="flex flex-col gap-4 rounded-3xl border border-white/20 bg-white/10 p-6 backdrop-blur-lg lg:flex-row lg:items-center lg:justify-between">
            <div>
              {title && (
                <h1 className="text-3xl font-semibold tracking-tight drop-shadow-md sm:text-4xl">
                  {title}
                  <Heart className="ml-3 inline-block text-rose-200" size={28} />
                </h1>
              )}
              {subtitle && <p className="mt-2 text-base text-white/80 sm:text-lg">{subtitle}</p>}
            </div>
            <div className="flex flex-wrap items-center gap-3">
              {showDarkToggle && <DarkModeToggle />}
              {actions}
            </div>
          </div>
        )}

        <div className={cn('relative w-full flex-1', contentClassName)}>{children}</div>
      </div>
    </div>
  );
};

export default WonderlandLayout;
