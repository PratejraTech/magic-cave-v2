import React from 'react';
import { useNavigate } from 'react-router-dom';
import WonderlandLayout from './layout/WonderlandLayout';
import { Button } from './ui/WonderButton';
import { useWinterTheme } from '../contexts/WinterThemeContext';
import { ArrowRight, PhoneCall, Mail, MapPin } from 'lucide-react';

const features = [
  {
    title: 'Template Studio',
    description: 'Curated palettes, motion, and typography tuned for every family personality.',
    icon: '🎨'
  },
  {
    title: 'Parent & Child Workflows',
    description: 'Parents craft moments while kids unlock daily surprises in a safe space.',
    icon: '👨‍👩‍👧'
  },
  {
    title: 'Memories That Stick',
    description: 'Upload audio notes, photos, and gifts for heartfelt keepsakes.',
    icon: '💌'
  }
];

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { variant } = useWinterTheme();
  const layoutMood = variant === 'masculine' ? 'frost' : variant === 'neutral' ? 'aurora' : 'ember';

  return (
    <WonderlandLayout
      title=""
      subtitle=""
      mood={layoutMood}
      showSnow
      showButterflies
      showDarkToggle
      contentClassName="space-y-12"
      className="min-h-screen"
    >
      {/* Header */}
      <header className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-4 rounded-3xl border border-white/20 bg-white/10 p-6 text-white shadow-2xl backdrop-blur-2xl sm:flex-row">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-white/70">Family Advent</p>
          <h1 className="text-2xl font-semibold">A modern wonderland for parents & kids</h1>
        </div>
        <div className="flex gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate('/holiday/showcase')}>
            Showcase
          </Button>
          <Button variant="frosted" size="sm" onClick={() => navigate('/auth')}>
            Log In
          </Button>
          <Button size="sm" onClick={() => navigate('/auth')}>
            Launch Studio
          </Button>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto grid w-full max-w-6xl gap-8 lg:grid-cols-[1.4fr_1fr]">
        <div className="rounded-3xl border border-white/20 bg-white/10 p-8 text-white shadow-2xl backdrop-blur-2xl">
          <p className="text-sm uppercase tracking-[0.3em] text-white/70">Limited 2025 Edition</p>
          <h2 className="mt-3 text-4xl font-bold leading-tight sm:text-5xl">
            Your family’s December deserves a cinematic calendar.
          </h2>
          <p className="mt-4 text-base leading-relaxed text-white/80">
            Build heartfelt routines with elevated templates, guided parent workflows, and child-friendly unlocks.
            Every day reveals media, gifts, and AI-crafted messages—all styled by your chosen palette.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button size="lg" onClick={() => navigate('/auth')} rightIcon={<ArrowRight />}>
              Enter Parent Studio
            </Button>
            <Button
              variant="frosted"
              size="lg"
              onClick={() => navigate('/auth')}
            >
              Child Login
            </Button>
            <Button
              variant="ghost"
              size="lg"
              onClick={() => navigate('/holiday/showcase')}
            >
              Watch Showcase
            </Button>
          </div>
        </div>
        <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-white/20 to-white/0 p-6 text-white shadow-2xl backdrop-blur-xl">
          <p className="text-xs uppercase tracking-[0.3em] text-white/70">Live Template Preview</p>
          <div className="mt-4 grid grid-cols-5 gap-2 text-sm font-semibold">
            {Array.from({ length: 15 }, (_, index) => (
              <div
                key={index}
                className="aspect-square rounded-2xl border border-white/30 bg-white/15 text-center leading-[2.8]"
              >
                {index + 1}
              </div>
            ))}
          </div>
          <p className="mt-4 text-sm text-white/80">Mix palettes, motion tokens, and overlays with a single click.</p>
        </div>
      </section>

      {/* Info */}
      <section className="mx-auto grid w-full max-w-6xl gap-4 rounded-3xl border border-white/10 bg-white/10 p-6 text-white shadow-2xl backdrop-blur-xl md:grid-cols-3">
        {features.map(feature => (
          <div key={feature.title} className="rounded-2xl border border-white/20 bg-white/10 p-4 shadow-inner shadow-white/10">
            <div className="text-2xl">{feature.icon}</div>
            <h3 className="mt-3 text-lg font-semibold">{feature.title}</h3>
            <p className="mt-2 text-sm text-white/80">{feature.description}</p>
          </div>
        ))}
      </section>

      {/* Contact */}
      <section className="mx-auto w-full max-w-6xl rounded-3xl border border-white/10 bg-white/10 p-6 text-white shadow-2xl backdrop-blur-xl">
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-white/70">Need help?</p>
            <h3 className="mt-2 text-2xl font-semibold">Concierge support for parents & partners.</h3>
            <p className="mt-3 text-sm text-white/80">
              We’re here to help you design calendar campaigns, migrate content, or answer onboarding questions.
            </p>
          </div>
          <div className="grid gap-3 text-sm text-white/80">
            <div className="flex items-center gap-3">
              <PhoneCall size={18} />
              <span>+1 (555) 123-6740</span>
            </div>
            <div className="flex items-center gap-3">
              <Mail size={18} />
              <span>support@familyadvent.com</span>
            </div>
            <div className="flex items-center gap-3">
              <MapPin size={18} />
              <span>Snowfall Ave, North Pole Studio</span>
            </div>
            <Button
              variant="frosted"
              onClick={() => (window.location.href = 'mailto:support@familyadvent.com')}
            >
              Contact Us
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mx-auto flex w-full max-w-6xl flex-col gap-2 rounded-3xl border border-white/20 bg-white/10 p-4 text-center text-white text-sm shadow-2xl backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between">
        <span>© {new Date().getFullYear()} Family Advent. All magic reserved.</span>
        <div className="flex gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/auth')}>Privacy</Button>
          <Button variant="ghost" size="sm" onClick={() => navigate('/holiday/showcase')}>Showcase</Button>
          <Button variant="ghost" size="sm" onClick={() => navigate('/auth')}>Support</Button>
        </div>
      </footer>
    </WonderlandLayout>
  );
};

export default LandingPage;
