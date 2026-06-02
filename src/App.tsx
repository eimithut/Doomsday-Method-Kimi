import { useState, useCallback, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Globe } from 'lucide-react';
import { Navigation } from '@/components/Navigation';
import { OrbBackground } from '@/components/OrbBackground';
import { HeroSection } from '@/sections/HeroSection';
import { LearnSection } from '@/sections/LearnSection';
import { TrainSection } from '@/sections/TrainSection';
import { DailySection } from '@/sections/DailySection';
import { AnalyticsSection } from '@/sections/AnalyticsSection';
import type { AppView, Lang } from '@/types';
import { nextLang, LANG_LABELS } from '@/lib/i18n';
import './index.css';

function App() {
  const [currentView, setCurrentView] = useState<AppView>('hero');
  const [lang, setLang] = useState<Lang>('de');

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const handleNavigate = useCallback((view: AppView) => {
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const cycleLang = useCallback(() => {
    setLang((prev) => nextLang(prev));
  }, []);

  return (
    <div className="min-h-screen bg-zinc-950 text-white overflow-x-hidden relative">
      {/* Orb Background */}
      <OrbBackground />

      {/* Fixed Navigation */}
      <Navigation currentView={currentView} onNavigate={handleNavigate} lang={lang} />

      {/* Language Switcher */}
      <motion.button
        onClick={cycleLang}
        className="fixed top-4 right-4 z-[60] glass-strong rounded-full px-3 py-1.5 flex items-center gap-2 text-xs text-zinc-400 hover:text-white transition-colors cursor-pointer"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Globe className="w-3.5 h-3.5" />
        <span className="mono font-medium">{LANG_LABELS[lang]}</span>
      </motion.button>

      {/* Main Content */}
      <div className="relative z-10">
        <AnimatePresence mode="wait">
          <motion.main
            key={currentView}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            {currentView === 'hero' && (
              <HeroSection onNavigate={handleNavigate} lang={lang} />
            )}
            {currentView === 'learn' && (
              <LearnSection onNavigate={handleNavigate} lang={lang} />
            )}
            {currentView === 'train' && (
              <TrainSection onNavigate={handleNavigate} lang={lang} />
            )}
            {currentView === 'daily' && (
              <DailySection onNavigate={handleNavigate} lang={lang} />
            )}
            {currentView === 'analytics' && (
              <AnalyticsSection onNavigate={handleNavigate} lang={lang} />
            )}
          </motion.main>
        </AnimatePresence>

        {/* Footer */}
        <footer className="py-8 text-center text-zinc-700 text-xs relative z-10">
          <p className="mono">Doomsday Trainer</p>
          <p className="mt-1 text-zinc-800">All data stored locally</p>
        </footer>
      </div>
    </div>
  );
}

export default App;
