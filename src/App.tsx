import type { ReactNode } from 'react';
import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, Snowflake } from 'lucide-react';
import Header from './components/Header';

type Route = 'Experience' | 'Templates' | 'Gifts' | 'Contact';
type CardState = 'default' | 'hover' | 'pressed' | 'disabled';

type NavLink = {
  label: string;
  value: Route;
};

type HeroCard = {
  title: string;
  body: string;
  meta: string;
  accent: 'snow' | 'butterfly';
  state: CardState;
};

type SectionCopy = {
  eyebrow: string;
  title: string;
  description: string;
  cards: HeroCard[];
  modalTitle: string;
  modalDescription: string;
};

const ROUTES: Route[] = ['Experience', 'Templates', 'Gifts', 'Contact'];

const navLinks: NavLink[] = ROUTES.map(route => ({
  label: route,
  value: route
}));

const sections: Record<Route, SectionCopy> = {
  Experience: {
    eyebrow: 'Magic Cave Calendars · Neural Village',
    title: 'Magic Cave Calendars orchestrates AI wonder for every December dawn.',
    description:
      'A neural scene engine layers watercolor gradients, volumetric snow, and glowing butterflies so each reveal feels handcrafted for your family.',
    cards: [
      {
        title: 'Adaptive Story Scheduler',
        body: 'Syncs daily reveals with each timezone so the skyline glows right when your kids wake up.',
        meta: 'Live tonight · UTC auto-aligned',
        accent: 'snow',
        state: 'hover'
      },
      {
        title: 'Butterfly Couriers',
        body: 'Send lilac-winged messages that flutter across the hero before a tile unlocks.',
        meta: '3 active routes',
        accent: 'butterfly',
        state: 'default'
      }
    ],
    modalTitle: 'Reserve a guided preview',
    modalDescription: 'Share your family’s details and we will choreograph a private starlight show with sample tiles.'
  },
  Templates: {
    eyebrow: 'Magic Cave Templates · Frost Ops',
    title: 'AI style conductor for snowy cottages and neon ports alike.',
    description: 'Preview experiential palettes, typography, and iconography before the kids ever see a refresh.',
    cards: [
      {
        title: 'Village Palette Sync',
        body: 'Updates typography, gradients, and iconography in under 120ms using design tokens.',
        meta: '3 core palettes',
        accent: 'snow',
        state: 'pressed'
      },
      {
        title: 'Template Health',
        body: 'Detects contrast, glow balance, and reading comfort for every device.',
        meta: 'All metrics optimal',
        accent: 'butterfly',
        state: 'hover'
      }
    ],
    modalTitle: 'Preview a theme live',
    modalDescription: 'Pick a favorite vibe and we will drop you a secure preview calendar link with mock tiles.'
  },
  Gifts: {
    eyebrow: 'Gift Layer · WonderOps',
    title: 'Quantum gift vault for experiences, downloads, and cozy notes.',
    description: 'Each tile carries AI-personalized prompts, AR snow globes, or reward codes ready for a child unlock moment.',
    cards: [
      {
        title: 'Gift Vault Queue',
        body: 'Encrypts downloads with expiring keys and tracks which child opened which window.',
        meta: '25 gifts armed',
        accent: 'snow',
        state: 'default'
      },
      {
        title: 'Warm Glow Ledger',
        body: 'Logs gratitude notes, butterfly replies, and heartbeats from the child dashboard.',
        meta: 'Realtime sync on',
        accent: 'butterfly',
        state: 'hover'
      }
    ],
    modalTitle: 'Schedule a gift drop',
    modalDescription: 'Tell us the unlock plan and we will queue signed links plus butterfly reminders.'
  },
  Contact: {
    eyebrow: 'Contact · Polar Ops Desk',
    title: 'Need custom automations or multi-family scenes?',
    description:
      'Our team can sculpt bespoke shaders, parent workflows, and analytics to match your seasonal story.',
    cards: [
      {
        title: 'Concierge Track',
        body: 'Dedicated producer, template artist, and security partner in one frosted workspace.',
        meta: 'Open for 5 families',
        accent: 'snow',
        state: 'hover'
      },
      {
        title: 'Village Signals',
        body: 'Live contact pulses from village lanterns, butterfly couriers, and SMS failsafe.',
        meta: '+1 (555) 12-SLEIGH',
        accent: 'butterfly',
        state: 'default'
      }
    ],
    modalTitle: 'Book a strategy call',
    modalDescription: 'Drop your details and we will reach out within one starlight cycle.'
  }
};

