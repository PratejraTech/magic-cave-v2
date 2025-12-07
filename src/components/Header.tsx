import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

type HeaderLink = {
  label: string;
  value: string;
};

type HeaderProps = {
  links: HeaderLink[];
  active: string;
  onSelect: (value: string) => void;
  onCtaClick?: () => void;
  ctaLabel?: string;
};

const Header: React.FC<HeaderProps> = ({ links, active, onSelect, onCtaClick, ctaLabel = 'Launch' }) => (
  <header className="sticky top-4 z-40 px-6 pt-4" style={{ zIndex: 'var(--layer-ui)' }}>
    <div className="mx-auto flex w-full max-w-6xl items-center justify-between rounded-full border border-white/15 bg-[rgba(15,23,42,0.9)] px-6 py-3 shadow-[0_20px_60px_rgba(0,0,0,0.45)] backdrop-blur-2xl">
      <div className="flex items-center gap-3">
        <motion.div
          className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[rgba(78,255,208,0.8)] to-[rgba(138,119,255,0.85)] shadow-lg"
          whileHover={{ rotate: 6 }}
          transition={{ type: 'spring', stiffness: 200 }}
        >
          <Sparkles className="h-5 w-5 text-white" />
        </motion.div>
        <div>
          <p className="text-xs uppercase tracking-[0.45em] text-white/60">Magic Cave Calendars</p>
          <p className="text-sm font-semibold text-white">Family Mission Control</p>
        </div>
      </div>
      <nav className="flex flex-wrap items-center gap-3 text-xs font-semibold uppercase tracking-[0.3em] text-white/80">
        {links.map(link => (
          <button
            key={link.value}
            onClick={() => onSelect(link.value)}
            className="relative px-3 py-2 text-white/70 transition hover:text-white"
          >
            {link.label}
            {active === link.value && (
              <span className="absolute inset-x-1 -bottom-1 h-[2px] rounded-full" style={{ background: 'linear-gradient(90deg, #4EFFD0, #8A77FF)' }} />
            )}
          </button>
        ))}
      </nav>
      <a href="/auth" onClick={onCtaClick} className="button-glow text-xs uppercase tracking-[0.3em]">
        {ctaLabel}
      </a>
    </div>
  </header>
);

export default Header;
