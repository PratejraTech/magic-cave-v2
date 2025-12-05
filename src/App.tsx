import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Sparkles,
  Snowflake,
  Cpu,
  Satellite,
  Shield,
  Mail,
  Phone,
  MapPin,
  ArrowRight
} from 'lucide-react';

type Route = 'Home' | 'About' | 'Features' | 'Contact';

type NavLink = {
  label: string;
  value: Route;
};

type Feature = {
  title: string;
  desc: string;
  icon: JSX.Element;
};

type LayoutProps = {
  activeRoute: Route;
  onNav: (value: Route) => void;
};

type GlassProps = {
  className?: string;
  children: React.ReactNode;
};

const navLinks: NavLink[] = ['Home', 'About', 'Features', 'Contact'].map(route => ({
  label: route,
  value: route as Route
}));

const featureTiles: Feature[] = [
  {
    title: 'Naughty/Nice Algo',
    desc: 'Ethically routed sentiment detection keeps every list perfectly balanced.',
    icon: <Shield className="h-5 w-5 text-emerald-300" />
  },
  {
    title: 'Reindeer Velocity Tracking',
    desc: 'Monitor sleigh telemetry with AI-powered trajectory optimization.',
    icon: <Satellite className="h-5 w-5 text-rose-300" />
  },
  {
    title: 'Magic Cave Calendars',
    desc: 'Infinite customizable cyber-advent journeys for families worldwide.',
    icon: <Cpu className="h-5 w-5 text-cyan-300" />
  },
  {
    title: 'Aurora Forecasting',
    desc: 'Predict atmospheric sparkle for cinematic doorstep arrivals.',
    icon: <Snowflake className="h-5 w-5 text-blue-300" />
  }
];

const bentoLayout = [
  { span: 'md:col-span-2', featureIndex: 0 },
  { span: 'md:col-span-1', featureIndex: 1 },
  { span: 'md:col-span-1', featureIndex: 2 },
  { span: 'md:col-span-2', featureIndex: 3 }
];

const GlassCard: React.FC<GlassProps> = ({ children, className = '' }) => (
  <div className={`rounded-3xl border border-white/20 bg-white/10 p-8 text-white shadow-[0_20px_80px_rgba(0,0,0,0.5)] backdrop-blur-2xl ${className}`}>
    {children}
  </div>
);

const Layout: React.FC<LayoutProps> = ({ activeRoute, onNav }) => (
  <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-900/70 backdrop-blur-xl">
    <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-6 px-6 py-4">
      <div className="flex items-center gap-3 text-white">
        <motion.div
          className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400/80 to-rose-500/90 shadow-lg"
          whileHover={{ rotate: 6 }}
          transition={{ type: 'spring', stiffness: 200 }}
        >
          <Sparkles className="h-5 w-5 text-white" />
        </motion.div>
        <div>
          <p className="text-sm uppercase tracking-[0.25em] text-emerald-200">Magic Cave</p>
          <p className="text-lg font-semibold">Cyber Calendars</p>
        </div>
      </div>
      <nav className="flex flex-wrap items-center gap-4 text-sm font-semibold text-white">
        {navLinks.map(link => (
          <button
            key={link.value}
            onClick={() => onNav(link.value)}
            className={`px-3 py-1 transition ${
              activeRoute === link.value ? 'border-b border-emerald-300 text-emerald-300' : 'text-white/70 hover:text-white'
            }`}
          >
            {link.label}
          </button>
        ))}
      </nav>
    </div>
  </header>
);

const Footer = () => (
  <footer className="border-t border-white/10 bg-slate-900/60 py-6 text-center text-sm text-white/70">
    © {new Date().getFullYear()} Magic Cave Calendars · Cyber-Christmas Intelligence
  </footer>
);

const Hero = () => (
  <GlassCard className="space-y-6">
    <p className="text-xs uppercase tracking-[0.4em] text-white/70">Project NorthPole-AI</p>
    <h1 className="text-4xl font-extrabold leading-tight sm:text-5xl">
      Intelligence <span className="text-emerald-300">for the Holidays</span>
    </h1>
    <p className="text-lg text-white/80">
      Magic Cave Calendars fuses Iron Man diagnostics with Santa’s workshop. Design, track, and deliver personalized wonder
      from one cyber-snowfield console.
    </p>
    <motion.button
      whileHover={{ scale: 1.04, boxShadow: '0px 0px 35px rgba(16, 185, 129, 0.5)' }}
      className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-emerald-400 via-rose-500 to-cyan-400 px-6 py-3 font-semibold text-slate-900"
    >
      Launch Sleigh <ArrowRight className="h-4 w-4" />
    </motion.button>
  </GlassCard>
);

