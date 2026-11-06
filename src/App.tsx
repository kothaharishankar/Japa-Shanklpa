import React, { useState, useEffect, useCallback } from 'react';
import { I18nProvider } from './i18n';
import { initDatabase } from './db/init';
import { db } from './db';
import { calculateDevotionalStats, type DevotionalStats } from './utils/stats';
import { Navbar, type NavTab } from './components/navigation/Navbar';
import { HomeDashboard } from './components/home/HomeDashboard';
import { CounterScreen } from './components/counter/CounterScreen';
import { SankalpaScreen } from './components/sankalpa/SankalpaScreen';
import { CalendarScreen } from './components/calendar/CalendarScreen';
import { InsightsScreen } from './components/insights/InsightsScreen';
import { SettingsScreen } from './components/settings/SettingsScreen';
import { MantraModal } from './components/mantra/MantraModal';
import { PwaBanner } from './components/common/PwaBanner';
import type { Mantra } from './types';

export const AppContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<NavTab | 'settings'>('home');
  const [stats, setStats] = useState<DevotionalStats | null>(null);
  const [activeMantra, setActiveMantra] = useState<Mantra | null>(null);
  const [isMantraModalOpen, setIsMantraModalOpen] = useState(false);
  const [isReady, setIsReady] = useState(false);

  const refreshStats = useCallback(async () => {
    try {
      const s = await calculateDevotionalStats();
      setStats(s);

      // Load active mantra
      const settings = await db.settings.get('current_settings');
      if (settings?.activeMantraId) {
        const m = await db.mantras.get(settings.activeMantraId);
        if (m) {
          setActiveMantra(m);
        } else {
          const first = await db.mantras.toCollection().first();
          if (first) setActiveMantra(first);
        }
      }
    } catch (e) {
      console.error('Failed to refresh devotional stats', e);
    }
  }, []);

  useEffect(() => {
    async function setup() {
      await initDatabase();
      await refreshStats();
      setIsReady(true);
    }
    setup();
  }, [refreshStats]);

  const handleSelectMantra = async (m: Mantra) => {
    setActiveMantra(m);
    await db.settings.update('current_settings', { activeMantraId: m.id });
    await refreshStats();
  };

  if (!isReady || !stats || !activeMantra) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
        <span className="text-xs font-semibold text-primary-dark tracking-wide font-mono">
          Loading Japa Sankalpa...
        </span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-text-primary flex flex-col font-sans">
      <PwaBanner />

      <Navbar
        activeTab={activeTab as NavTab}
        onSelectTab={(tab) => setActiveTab(tab)}
        onOpenSettings={() => setActiveTab('settings')}
        activeMantraName={activeMantra.name}
      />

      <main className="flex-1 overflow-x-hidden">
        {activeTab === 'home' && (
          <HomeDashboard
            stats={stats}
            activeMantra={activeMantra}
            onNavigate={(tab) => setActiveTab(tab)}
            onOpenMantraSelect={() => setIsMantraModalOpen(true)}
          />
        )}

        {activeTab === 'counter' && (
          <CounterScreen
            activeMantra={activeMantra}
            lifetimeCount={stats.totalCompleted}
            todayCount={stats.todayCount}
            onCountChanged={refreshStats}
            onOpenMantraSelect={() => setIsMantraModalOpen(true)}
          />
        )}

        {activeTab === 'sankalpa' && (
          <SankalpaScreen
            lifetimeCount={stats.totalCompleted}
            todayCount={stats.todayCount}
            onRefresh={refreshStats}
          />
        )}

        {activeTab === 'calendar' && <CalendarScreen />}

        {activeTab === 'insights' && <InsightsScreen stats={stats} />}

        {activeTab === 'settings' && (
          <SettingsScreen
            onRefreshAll={refreshStats}
            onOpenMantraModal={() => setIsMantraModalOpen(true)}
          />
        )}
      </main>

      <MantraModal
        isOpen={isMantraModalOpen}
        onClose={() => setIsMantraModalOpen(false)}
        activeMantraId={activeMantra.id}
        onSelectMantra={handleSelectMantra}
      />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <I18nProvider>
      <AppContent />
    </I18nProvider>
  );
};

export default App;
