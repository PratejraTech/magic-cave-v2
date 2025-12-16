import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { Button } from './ui';

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
  variant?: 'light' | 'dark';
};

const Header: React.FC<HeaderProps> = ({
  links,
  active,
  onSelect,
  onCtaClick,
  ctaLabel = 'Start Calendar',
  variant = 'light'
}) => {
  const isDark = variant === 'dark';

  return (
    <header
      className="sticky top-0 z-40 w-full border-b backdrop-blur-md transition-colors"
      style={{
        backgroundColor: isDark ? 'rgba(15, 23, 42, 0.9)' : 'rgba(255, 255, 255, 0.95)',
        borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(4, 120, 87, 0.15)'
      }}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <motion.div
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-600 to-amber-600 shadow-sm"
            whileHover={{ scale: 1.05, rotate: 3 }}
            transition={{ type: 'spring', stiffness: 400 }}
          >
            <Sparkles className="h-5 w-5 text-white" />
          </motion.div>
          <div>
            <p
              className="text-sm font-bold gradient-text font-display"
              style={{
                backgroundImage: isDark ? 'var(--gradient-primary)' : 'linear-gradient(135deg, #047857 0%, #991b1b 50%, #d97706 100%)',
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}
            >
              Magic Cave Calendars
            </p>
            <p className={isDark ? 'text-xs text-white/60' : 'text-xs text-emerald-700 font-medium'}>
              Christmas Magic
            </p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {links.map((link) => (
            <button
              key={link.value}
              onClick={() => onSelect(link.value)}
              className="relative px-4 py-2 text-sm font-medium transition-colors rounded-lg"
              style={{
                color: active === link.value
                  ? isDark ? '#fff' : 'var(--color-text-primary)'
                  : isDark ? 'rgba(255, 255, 255, 0.7)' : 'var(--color-text-secondary)'
              }}
            >
              {link.label}

              {/* Active Indicator */}
              {active === link.value && (
                <motion.span
                  layoutId="activeTab"
                  className="absolute inset-x-2 -bottom-0.5 h-0.5 rounded-full"
                  style={{
                    background: isDark
                      ? 'linear-gradient(90deg, #4EFFD0, #8A77FF)'
                      : 'linear-gradient(90deg, #047857, #d97706)'
                  }}
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
            </button>
          ))}
        </nav>

        {/* CTA */}
        <div className="flex items-center gap-3">
          <Button
            variant="primary"
            size="md"
            onClick={onCtaClick}
            className="hidden sm:inline-flex"
          >
            {ctaLabel}
          </Button>

          {/* Mobile CTA */}
          <Button
            variant="primary"
            size="sm"
            onClick={onCtaClick}
            className="sm:hidden"
          >
            {ctaLabel}
          </Button>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden border-t" style={{ borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'var(--color-bg-muted)' }}>
        <nav className="flex overflow-x-auto px-6 py-2 gap-2">
          {links.map((link) => (
            <button
              key={link.value}
              onClick={() => onSelect(link.value)}
              className="flex-shrink-0 px-3 py-1.5 text-sm font-medium rounded-md transition-colors"
              style={{
                backgroundColor: active === link.value
                  ? isDark ? 'rgba(255, 255, 255, 0.1)' : 'var(--color-bg-soft)'
                  : 'transparent',
                color: active === link.value
                  ? isDark ? '#fff' : 'var(--color-text-primary)'
                  : isDark ? 'rgba(255, 255, 255, 0.7)' : 'var(--color-text-secondary)'
              }}
            >
              {link.label}
            </button>
          ))}
        </nav>
      </div>
    </header>
  );
};

export default Header;