const cn = (...classes: Array<string | undefined | false>) => classes.filter(Boolean).join(' ');

const ButterflyIcon = () => (
  <svg width="22" height="18" viewBox="0 0 22 18" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M7 16C3.5 16 1 13.493 1 10s2.5-6 6-6c1.2 0 2.58.398 4 .998V1.5c0-.828.672-1.5 1.5-1.5S14 0.672 14 1.5v3.498C15.42 4.398 16.8 4 18 4c3.5 0 6 2.507 6 6s-2.5 6-6 6c-1.638 0-3.434-.786-5-1.998C10.434 15.214 8.638 16 7 16Z"
      fill="url(#wingGlow)"
      opacity="0.65"
    />
    <defs>
      <linearGradient id="wingGlow" x1="1" y1="4" x2="24" y2="16" gradientUnits="userSpaceOnUse">
        <stop stopColor="#A0E8FF" />
        <stop offset="1" stopColor="#C7B5FF" />
      </linearGradient>
    </defs>
  </svg>
);

const villageHomes = [
  { left: '6%', width: 110, height: 120, windows: 3 },
  { left: '18%', width: 90, height: 140, windows: 2 },
  { left: '30%', width: 150, height: 160, windows: 4 },
  { left: '47%', width: 130, height: 150, windows: 3 },
  { left: '63%', width: 100, height: 132, windows: 2 },
  { left: '76%', width: 90, height: 115, windows: 2 },
  { left: '86%', width: 120, height: 150, windows: 3 }
];

type HarperShape = {
  type: 'orb' | 'ring';
  top: string;
  size: number;
  color: string;
  left?: string;
  right?: string;
};

const harperShapes: HarperShape[] = [
  { type: 'orb', top: '6%', left: '8%', size: 220, color: 'rgba(255, 196, 214, 0.25)' },
  { type: 'orb', top: '12%', right: '10%', size: 260, color: 'rgba(152, 210, 255, 0.2)' },
  { type: 'ring', top: '30%', left: '18%', size: 180, color: 'rgba(255,255,255,0.08)' },
  { type: 'ring', top: '18%', right: '18%', size: 150, color: 'rgba(255,255,255,0.06)' }
];

