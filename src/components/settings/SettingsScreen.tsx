import React, { useState, useEffect } from 'react';
import {
  Download,
  Upload,
  Globe,
  Volume2,
  Vibrate,
  Eye,
  Target,
  FileSpreadsheet,
  Shield,
  Info,
  CheckCircle,
  Sparkles,
  BookOpen,
} from 'lucide-react';
import { useI18n, type Language } from '../../i18n';
import { db } from '../../db';
import { exportJsonBackup, exportDailyCsv, exportSessionsCsv } from '../../services/backupService';
import { RestoreModal } from './RestoreModal';
import { formatIndianNumber } from '../../utils/date';
import type { AppSettings, Sankalpa } from '../../types';

interface SettingsScreenProps {
  onRefreshAll: () => void;
  onOpenMantraModal: () => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  onRefreshAll,
  onOpenMantraModal,
}) => {
  const { t, language, setLanguage } = useI18n();

  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [sankalpa, setSankalpa] = useState<Sankalpa | null>(null);
  const [isRestoreOpen, setIsRestoreOpen] = useState(false);
  const [exportNotice, setExportNotice] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      const s = await db.settings.get('current_settings');
      if (s) setSettings(s);

      const sank = await db.sankalpa.get('sankalpa-11-lakh');
      if (sank) setSankalpa(sank);
    }
    loadData();
  }, []);

  const updateSetting = async (key: keyof AppSettings, value: any) => {
    if (!settings) return;
    await db.settings.update('current_settings', { [key]: value });
    setSettings((prev) => (prev ? { ...prev, [key]: value } : null));
    onRefreshAll();
  };

  const handleExportJson = async () => {
    try {
      const filename = await exportJsonBackup();
      setExportNotice(`Exported successfully: ${filename}`);
      setTimeout(() => setExportNotice(null), 5000);
      const s = await db.settings.get('current_settings');
      if (s) setSettings(s);
    } catch (err: any) {
      alert(`Export failed: ${err.message || 'Error'}`);
    }
  };

  const handleExportDailyCsv = async () => {
    try {
      const filename = await exportDailyCsv();
      setExportNotice(`Exported daily history: ${filename}`);
      setTimeout(() => setExportNotice(null), 5000);
    } catch (err: any) {
      alert(`Export failed: ${err.message}`);
    }
  };

  const handleExportSessionsCsv = async () => {
    try {
      const filename = await exportSessionsCsv();
      setExportNotice(`Exported session history: ${filename}`);
      setTimeout(() => setExportNotice(null), 5000);
    } catch (err: any) {
      alert(`Export failed: ${err.message}`);
    }
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-6 space-y-6 pb-24 md:pb-12 animate-fade-in">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold text-text-primary tracking-tight">
          {t('settings.title')}
        </h1>
        <p className="text-xs text-text-secondary mt-0.5">
          Configure devotion preferences and manage your offline sacred records
        </p>
      </div>

      {exportNotice && (
        <div className="p-3.5 rounded-2xl bg-primary-soft border border-primary/20 text-primary-dark text-xs flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-primary flex-shrink-0" />
          <span>{exportNotice}</span>
        </div>
      )}

      {/* Language Preferences */}
      <div className="p-5 rounded-3xl bg-white border border-border shadow-card space-y-3">
        <div className="flex items-center gap-2 text-text-primary">
          <Globe className="w-4 h-4 text-primary" />
          <h2 className="text-sm font-bold">{t('settings.language')}</h2>
        </div>
        <div className="grid grid-cols-3 gap-2 pt-1">
          {[
            { id: 'en' as Language, label: 'English', sub: 'Inter' },
            { id: 'te' as Language, label: 'తెలుగు', sub: 'Telugu' },
            { id: 'hi' as Language, label: 'हिन्दी', sub: 'Devanagari' },
          ].map((lang) => {
            const isSelected = language === lang.id;
            return (
              <button
                key={lang.id}
                onClick={() => setLanguage(lang.id)}
                className={`py-2.5 px-2 rounded-2xl border text-center transition-all ${
                  isSelected
                    ? 'bg-primary text-white border-primary shadow-sm'
                    : 'bg-primary-sage/60 text-text-primary border-border hover:bg-primary-soft'
                }`}
              >
                <span className="text-xs font-bold block">{lang.label}</span>
                <span className="text-[10px] opacity-75">{lang.sub}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Audio & Haptic Feedback */}
      <div className="p-5 rounded-3xl bg-white border border-border shadow-card space-y-4">
        <h2 className="text-sm font-bold text-text-primary">
          {t('settings.preferences')}
        </h2>

        {/* Sound */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary-soft text-primary">
              <Volume2 className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-semibold text-text-primary block">
                {t('settings.sound')}
              </span>
              <span className="text-[11px] text-text-secondary">
                Soothing singing-bowl and bead chime
              </span>
            </div>
          </div>
          <input
            type="checkbox"
            checked={settings?.soundEnabled ?? true}
            onChange={(e) => updateSetting('soundEnabled', e.target.checked)}
            className="w-5 h-5 accent-primary rounded cursor-pointer"
          />
        </div>

        {/* Vibration */}
        <div className="flex items-center justify-between pt-2 border-t border-border/70">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary-soft text-primary">
              <Vibrate className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-semibold text-text-primary block">
                {t('settings.vibration')}
              </span>
              <span className="text-[11px] text-text-secondary">
                Subtle tactile touch on each repetition
              </span>
            </div>
          </div>
          <input
            type="checkbox"
            checked={settings?.vibrationEnabled ?? true}
            onChange={(e) => updateSetting('vibrationEnabled', e.target.checked)}
            className="w-5 h-5 accent-primary rounded cursor-pointer"
          />
        </div>

        {/* Wake Lock */}
        <div className="flex items-center justify-between pt-2 border-t border-border/70">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary-soft text-primary">
              <Eye className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-semibold text-text-primary block">
                {t('settings.wakeLock')}
              </span>
              <span className="text-[11px] text-text-secondary">
                Prevents phone screen from dimming during Japa
              </span>
            </div>
          </div>
          <input
            type="checkbox"
            checked={settings?.wakeLockEnabled ?? true}
            onChange={(e) => updateSetting('wakeLockEnabled', e.target.checked)}
            className="w-5 h-5 accent-primary rounded cursor-pointer"
          />
        </div>
      </div>

      {/* Mantra Library Shortcut */}
      <div className="p-5 rounded-3xl bg-white border border-border shadow-card flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-primary-soft text-primary">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-text-primary">
              {t('mantra.title')}
            </h3>
            <span className="text-xs text-text-secondary">
              Select or add sacred custom mantras
            </span>
          </div>
        </div>
        <button
          onClick={onOpenMantraModal}
          className="px-3.5 py-2 rounded-xl bg-primary-soft hover:bg-primary-soft/80 text-primary-dark text-xs font-semibold border border-primary/20 transition-colors"
        >
          Manage
        </button>
      </div>

      {/* MANDATORY: DATA MANAGEMENT SECTION */}
      <div className="p-5 rounded-3xl bg-white border border-border shadow-card space-y-4">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-primary" />
          <h2 className="text-sm font-bold text-text-primary">
            {t('settings.dataManagement')}
          </h2>
        </div>

        <p className="text-xs text-text-secondary leading-relaxed">
          {t('settings.backupExplanation')}
        </p>

        {settings?.lastBackupDate && (
          <div className="text-[11px] text-text-secondary bg-primary-sage/60 p-2.5 rounded-xl border border-border">
            Last JSON Backup: <strong>{settings.lastBackupDate}</strong>
          </div>
        )}

        {/* 2 PROMINENT BUTTONS: EXPORT & RESTORE */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          {/* 1. Export My Japa Data */}
          <button
            onClick={handleExportJson}
            className="p-4 rounded-2xl bg-primary hover:bg-primary-dark text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-md shadow-primary/20 transition-all active:scale-[0.99]"
          >
            <Download className="w-4 h-4" />
            <span>{t('settings.exportData')}</span>
          </button>

          {/* 2. Restore My Japa Data */}
          <button
            onClick={() => setIsRestoreOpen(true)}
            className="p-4 rounded-2xl bg-white hover:bg-primary-sage text-primary-dark font-semibold text-xs border border-primary/30 flex items-center justify-center gap-2 transition-all active:scale-[0.99] shadow-subtle"
          >
            <Upload className="w-4 h-4 text-primary" />
            <span>{t('settings.restoreData')}</span>
          </button>
        </div>

        {/* Additional CSV Exports */}
        <div className="pt-2 border-t border-border space-y-2">
          <span className="text-[11px] font-semibold text-text-secondary uppercase tracking-wider block">
            Spreadsheet Exports (CSV)
          </span>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleExportDailyCsv}
              className="py-2.5 px-3 rounded-xl bg-primary-sage/60 hover:bg-primary-soft text-text-primary text-xs font-medium border border-border flex items-center justify-center gap-1.5 transition-colors"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-primary" />
              <span>{t('settings.exportDailyCsv')}</span>
            </button>

            <button
              onClick={handleExportSessionsCsv}
              className="py-2.5 px-3 rounded-xl bg-primary-sage/60 hover:bg-primary-soft text-text-primary text-xs font-medium border border-border flex items-center justify-center gap-1.5 transition-colors"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-primary" />
              <span>{t('settings.exportSessionCsv')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Security and Privacy Notice */}
      <div className="p-4 rounded-2xl bg-primary-sage/60 border border-border space-y-2">
        <div className="flex items-center gap-2 text-xs font-bold text-primary-dark">
          <Info className="w-4 h-4 text-primary flex-shrink-0" />
          <span>Local-First & Private by Design</span>
        </div>
        <p className="text-[11px] text-text-secondary leading-normal">
          {t('settings.privacyNotice')}
        </p>
        <span className="text-[10px] text-text-secondary font-mono block pt-1">
          {t('settings.appVersion')}
        </span>
      </div>

      {/* Restore Modal */}
      <RestoreModal
        isOpen={isRestoreOpen}
        onClose={() => setIsRestoreOpen(false)}
        onRestoreSuccess={() => {
          onRefreshAll();
          alert('Japa Sankalpa data successfully restored!');
        }}
      />
    </div>
  );
};
