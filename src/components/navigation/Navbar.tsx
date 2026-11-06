import React from 'react';
import { Home, Disc, Target, Calendar, BarChart3, Settings } from 'lucide-react';
import { useI18n } from '../../i18n';
import { Logo } from '../common/Logo';

export type NavTab = 'home' | 'counter' | 'sankalpa' | 'calendar' | 'insights';

interface NavbarProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  onOpenSettings: () => void;
  activeMantraName?: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onSelectTab,
  onOpenSettings,
  activeMantraName,
}) => {
  const { t } = useI18n();

  const navItems = [
    { id: 'home' as NavTab, label: t('nav.home'), icon: Home },
    { id: 'counter' as NavTab, label: t('nav.counter'), icon: Disc },
    { id: 'sankalpa' as NavTab, label: t('nav.sankalpa'), icon: Target },
    { id: 'calendar' as NavTab, label: t('nav.calendar'), icon: Calendar },
    { id: 'insights' as NavTab, label: t('nav.insights'), icon: BarChart3 },
  ];

  return (
    <>
      {/* Top Header (Visible on both mobile and desktop) */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-border px-4 py-2.5 transition-colors">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <button
            onClick={() => onSelectTab('home')}
            className="flex items-center text-left focus:outline-none"
          >
            <Logo size="md" />
          </button>

          {/* Active Mantra Pill & Settings Icon */}
          <div className="flex items-center gap-2">
            {activeMantraName && (
              <button
                onClick={() => onSelectTab('counter')}
                className="hidden sm:flex items-center px-3 py-1 rounded-full bg-primary-soft text-primary-dark text-xs font-medium border border-primary/20 hover:bg-primary-soft/80 transition-colors truncate max-w-[200px]"
                title={activeMantraName}
              >
                <span className="truncate">{activeMantraName}</span>
              </button>
            )}

            <button
              onClick={onOpenSettings}
              className="p-2 rounded-full text-text-secondary hover:text-primary hover:bg-primary-soft/50 transition-colors focus:outline-none"
              aria-label={t('nav.settings')}
              title={t('nav.settings')}
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-border px-2 py-1 shadow-card pb-[max(0.25rem,env(safe-area-inset-bottom))]">
        <div className="flex items-center justify-around">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`flex flex-col items-center justify-center py-1.5 px-3 min-w-[58px] transition-colors ${
                  isActive ? 'text-primary font-medium' : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                <div
                  className={`p-1 rounded-xl transition-all ${
                    isActive ? 'bg-primary-soft text-primary' : ''
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.4]' : 'stroke-[1.8]'}`} />
                </div>
                <span className={`text-[10px] mt-0.5 tracking-tight ${isActive ? 'font-semibold' : ''}`}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Desktop Sticky Sub-Navigation */}
      <div className="hidden md:block sticky top-[57px] z-20 bg-white/90 backdrop-blur-sm border-b border-border/80">
        <div className="max-w-6xl mx-auto px-4 flex items-center gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`flex items-center gap-2 py-2.5 px-4 text-sm font-medium border-b-2 transition-all ${
                  isActive
                    ? 'border-primary text-primary'
                    : 'border-transparent text-text-secondary hover:text-text-primary hover:border-border'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'stroke-[2.3]' : 'stroke-[1.8]'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
};
