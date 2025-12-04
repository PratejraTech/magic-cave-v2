import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { motion } from 'framer-motion';

import { useThemeMode } from '../contexts/ThemeModeContext';

const DarkModeToggle: React.FC<{ className?: string }> = ({ className }) => {
  const { isDarkMode, toggleDarkMode } = useThemeMode();

  return (
    <motion.button
      type="button"
      onClick={toggleDarkMode}
      whileTap={{ scale: 0.95 }}
      className={`flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/20 ${className || ''}`}
      aria-label="Toggle dark mode"
    >
      {isDarkMode ? <Moon size={16} className="text-cyan-200" /> : <Sun size={16} className="text-amber-200" />}
      <span>{isDarkMode ? 'Dark' : 'Light'}</span>
    </motion.button>
  );
};

export default DarkModeToggle;
