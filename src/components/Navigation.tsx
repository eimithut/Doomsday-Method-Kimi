import { motion } from 'framer-motion';
import { BookOpen, Target, BarChart3, Brain, CalendarDays } from 'lucide-react';
import type { AppView, Lang } from '@/types';
import { useTranslation } from '@/hooks/useTranslation';

interface NavigationProps {
  currentView: AppView;
  onNavigate: (view: AppView) => void;
  lang: Lang;
}

export function Navigation({ currentView, onNavigate, lang }: NavigationProps) {
  const { $t } = useTranslation(lang);

  const navItems: { id: AppView; label: string; icon: typeof BookOpen }[] = [
    { id: 'hero', label: $t('navHome'), icon: Brain },
    { id: 'learn', label: $t('navLearn'), icon: BookOpen },
    { id: 'train', label: $t('navTrain'), icon: Target },
    { id: 'daily', label: $t('navDaily'), icon: CalendarDays },
    { id: 'analytics', label: $t('navAnalytics'), icon: BarChart3 },
  ];

  return (
    <motion.nav
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="fixed top-0 left-0 right-0 z-50 px-4 py-4 pointer-events-none flex justify-center"
    >
      <div className="glass-strong rounded-full px-2 py-1.5 flex items-center gap-1 pointer-events-auto">
        {navItems.map((item) => {
            const isActive = currentView === item.id;
            const Icon = item.icon;

            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`relative flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full text-sm transition-all duration-300 ${
                  isActive ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="nav-pill"
                    className="absolute inset-0 bg-white/[0.12] rounded-full border border-white/[0.15]"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-2">
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{item.label}</span>
                </span>
              </button>
            );
          })}
      </div>
    </motion.nav>
  );
}