const FeaturesGrid = () => (
  <div className="grid gap-4 md:grid-cols-3">
    {bentoLayout.map(({ span, featureIndex }) => {
      const feature = featureTiles[featureIndex];
      return (
        <GlassCard key={feature.title} className={span}>
          <div className="flex flex-col gap-3">
            <div>{feature.icon}</div>
            <h3 className="text-xl font-semibold">{feature.title}</h3>
            <p className="text-sm text-white/80">{feature.desc}</p>
          </div>
        </GlassCard>
      );
    })}
  </div>
);

const AboutPanel = () => (
  <GlassCard>
    <p className="text-sm uppercase tracking-[0.3em] text-white/70">About Magic Cave</p>
    <h2 className="mt-3 text-3xl font-bold">Mission Control for Santa’s AI Era</h2>
    <p className="mt-4 text-white/80">
      Project NorthPole-AI orchestrates supply chains of wonder. From routing candy drones to calibrating aurora holograms,
      our neural network of elves keeps every holiday beat perfectly synced.
    </p>
  </GlassCard>
);

const ContactPanel = () => (
  <GlassCard className="space-y-6">
    <h2 className="text-2xl font-semibold">Contact HQ</h2>
    <div className="grid gap-4 sm:grid-cols-2">
      {[
        { icon: <Mail className="h-4 w-4" />, label: 'Mission Comms', value: 'santa@magiccave.ai' },
        { icon: <Phone className="h-4 w-4" />, label: 'Direct Line', value: '+1 (555) 12-SLEIGH' },
        { icon: <MapPin className="h-4 w-4" />, label: 'Aurora Hub', value: 'Hidden Polar Coordinates' }
      ].map(info => (
        <div key={info.label} className="rounded-2xl border border-white/10 bg-white/5 p-3 text-sm">
          <span className="flex items-center gap-2 text-white/70">
            {info.icon} {info.label}
          </span>
          <p className="mt-2 font-semibold text-white">{info.value}</p>
        </div>
      ))}
    </div>
    <form className="grid gap-4">
      <input className="rounded-2xl border border-white/30 bg-transparent px-4 py-3 text-white placeholder:text-white/50" placeholder="Codename" />
      <input className="rounded-2xl border border-white/30 bg-transparent px-4 py-3 text-white placeholder:text-white/50" placeholder="Secure Email" />
      <textarea className="rounded-2xl border border-white/30 bg-transparent px-4 py-3 text-white placeholder:text-white/50" rows={3} placeholder="Mission Brief" />
      <button className="rounded-full border border-white/40 bg-white/20 px-5 py-2 font-semibold text-white transition hover:bg-white/30">
        Dispatch
      </button>
    </form>
  </GlassCard>
);