const Scene = {
  Background: () => (
    <div className="pointer-events-none fixed inset-0" style={{ zIndex: 'var(--layer-scene)' }} aria-hidden>
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(180deg, #050912 0%, #101631 55%, #1B2440 100%)'
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(circle at 10% 10%, rgba(255, 186, 206, 0.22), transparent 45%), radial-gradient(circle at 80% 5%, rgba(148, 208, 255, 0.2), transparent 55%)',
          filter: 'blur(35px)'
        }}
      />
      {harperShapes.map((shape, idx) =>
        shape.type === 'orb' ? (
          <div
            // eslint-disable-next-line react/no-array-index-key
            key={`orb-${idx}`}
            className="absolute rounded-full blur-3xl"
            style={{
              top: shape.top,
              left: shape.left,
              right: shape.right,
              width: shape.size,
              height: shape.size,
              background: `radial-gradient(circle, ${shape.color}, transparent 70%)`
            }}
          />
        ) : (
          <div
            // eslint-disable-next-line react/no-array-index-key
            key={`ring-${idx}`}
            className="absolute rounded-full opacity-70"
            style={{
              top: shape.top,
              left: shape.left,
              right: shape.right,
              width: shape.size,
              height: shape.size,
              border: `1px solid ${shape.color}`
            }}
          />
        )
      )}
      <div className="absolute inset-x-0 bottom-0 h-72">
        <div className="absolute inset-x-0 bottom-0 h-full" style={{ filter: 'blur(6px)' }}>
          {villageHomes.map(home => (
            <div
              key={home.left}
              className="absolute bottom-0 rounded-t-3xl bg-gradient-to-b from-[#1E2742] to-[#0F1623]"
              style={{ left: home.left, width: `${home.width}px`, height: `${home.height}px`, border: '1px solid rgba(255,255,255,0.05)' }}
            >
              <div
                className="absolute -top-5 left-1/2 -translate-x-1/2 rounded-full bg-[#E9F2FF]/35"
                style={{ width: `${home.width * 0.8}px`, height: '18px', filter: 'blur(4px)' }}
              />
              <div className="absolute inset-x-4 bottom-6 flex flex-wrap justify-between gap-2">
                {Array.from({ length: home.windows }).map((_, idx) => (
                  <span
                    // eslint-disable-next-line react/no-array-index-key
                    key={idx}
                    className="h-4 w-6 rounded-sm"
                    style={{
                      background: 'linear-gradient(180deg, rgba(252,220,169,0.85), rgba(252,220,169,0.25))',
                      boxShadow: '0 0 8px rgba(252,220,169,0.6)'
                    }}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
};

type SnowDepth = 'background' | 'midground' | 'foreground';

const snowLayerIndex: Record<SnowDepth, string> = {
  background: 'var(--layer-snow-back)',
  midground: 'var(--layer-snow-mid)',
  foreground: 'var(--layer-snow-front)'
};

const SnowLayer: React.FC<{ depth: SnowDepth; count: number }> = ({ depth, count }) => {
  const flakes = useMemo(
    () =>
      Array.from({ length: count }).map(() => ({
        left: `${Math.random() * 100}%`,
        delay: `${Math.random() * 6}s`,
        duration: `${8 + Math.random() * 10}s`,
        size: depth === 'foreground' ? 4 + Math.random() * 3 : depth === 'midground' ? 3 + Math.random() * 2 : 2 + Math.random() * 1.5
      })),
    [count, depth]
  );

  return (
    <div className="snow-layer pointer-events-none fixed inset-0 overflow-hidden" data-depth={depth} style={{ zIndex: snowLayerIndex[depth] }} aria-hidden>
      {flakes.map((flake, index) => (
        <span key={`${depth}-${index}`} style={{ left: flake.left, animationDelay: flake.delay, animationDuration: flake.duration, width: flake.size, height: flake.size }} />
      ))}
    </div>
  );
};

const Snow = {
  Background: () => <SnowLayer depth="background" count={70} />,
  Midground: () => <SnowLayer depth="midground" count={50} />,
  Foreground: () => <SnowLayer depth="foreground" count={30} />
};

type ButterflyVariant = 'idle' | 'glow' | 'flutter';

const Decor = {
  Butterfly: ({ variant = 'idle', style, delay = 0 }: { variant?: ButterflyVariant; style?: React.CSSProperties; delay?: number }) => (
    <span className="butterfly" data-variant={variant} style={{ ...style, animationDelay: `${delay}s` }} />
  )
};

const Butterflies = () => {
  const butterflies = useMemo(
    () => [
      { top: '20%', left: '15%', variant: 'glow' as ButterflyVariant, delay: 0 },
      { top: '40%', left: '70%', variant: 'flutter' as ButterflyVariant, delay: 1.5 },
      { top: '65%', left: '30%', variant: 'idle' as ButterflyVariant, delay: 0.5 }
    ],
    []
  );

  return (
    <div className="pointer-events-none fixed inset-0" style={{ zIndex: 'var(--layer-butterflies)' }} aria-hidden>
      {butterflies.map((butterfly, idx) => (
        <Decor.Butterfly
          // eslint-disable-next-line react/no-array-index-key
          key={idx}
          variant={butterfly.variant}
          delay={butterfly.delay}
          style={{ top: butterfly.top, left: butterfly.left }}
        />
      ))}
    </div>
  );
};

const Ambient = {
  Glow: () => (
    <div className="pointer-events-none fixed inset-0" style={{ zIndex: 'var(--layer-ambient)' }} aria-hidden>
      <div className="absolute left-[15%] top-[35%] h-72 w-72 rounded-full bg-[radial-gradient(circle,_rgba(255,194,205,0.28),_transparent_70%)] blur-[90px]" />
      <div className="absolute right-[10%] top-[10%] h-64 w-64 rounded-full bg-[radial-gradient(circle,_rgba(158,210,255,0.25),_transparent_70%)] blur-[80px]" />
    </div>
  )
};

type UIButtonProps = {
  label: string;
  icon?: ReactNode;
  onClick?: () => void;
  variant?: 'solid' | 'frosted';
  disabled?: boolean;
  href?: string;
  type?: 'button' | 'submit' | 'reset';
};

const UIButton: React.FC<UIButtonProps> = ({ label, icon, onClick, variant = 'solid', disabled, href, type = 'button' }) => {
  const className = cn(
    'group relative inline-flex items-center justify-center gap-3 rounded-full px-8 py-3 text-sm font-semibold uppercase tracking-[0.2em] transition',
    variant === 'solid' ? 'button-glow text-[#050912]' : 'border border-white/30 bg-white/5 text-white/80 hover:bg-white/10',
    disabled && 'pointer-events-none opacity-50'
  );

  if (href) {
    return (
      <a href={href} onClick={onClick} className={className} aria-label={label}>
        <span>{label}</span>
        {icon}
      </a>
    );
  }

  return (
    <button type={type} onClick={onClick} className={className} disabled={disabled}>
      <span>{label}</span>
      {icon}
    </button>
  );
};

type UICardProps = {
  children: ReactNode;
  state?: CardState;
  accent?: 'snow' | 'butterfly';
  className?: string;
};

const cardStates: Record<CardState, string> = {
  default: 'bg-white/5 border-white/10',
  hover: 'bg-white/7 border-white/15 shadow-[0_25px_60px_rgba(0,0,0,0.45)]',
  pressed: 'bg-white/8 border-white/20 translate-y-0.5',
  disabled: 'bg-white/3 border-white/5 opacity-60 pointer-events-none'
};

const UICard: React.FC<UICardProps> = ({ children, state = 'default', accent = 'snow', className }) => (
  <motion.div whileHover={state !== 'disabled' ? { y: -8 } : undefined}>
    <div className={cn('glass-panel relative overflow-hidden p-8 transition-all', cardStates[state], className)} data-variant="card">
      <span className="pointer-events-none absolute -right-2 -top-2 opacity-10">
        {accent === 'snow' ? <Snowflake className="h-14 w-14" /> : <ButterflyIcon />}
      </span>
      {children}
    </div>
  </motion.div>
);

type UIInputProps = {
  placeholder: string;
  state?: 'default' | 'focus' | 'disabled';
  type?: string;
};

const UIInput: React.FC<UIInputProps> = ({ placeholder, state = 'default', type = 'text' }) => (
  <input
    type={type}
    placeholder={placeholder}
    disabled={state === 'disabled'}
    className={cn(
      'snow-texture w-full rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/40 transition focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]',
      state === 'focus' && 'ring-2 ring-[var(--color-primary)] bg-white/10',
      state === 'disabled' && 'cursor-not-allowed opacity-50'
    )}
  />
);

type UIModalProps = {
  title: string;
  description: string;
  children: ReactNode;
};

const UIModal: React.FC<UIModalProps> = ({ title, description, children }) => (
  <div className="relative">
    <div className="absolute -inset-6 rounded-[38px] bg-[radial-gradient(circle,_rgba(78,255,208,0.1),_transparent_70%)]" />
    <div className="glass-panel relative space-y-4" data-variant="modal">
      <div className="space-y-1 text-left">
        <p className="text-xs uppercase tracking-[0.4em] text-white/60">{title}</p>
        <p className="text-sm text-white/80">{description}</p>
      </div>
      {children}
    </div>
  </div>
);

const UI = {
  Button: UIButton,
  Card: UICard,
  Modal: UIModal,
  Input: UIInput
};

type ExampleHeroProps = {
  route: Route;
  data: SectionCopy;
  onStart: () => void;
};

const ExampleHero: React.FC<ExampleHeroProps> = ({ route, data, onStart }) => {
  const sectionId = `section-${route.toLowerCase()}`;
  const isPrimary = route === 'Experience';

  return (
    <section
      id={sectionId}
      data-route={route}
      className="relative w-full px-6 pb-32 pt-32"
      aria-label={`${route} section`}
    >
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-14 lg:grid lg:grid-cols-[1.15fr_0.85fr] lg:items-start">
        <div className="space-y-8 text-left">
          <div className="space-y-3">
            <div className="glow-divider h-[2px] w-24" />
            <p className="text-xs uppercase tracking-[0.5em] text-white/60">{data.eyebrow}</p>
          </div>
          {isPrimary ? (
            <>
              <h1
                className="glow-stroke"
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 'var(--type-display-l)',
                  lineHeight: 1.05,
                  letterSpacing: '-0.02em',
                  textTransform: 'uppercase'
                }}
              >
                Magic Cave Calendars
              </h1>
              <p className="text-2xl text-white/85">{data.title}</p>
            </>
          ) : (
            <h2
              className="glow-stroke text-4xl"
              style={{ fontFamily: 'var(--font-display)', letterSpacing: '-0.01em', textTransform: 'uppercase' }}
            >
              {data.title}
            </h2>
          )}
          <p className="text-lg text-white/80">{data.description}</p>
          <div className="flex flex-wrap items-center gap-4">
            <UI.Button label="Start Calendar" icon={<ArrowRight className="h-4 w-4" />} href="/auth" onClick={onStart} />
            <UI.Button label="Preview Scene" variant="frosted" href="#section-templates" />
          </div>
          <div className="grid gap-5">
            {data.cards.map(card => (
              <UI.Card key={card.title} state={card.state} accent={card.accent}>
                <div className="space-y-3 text-left">
                  <div className="flex items-center gap-3 text-xs uppercase tracking-[0.35em] text-white/60">
                    {card.accent === 'snow' ? <Snowflake className="h-4 w-4 text-white/70" /> : <Sparkles className="h-4 w-4 text-white/70" />}
                    <span>{card.meta}</span>
                  </div>
                  <h3 className="text-2xl font-semibold text-white">{card.title}</h3>
                  <p className="text-sm text-white/75">{card.body}</p>
                </div>
              </UI.Card>
            ))}
          </div>
        </div>
        <div className="relative w-full">
          <UI.Modal title={data.modalTitle} description={data.modalDescription}>
            <div className="grid gap-3">
              <UI.Input placeholder="Guardian Name" state="focus" />
              <UI.Input placeholder="Family Email" type="email" />
              <UI.Input placeholder="Child Wish List (coming soon)" state="disabled" />
            </div>
            <div className="flex flex-wrap items-center gap-4 pt-4">
              <UI.Button label="Send Storybook Invite" icon={<ArrowRight className="h-4 w-4" />} href="/auth" onClick={onStart} />
              <p className="text-xs uppercase tracking-[0.35em] text-white/50">Family slots fill fast</p>
            </div>
          </UI.Modal>
          <Decor.Butterfly variant="flutter" delay={2} style={{ top: '-20px', right: '-30px' }} />
          <Decor.Butterfly variant="glow" delay={0.5} style={{ bottom: '-30px', left: '-20px' }} />
        </div>
      </div>
    </section>
  );
};

export default function App() {
  const [activeRoute, setActiveRoute] = useState<Route>('Experience');

  const handleStartCalendar = () => {
    window.location.href = '/auth';
  };

  const handleNavigate = (route: Route) => {
    setActiveRoute(route);
    const target = document.getElementById(`section-${route.toLowerCase()}`);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const route = entry.target.getAttribute('data-route') as Route | null;
            if (route) {
              setActiveRoute(route);
            }
          }
        });
      },
      { threshold: 0.35 }
    );

    ROUTES.forEach(route => {
      const el = document.getElementById(`section-${route.toLowerCase()}`);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden text-white">
      <Scene.Background />
      <Snow.Background />
      <Snow.Midground />
      <Butterflies />
      <Ambient.Glow />
      <Header links={navLinks} active={activeRoute} onSelect={value => handleNavigate(value as Route)} onCtaClick={handleStartCalendar} ctaLabel="Start Calendar" />
      <main className="relative mt-6 mx-auto flex w-full max-w-6xl flex-col items-stretch" style={{ zIndex: 'var(--layer-ui)' }}>
        {ROUTES.map(route => (
          <ExampleHero key={route} route={route} data={sections[route]} onStart={handleStartCalendar} />
        ))}
      </main>
      <Snow.Foreground />
    </div>
  );
}
