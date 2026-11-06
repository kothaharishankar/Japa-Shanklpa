import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  RotateCcw,
  Volume2,
  VolumeX,
  Vibrate,
  Maximize2,
  Minimize2,
  Pause,
  Play,
  Square,
  Sparkles,
  Trophy,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useI18n } from '../../i18n';
import { MalaBeads } from './MalaBeads';
import { feedback } from '../../utils/feedback';
import { formatDuration, formatIndianNumber } from '../../utils/date';
import {
  incrementRepetition,
  undoLastRepetition,
  updateSessionDuration,
  endSession,
  getOrCreateActiveSession,
} from '../../db/counterService';
import { db } from '../../db';
import type { Session, Mantra, AppSettings, Milestone } from '../../types';

interface CounterScreenProps {
  activeMantra: Mantra;
  lifetimeCount: number;
  todayCount: number;
  onCountChanged: () => void;
  onOpenMantraSelect: () => void;
}

export const CounterScreen: React.FC<CounterScreenProps> = ({
  activeMantra,
  lifetimeCount,
  todayCount,
  onCountChanged,
  onOpenMantraSelect,
}) => {
  const { t } = useI18n();

  // Session state
  const [session, setSession] = useState<Session | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // User preferences
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [soundOn, setSoundOn] = useState(true);
  const [vibrationOn, setVibrationOn] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Milestones celebration popup
  const [celebratedMilestone, setCelebratedMilestone] = useState<Milestone | null>(null);
  const [isSankalpaCompleted, setIsSankalpaCompleted] = useState(lifetimeCount >= 1100000);

  // Rapid tap protection & queuing
  const tapLockRef = useRef(false);
  const lastTapTimeRef = useRef(0);
  const timerRef = useRef<any>(null);
  const wakeLockRef = useRef<any>(null);

  // Load settings & active session
  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      const s = await db.settings.get('current_settings');
      if (s && isMounted) {
        setSettings(s);
        setSoundOn(s.soundEnabled);
        setVibrationOn(s.vibrationEnabled);
      }

      const activeSess = await getOrCreateActiveSession(activeMantra.id, activeMantra.name);
      if (isMounted) {
        setSession(activeSess);
        setElapsedSeconds(activeSess.durationSeconds);
        setIsPaused(activeSess.status === 'paused');
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, [activeMantra.id, activeMantra.name]);

  // Wake lock management
  useEffect(() => {
    async function acquireWakeLock() {
      if (settings?.wakeLockEnabled && 'wakeLock' in navigator) {
        try {
          wakeLockRef.current = await (navigator as any).wakeLock.request('screen');
        } catch {
          // ignore
        }
      }
    }
    acquireWakeLock();

    return () => {
      if (wakeLockRef.current) {
        wakeLockRef.current.release().catch(() => {});
        wakeLockRef.current = null;
      }
    };
  }, [settings?.wakeLockEnabled]);

  // Session Timer
  useEffect(() => {
    if (session && !isPaused && session.status === 'active') {
      timerRef.current = setInterval(() => {
        setElapsedSeconds((prev) => {
          const next = prev + 1;
          if (next % 10 === 0 && session) {
            updateSessionDuration(session.id, 10).catch(console.error);
          }
          return next;
        });
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [session, isPaused]);

  // Trigger celebration confetti
  const triggerCelebration = useCallback((isFullSankalpa = false) => {
    try {
      confetti({
        particleCount: isFullSankalpa ? 150 : 80,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#176B45', '#C5A45A', '#EAF4EC', '#145638'],
      });
    } catch {
      // ignore
    }
  }, []);

  // Main Tap Handler
  const handleTap = async () => {
    if (!session) return;
    if (isSankalpaCompleted) return;

    // Minimum throttle 50ms to prevent accidental electrical bounces, while fully supporting rapid chanting
    const now = performance.now();
    if (now - lastTapTimeRef.current < 50) {
      return;
    }
    lastTapTimeRef.current = now;

    // If currently paused, resume session automatically
    if (isPaused) {
      setIsPaused(false);
      await db.sessions.update(session.id, { status: 'active' });
    }

    // Immediate optimistic local audio/haptic feedback
    const nextSessionCount = session.count + 1;
    const isMalaDone = nextSessionCount % 108 === 0;

    if (soundOn) {
      feedback.playChime(isMalaDone);
    }
    if (vibrationOn) {
      feedback.vibrate(isMalaDone);
    }

    if (isMalaDone) {
      triggerCelebration(false);
    }

    // Atomic write to IndexedDB
    try {
      const result = await incrementRepetition(session.id, activeMantra.id, activeMantra.name);

      if (result.isTargetReached) {
        setIsSankalpaCompleted(true);
        triggerCelebration(true);
      }

      if (result.newMilestone) {
        setCelebratedMilestone(result.newMilestone);
        triggerCelebration(false);
      }

      setSession((prev) =>
        prev
          ? {
              ...prev,
              count: result.newSessionCount,
              completedMalas: Math.floor(result.newSessionCount / 108),
            }
          : null
      );

      onCountChanged();
    } catch (err) {
      console.error('Failed to record repetition:', err);
    }
  };

  // Safe Undo Handler
  const handleUndo = async () => {
    if (!session || session.count <= 0) return;

    try {
      const ok = await undoLastRepetition(session.id);
      if (ok) {
        setSession((prev) =>
          prev
            ? {
                ...prev,
                count: Math.max(0, prev.count - 1),
                completedMalas: Math.floor(Math.max(0, prev.count - 1) / 108),
              }
            : null
        );
        onCountChanged();
      }
    } catch (err) {
      console.error('Failed to undo repetition:', err);
    }
  };

  // Pause / Resume Session
  const togglePause = async () => {
    if (!session) return;
    const nextState = !isPaused;
    setIsPaused(nextState);
    await db.sessions.update(session.id, {
      status: nextState ? 'paused' : 'active',
      durationSeconds: elapsedSeconds,
    });
  };

  // Complete / End Session
  const handleEndSession = async () => {
    if (!session) return;
    await updateSessionDuration(session.id, elapsedSeconds - session.durationSeconds);
    await endSession(session.id);

    // Create a new fresh session for next time
    const newSess = await getOrCreateActiveSession(activeMantra.id, activeMantra.name);
    setSession(newSess);
    setElapsedSeconds(0);
    setIsPaused(false);
    onCountChanged();
  };

  // Fullscreen toggle
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const sessionCount = session?.count || 0;
  const sessionMalas = session?.completedMalas || 0;

  return (
    <div
      className={`max-w-xl mx-auto px-4 py-4 flex flex-col justify-between select-none ${
        isFullscreen ? 'fixed inset-0 z-50 bg-white max-w-none p-6' : 'min-h-[calc(100vh-140px)] pb-24 md:pb-8'
      }`}
    >
      {/* Top Bar Controls */}
      <div className="flex items-center justify-between gap-2 border-b border-border/80 pb-3">
        {/* Active Mantra Pill */}
        <button
          onClick={onOpenMantraSelect}
          className="flex-1 text-left px-3 py-1.5 rounded-xl bg-primary-soft/80 hover:bg-primary-soft text-primary-dark border border-primary/20 transition-colors truncate max-w-[220px]"
        >
          <span className="text-[10px] uppercase font-semibold text-text-secondary block">
            {t('home.activeMantra')}
          </span>
          <span className="font-semibold text-xs sm:text-sm font-telugu truncate block">
            {activeMantra.name}
          </span>
        </button>

        {/* Audio, Haptic & Fullscreen Controls */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setSoundOn(!soundOn)}
            className={`p-2 rounded-xl transition-colors ${
              soundOn ? 'bg-primary-soft text-primary' : 'bg-gray-100 text-text-secondary'
            }`}
            title={soundOn ? 'Mute Sound' : 'Unmute Sound'}
          >
            {soundOn ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          <button
            onClick={() => setVibrationOn(!vibrationOn)}
            className={`p-2 rounded-xl transition-colors ${
              vibrationOn ? 'bg-primary-soft text-primary' : 'bg-gray-100 text-text-secondary'
            }`}
            title={vibrationOn ? 'Disable Vibration' : 'Enable Vibration'}
          >
            <Vibrate className="w-4 h-4" />
          </button>

          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-xl bg-gray-100 text-text-secondary hover:text-text-primary transition-colors"
            title={isFullscreen ? t('counter.exitFullscreen') : t('counter.fullscreen')}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Target Reached Banner if completed */}
      {isSankalpaCompleted && (
        <div className="p-4 rounded-2xl bg-accent-gold/15 border border-accent-gold/40 text-center my-2 animate-bounce">
          <div className="flex items-center justify-center gap-2 text-accent-gold font-bold text-sm">
            <Trophy className="w-5 h-5" />
            <span>{t('counter.sankalpaComplete')}</span>
          </div>
        </div>
      )}

      {/* 108-Bead Mala Visualization */}
      <div className="my-2 flex flex-col items-center">
        <MalaBeads count={sessionCount} completedMalas={sessionMalas} />
      </div>

      {/* Numerical Counter & Status Display */}
      <div className="text-center my-1 space-y-1">
        <div className="flex items-center justify-center gap-2">
          <span className="text-xs uppercase font-semibold tracking-wider text-text-secondary">
            {t('counter.sessionCount')}
          </span>
          <span className="text-xs font-semibold text-primary px-2 py-0.5 rounded-full bg-primary-soft border border-primary/20">
            {formatDuration(elapsedSeconds)}
          </span>
        </div>

        <div className="text-5xl sm:text-6xl font-black text-text-primary tracking-tight font-mono">
          {formatIndianNumber(sessionCount)}
        </div>

        <div className="flex items-center justify-center gap-4 text-xs text-text-secondary pt-1 font-medium">
          <span>Today: <strong className="text-primary-dark">{formatIndianNumber(todayCount)}</strong></span>
          <span>•</span>
          <span>Total: <strong className="text-primary-dark">{formatIndianNumber(lifetimeCount)}</strong> / 11,00,000</span>
        </div>
      </div>

      {/* Giant Circular Tap Button (Mobile-first, Comfortable) */}
      <div className="flex flex-col items-center justify-center my-3">
        <button
          onClick={handleTap}
          disabled={isSankalpaCompleted}
          className="relative w-44 h-44 sm:w-52 sm:h-52 rounded-full bg-gradient-to-br from-primary to-primary-dark text-white shadow-xl shadow-primary/25 active:scale-95 transition-all flex flex-col items-center justify-center group focus:outline-none focus:ring-4 focus:ring-primary/30"
          style={{ touchAction: 'manipulation' }}
          aria-label={t('counter.tapToChant')}
        >
          {/* Subtle Outer Wave Pulse */}
          <div className="absolute inset-0 rounded-full border-4 border-white/20 animate-pulse pointer-events-none" />

          {/* Golden OM emblem inside button */}
          <div className="w-10 h-10 mb-1 text-accent-gold flex items-center justify-center opacity-90 group-hover:scale-105 transition-transform">
            <svg viewBox="0 0 100 100" className="w-full h-full fill-current">
              <path d="M 44 38 C 40 38 36 41 36 46 C 36 50 39 53 43 54 C 38 55 35 60 35 65 C 35 72 40 76 47 76 C 56 76 63 69 63 60 C 63 56 61 53 58 51 C 61 49 63 46 63 43 C 63 38 58 34 52 34 C 50 34 47 35 45 36" fill="none" stroke="currentColor" strokeWidth="6" strokeLinecap="round"/>
              <path d="M 58 33 C 63 33 67 36 68 40" fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
              <circle cx="68" cy="30" r="4" fill="currentColor" />
            </svg>
          </div>

          <span className="text-lg sm:text-xl font-bold tracking-wide">
            {t('counter.tapToChant')}
          </span>
          <span className="text-[11px] text-white/70 font-normal mt-0.5">
            +1 Repetition
          </span>
        </button>
      </div>

      {/* Bottom Session Management Controls */}
      <div className="flex items-center justify-between gap-3 pt-2">
        {/* Undo button */}
        <button
          onClick={handleUndo}
          disabled={sessionCount <= 0}
          className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl border text-xs font-semibold transition-all ${
            sessionCount > 0
              ? 'border-border bg-white text-text-primary hover:bg-gray-50 active:scale-95 shadow-subtle'
              : 'border-border/50 text-gray-300 cursor-not-allowed'
          }`}
          title={t('counter.undo')}
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>{t('counter.undo')}</span>
        </button>

        {/* Pause / Resume */}
        <button
          onClick={togglePause}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-border bg-white hover:bg-gray-50 text-xs font-semibold text-text-primary active:scale-95 transition-all shadow-subtle"
        >
          {isPaused ? <Play className="w-3.5 h-3.5 fill-current" /> : <Pause className="w-3.5 h-3.5 fill-current" />}
          <span>{isPaused ? t('counter.resumeSession') : t('counter.pauseSession')}</span>
        </button>

        {/* End Session */}
        <button
          onClick={handleEndSession}
          disabled={sessionCount === 0}
          className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${
            sessionCount > 0
              ? 'bg-primary-soft hover:bg-primary-soft/80 text-primary-dark border border-primary/20 active:scale-95'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          }`}
        >
          <Square className="w-3.5 h-3.5 fill-current" />
          <span>{t('counter.endSession')}</span>
        </button>
      </div>

      {/* Milestone Modal / Banner */}
      {celebratedMilestone && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full text-center shadow-2xl border border-primary/20 animate-scale-up">
            <div className="w-16 h-16 rounded-full bg-primary-soft border border-primary/30 text-primary mx-auto flex items-center justify-center mb-4">
              <Trophy className="w-8 h-8 text-accent-gold" />
            </div>
            <span className="text-xs uppercase font-semibold text-accent-gold tracking-wider">
              Milestone Achieved!
            </span>
            <h3 className="text-2xl font-bold text-text-primary mt-1">
              {celebratedMilestone.label}
            </h3>
            <p className="text-xs text-text-secondary mt-2">
              May the divine vibrations bless your devotion. Every sacred repetition brings peace and spiritual elevation.
            </p>
            <button
              onClick={() => setCelebratedMilestone(null)}
              className="mt-6 w-full py-3 rounded-xl bg-primary text-white font-semibold text-sm hover:bg-primary-dark transition-colors shadow-md shadow-primary/20"
            >
              Jai Sri Rama • Continue
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