// Neon holographic shader inspired by 21st.dev shader patterns
const NeonShaderCanvas = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const gl = canvas.getContext('webgl');
    if (!gl) return;

    const vertexSource = `
      attribute vec2 a_position;
      void main(){
        gl_Position = vec4(a_position, 0.0, 1.0);
      }
    `;

    const fragmentSource = `
      precision highp float;
      uniform vec2 u_resolution;
      uniform float u_time;

      vec2 hash(vec2 p){
        p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
        return -1.0 + 2.0 * fract(sin(p) * 43758.5453123);
      }

      float noise(vec2 p){
        vec2 i = floor(p);
        vec2 f = fract(p);
        vec2 u = f*f*(3.0-2.0*f);
        return mix(mix(dot(hash(i + vec2(0.0,0.0)), f - vec2(0.0,0.0)),
                       dot(hash(i + vec2(1.0,0.0)), f - vec2(1.0,0.0)), u.x),
                   mix(dot(hash(i + vec2(0.0,1.0)), f - vec2(0.0,1.0)),
                       dot(hash(i + vec2(1.0,1.0)), f - vec2(1.0,1.0)), u.x), u.y);
      }

      void main(){
        vec2 uv = gl_FragCoord.xy / u_resolution.xy;
        vec2 st = (uv - 0.5) * vec2(u_resolution.x / u_resolution.y, 1.0);
        float t = u_time * 0.25;

        float grid = abs(sin(st.x * 12.0 + t)) + abs(sin(st.y * 12.0 - t));
        float glow = smoothstep(1.2, 0.0, grid);
        float holo = noise(st * 4.0 + t);

        vec3 color = vec3(0.05, 0.12, 0.18);
        color += vec3(0.0, 0.8, 0.6) * glow;
        color += vec3(1.0, 0.2, 0.4) * holo * 0.35;

        gl_FragColor = vec4(color, 1.0);
      }
    `;

    const compile = (type: number, source: string) => {
      const shader = gl.createShader(type);
      if (!shader) throw new Error('shader creation failed');
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        const info = gl.getShaderInfoLog(shader);
        gl.deleteShader(shader);
        throw new Error(info || 'shader error');
      }
      return shader;
    };

    const vertex = compile(gl.VERTEX_SHADER, vertexSource);
    const fragment = compile(gl.FRAGMENT_SHADER, fragmentSource);
    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vertex);
    gl.attachShader(program, fragment);
    gl.linkProgram(program);

    const resolutionUniform = gl.getUniformLocation(program, 'u_resolution');
    const timeUniform = gl.getUniformLocation(program, 'u_time');
    const positionLocation = gl.getAttribLocation(program, 'a_position');
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]), gl.STATIC_DRAW);

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      gl.viewport(0, 0, canvas.width, canvas.height);
    };
    resize();
    window.addEventListener('resize', resize);

    let raf: number;
    const render = (time: number) => {
      gl.useProgram(program);
      gl.enableVertexAttribArray(positionLocation);
      gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
      gl.uniform2f(resolutionUniform, canvas.width, canvas.height);
      gl.uniform1f(timeUniform, time * 0.001);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
      raf = requestAnimationFrame(render);
    };
    raf = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      gl.deleteShader(vertex);
      gl.deleteShader(fragment);
      gl.deleteProgram(program);
    };
  }, []);

  return <canvas ref={canvasRef} className="pointer-events-none fixed inset-0 opacity-80" />;
};

const Background = () => (
  <>
    <div className="fixed inset-0 bg-slate-950" aria-hidden />
    <NeonShaderCanvas />
    <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top,_rgba(248,113,113,0.25),_transparent_45%)]" aria-hidden />
    <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_bottom,_rgba(16,185,129,0.3),_transparent_45%)]" aria-hidden />
    <style>{`
      @keyframes snowfall {
        0% { transform: translateY(-10%); opacity: 0; }
        30% { opacity: 0.8; }
        100% { transform: translateY(110%); opacity: 0; }
      }
    `}</style>
    <div className="pointer-events-none fixed inset-0 overflow-hidden">
      {Array.from({ length: 80 }).map((_, idx) => (
        <span
          key={idx}
          className="absolute text-white/40"
          style={{
            left: `${Math.random() * 100}%`,
            animation: `snowfall ${7 + Math.random() * 7}s linear ${Math.random() * 4}s infinite`,
            fontSize: `${6 + Math.random() * 10}px`
          }}
        >
          ❆
        </span>
      ))}
    </div>
  </>
);

export default function App() {
  const [activeRoute, setActiveRoute] = useState<Route>('Home');

  const content = useMemo(() => {
    switch (activeRoute) {
      case 'About':
        return (
          <div className="grid gap-8">
            <AboutPanel />
            <Hero />
          </div>
        );
      case 'Features':
        return (
          <div className="grid gap-8">
            <Hero />
            <FeaturesGrid />
          </div>
        );
      case 'Contact':
        return (
          <div className="grid gap-8">
            <Hero />
            <ContactPanel />
          </div>
        );
      default:
        return (
          <div className="grid gap-8">
            <Hero />
            <FeaturesGrid />
            <AboutPanel />
            <ContactPanel />
          </div>
        );
    }
  }, [activeRoute]);

  return (
    <div className="min-h-screen text-white">
      <Background />
      <Layout activeRoute={activeRoute} onNav={setActiveRoute} />
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-10">{content}</main>
      <Footer />
    </div>
  );
}
