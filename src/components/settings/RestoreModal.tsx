import React, { useState } from 'react';
import {
  Upload,
  AlertTriangle,
  CheckCircle,
  FileText,
  X,
  ShieldAlert,
  Download,
} from 'lucide-react';
import { useI18n } from '../../i18n';
import { validateBackupFile, executeRestore, type ValidationResult } from '../../services/backupService';
import { formatIndianNumber } from '../../utils/date';
import type { JapaBackupPayload } from '../../types';

interface RestoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRestoreSuccess: () => void;
}

export const RestoreModal: React.FC<RestoreModalProps> = ({
  isOpen,
  onClose,
  onRestoreSuccess,
}) => {
  const { t } = useI18n();

  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isRestored, setIsRestored] = useState(false);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMessage(null);
    setValidationResult(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = JSON.parse(text);
        const result = validateBackupFile(parsed);

        if (!result.isValid) {
          setErrorMessage(result.error || t('restore.errorMessage'));
        } else {
          setValidationResult(result);
        }
      } catch (err) {
        setErrorMessage('Invalid file format. Please upload a valid JSON backup file.');
      }
    };
    reader.readAsText(file);
  };

  const handleConfirmRestore = async () => {
    if (!validationResult?.payload) return;

    setIsProcessing(true);
    try {
      await executeRestore(validationResult.payload);
      setIsRestored(true);
      setTimeout(() => {
        onRestoreSuccess();
        onClose();
      }, 1500);
    } catch (err: any) {
      setErrorMessage(`Restoration failed: ${err.message || 'Unknown error'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-border animate-scale-up space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-border">
          <div className="flex items-center gap-2">
            <Upload className="w-5 h-5 text-primary" />
            <h2 className="text-base font-bold text-text-primary">
              {t('restore.title')}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-text-secondary hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success Message */}
        {isRestored ? (
          <div className="p-6 text-center space-y-3">
            <div className="w-14 h-14 rounded-full bg-primary-soft text-primary mx-auto flex items-center justify-center">
              <CheckCircle className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-text-primary">
              Restoration Complete!
            </h3>
            <p className="text-xs text-text-secondary">
              {t('restore.successMessage')}
            </p>
          </div>
        ) : (
          <>
            <p className="text-xs text-text-secondary">
              {t('restore.description')}
            </p>

            {/* File input */}
            {!validationResult && (
              <label className="border-2 border-dashed border-primary/30 hover:border-primary rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer bg-primary-sage/40 hover:bg-primary-soft/50 transition-colors">
                <Upload className="w-8 h-8 text-primary mb-2" />
                <span className="text-xs font-semibold text-text-primary">
                  Select Backup JSON File
                </span>
                <span className="text-[10px] text-text-secondary mt-1">
                  (e.g. japa-sankalpa-backup-2026-11-06.json)
                </span>
                <input
                  type="file"
                  accept=".json,application/json"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            )}

            {/* Error Message */}
            {errorMessage && (
              <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Validated Backup Preview & Safety Confirmation */}
            {validationResult?.summary && (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-primary-soft/80 border border-primary/20 space-y-2">
                  <span className="text-xs font-bold text-primary-dark block uppercase tracking-wide">
                    Backup Details Verified
                  </span>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-[10px] text-text-secondary block">Backup Date:</span>
                      <strong className="text-text-primary">{new Date(validationResult.summary.backupDate).toLocaleDateString()}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-text-secondary block">Total Repetitions:</span>
                      <strong className="text-primary-dark">{formatIndianNumber(validationResult.summary.totalRepetitions)}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-text-secondary block">Sessions:</span>
                      <strong className="text-text-primary">{validationResult.summary.sessionCount}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-text-secondary block">Sankalpa Target:</span>
                      <strong className="text-text-primary">{formatIndianNumber(validationResult.summary.sankalpaTarget)}</strong>
                    </div>
                  </div>
                </div>

                {/* Safety Warning */}
                <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5">
                  <ShieldAlert className="w-5 h-5 flex-shrink-0 text-amber-600 mt-0.5" />
                  <div className="space-y-1">
                    <span className="font-semibold block">Safety Guarantee:</span>
                    <span>
                      {t('restore.warning')} A safety backup of your existing records will be automatically downloaded before restoration.
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-2">
                  <button
                    onClick={handleConfirmRestore}
                    disabled={isProcessing}
                    className="flex-1 py-3 px-4 rounded-xl bg-primary hover:bg-primary-dark text-white font-semibold text-xs shadow-md shadow-primary/20 transition-all disabled:opacity-50"
                  >
                    {isProcessing ? 'Restoring safely...' : t('restore.confirmButton')}
                  </button>
                  <button
                    onClick={() => {
                      setValidationResult(null);
                      setErrorMessage(null);
                    }}
                    disabled={isProcessing}
                    className="py-3 px-4 rounded-xl bg-white border border-border text-text-secondary hover:bg-gray-50 text-xs font-semibold"
                  >
                    {t('restore.cancelButton')}
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
