import { useMemo, useState } from 'react';
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
    title: 'Storybook Tiles',
    desc: 'Fill each day with bedtime prompts, doodles, and gentle wishes the kids can revisit.',
    icon: <Shield className="h-5 w-5 text-emerald-300" />
  },
  {
    title: 'Shared Countdown',
    desc: 'Invite grandparents, cousins, and friends so everyone opens the same surprise together.',
    icon: <Satellite className="h-5 w-5 text-rose-300" />
  },
  {
    title: 'Village Templates',
    desc: 'Choose from snowy cottages, twinkling lights, or gingerbread motifs—instant previews included.',
    icon: <Cpu className="h-5 w-5 text-cyan-300" />
  },
  {
    title: 'Keepsake Library',
    desc: 'Photos, voice notes, and hand-written letters stay organized for future Decembers.',
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
  <div className={`rounded-3xl border border-white/15 bg-black/40 p-10 text-white shadow-[0_25px_90px_rgba(0,0,0,0.65)] backdrop-blur-2xl ${className}`}>
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
          <p className="text-sm uppercase tracking-[0.25em] text-emerald-200">Magic Village</p>
          <p className="text-lg font-semibold">Family Calendars</p>
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

const Hero: React.FC<{ onStart: () => void }> = ({ onStart }) => (
  <GlassCard className="space-y-8">
    <p className="text-xs uppercase tracking-[0.4em] text-white/70">Magic Village Calendars</p>
    <h1 className="text-4xl font-extrabold leading-tight sm:text-5xl">
      A cozy village of surprises for <span className="text-emerald-300">every child</span>.
    </h1>
    <p className="text-lg text-white/80 max-w-3xl">
      Craft each day with notes, songs, and tiny quests so mornings feel enchanted. Families near or far can open the same window,
      share reactions, and build a December scrapbook that lasts long after the snow melts.
    </p>
    <motion.button
      whileHover={{ scale: 1.04, boxShadow: '0px 0px 35px rgba(16, 185, 129, 0.5)' }}
      className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-emerald-300 via-teal-400 to-cyan-400 px-8 py-3 font-semibold text-slate-900"
      onClick={onStart}
    >
      Start Your Calendar <ArrowRight className="h-4 w-4" />
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
    <p className="text-sm uppercase tracking-[0.3em] text-white/70">Why families choose Magic Village</p>
    <h2 className="mt-4 text-3xl font-bold">Keep wonder, kindness, and togetherness close.</h2>
    <div className="mt-5 space-y-4 text-white/80 leading-relaxed">
      <p>
        We designed Magic Village so caregivers, siblings, and friends can weave one December story. Choose a village theme,
        invite everyone, and let the app nudge you to write a note or upload a photo each evening.
      </p>
      <p>
        Kids wake up to heartfelt messages, grandparents hear their laughter, and parents keep all those little memories safe.
        No stress—just a gentle rhythm of connection.
      </p>
    </div>
  </GlassCard>
);

const ContactPanel = () => (
  <GlassCard className="space-y-8">
    <h2 className="text-2xl font-semibold">Need help planning your village?</h2>
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
      <input className="rounded-2xl border border-white/30 bg-black/30 px-4 py-3 text-white placeholder:text-white/50" placeholder="Name" />
      <input className="rounded-2xl border border-white/30 bg-black/30 px-4 py-3 text-white placeholder:text-white/50" placeholder="Email" />
      <textarea className="rounded-2xl border border-white/30 bg-black/30 px-4 py-3 text-white placeholder:text-white/50" rows={3} placeholder="Tell us about your family traditions" />
      <button className="rounded-full border border-white/40 bg-white/15 px-5 py-2 font-semibold text-white transition hover:bg-white/25">
        Send Message
      </button>
    </form>
  </GlassCard>
);

// Neon holographic shader inspired by 21st.dev shader patterns
const Background = () => (
  <>
    <div className="fixed inset-0 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900" aria-hidden />
    <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top,_rgba(248,189,141,0.25),_transparent_40%)]" aria-hidden />
    <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_bottom,_rgba(34,197,94,0.25),_transparent_45%)]" aria-hidden />
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
  const handleStartCalendar = () => {
    window.location.href = '/auth';
  };

  const content = useMemo(() => {
    switch (activeRoute) {
      case 'About':
        return (
          <div className="grid gap-8">
            <AboutPanel />
            <Hero onStart={handleStartCalendar} />
          </div>
        );
      case 'Features':
        return (
          <div className="grid gap-8">
            <Hero onStart={handleStartCalendar} />
            <FeaturesGrid />
          </div>
        );
      case 'Contact':
        return (
          <div className="grid gap-8">
            <Hero onStart={handleStartCalendar} />
            <ContactPanel />
          </div>
        );
      default:
        return (
          <div className="grid gap-8">
            <Hero onStart={handleStartCalendar} />
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
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-12 px-6 py-12">{content}</main>
      <Footer />
    </div>
  );
}
