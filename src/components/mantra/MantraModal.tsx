import React, { useState, useEffect } from 'react';
import { X, Plus, Check, Trash2, Edit2, Sparkles } from 'lucide-react';
import { useI18n } from '../../i18n';
import { db } from '../../db';
import { formatIndianNumber } from '../../utils/date';
import type { Mantra } from '../../types';

interface MantraModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeMantraId: string;
  onSelectMantra: (mantra: Mantra) => void;
}

export const MantraModal: React.FC<MantraModalProps> = ({
  isOpen,
  onClose,
  activeMantraId,
  onSelectMantra,
}) => {
  const { t } = useI18n();

  const [mantras, setMantras] = useState<Mantra[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [mantraText, setMantraText] = useState('');
  const [mantraMeaning, setMantraMeaning] = useState('');

  const loadMantras = async () => {
    const list = await db.mantras.toArray();
    setMantras(list);
  };

  useEffect(() => {
    if (isOpen) {
      loadMantras();
      setIsAdding(false);
      setEditingId(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSaveMantra = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mantraText.trim()) return;

    if (editingId) {
      await db.mantras.update(editingId, {
        name: mantraText.trim(),
        translation: mantraMeaning.trim() || undefined,
      });
    } else {
      const newMantra: Mantra = {
        id: `mantra_custom_${Date.now()}`,
        name: mantraText.trim(),
        translation: mantraMeaning.trim() || undefined,
        language: 'sa',
        isDefault: false,
        totalCount: 0,
        createdAt: Date.now(),
      };
      await db.mantras.add(newMantra);
    }

    setMantraText('');
    setMantraMeaning('');
    setIsAdding(false);
    setEditingId(null);
    await loadMantras();
  };

  const handleEdit = (m: Mantra) => {
    setEditingId(m.id);
    setMantraText(m.name);
    setMantraMeaning(m.translation || '');
    setIsAdding(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this custom mantra?')) {
      await db.mantras.delete(id);
      await loadMantras();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl max-h-[85vh] flex flex-col shadow-2xl border border-border animate-slide-up">
        {/* Header */}
        <div className="p-5 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-accent-gold" />
            <h2 className="text-lg font-bold text-text-primary">
              {t('mantra.title')}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-gray-100 text-text-secondary"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {/* Add / Edit Form */}
          {isAdding ? (
            <form onSubmit={handleSaveMantra} className="p-4 rounded-2xl bg-primary-soft/60 border border-primary/20 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-primary-dark">
                {editingId ? 'Edit Mantra' : t('mantra.addNew')}
              </h3>
              <div>
                <label className="text-[11px] font-semibold text-text-secondary block mb-1">
                  Mantra Text (Devanagari, Telugu, or English)
                </label>
                <input
                  type="text"
                  value={mantraText}
                  onChange={(e) => setMantraText(e.target.value)}
                  placeholder={t('mantra.namePlaceholder')}
                  required
                  className="w-full px-3 py-2 text-sm bg-white border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/40 font-telugu"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-text-secondary block mb-1">
                  Translation / Meaning (Optional)
                </label>
                <input
                  type="text"
                  value={mantraMeaning}
                  onChange={(e) => setMantraMeaning(e.target.value)}
                  placeholder="e.g. Om Namah Shivaya"
                  className="w-full px-3 py-2 text-sm bg-white border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="submit"
                  className="flex-1 py-2 px-4 rounded-xl bg-primary text-white text-xs font-semibold hover:bg-primary-dark shadow-sm"
                >
                  {t('mantra.save')}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsAdding(false);
                    setEditingId(null);
                  }}
                  className="py-2 px-4 rounded-xl bg-white border border-border text-xs font-semibold text-text-secondary hover:bg-gray-50"
                >
                  {t('mantra.cancel')}
                </button>
              </div>
            </form>
          ) : (
            <button
              onClick={() => {
                setMantraText('');
                setMantraMeaning('');
                setEditingId(null);
                setIsAdding(true);
              }}
              className="w-full py-2.5 px-4 rounded-2xl border border-dashed border-primary/40 hover:bg-primary-soft/50 text-primary font-semibold text-xs flex items-center justify-center gap-2 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>{t('mantra.addNew')}</span>
            </button>
          )}

          {/* List of Mantras */}
          <div className="space-y-2">
            {mantras.map((m) => {
              const isActive = m.id === activeMantraId;
              return (
                <div
                  key={m.id}
                  onClick={() => {
                    onSelectMantra(m);
                    onClose();
                  }}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                    isActive
                      ? 'bg-primary-soft/90 border-primary shadow-sm text-primary-dark'
                      : 'bg-white border-border hover:bg-primary-sage/50 text-text-primary'
                  }`}
                >
                  <div className="flex-1 pr-3">
                    <div className="flex items-center gap-2">
                      <span className="text-base font-semibold font-telugu leading-snug">
                        {m.name}
                      </span>
                      {isActive && (
                        <span className="px-2 py-0.5 rounded-full bg-primary text-white text-[10px] font-bold">
                          {t('mantra.active')}
                        </span>
                      )}
                    </div>
                    {m.translation && (
                      <p className="text-xs text-text-secondary mt-0.5">
                        {m.translation}
                      </p>
                    )}
                    <span className="text-[11px] text-text-secondary font-medium block mt-1">
                      {formatIndianNumber(m.totalCount || 0)} {t('mantra.repetitions')} ({Math.floor((m.totalCount || 0) / 108)} Malas)
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                    {!m.isDefault && (
                      <>
                        <button
                          onClick={() => handleEdit(m)}
                          className="p-1.5 rounded-lg text-text-secondary hover:text-primary hover:bg-white"
                          title="Edit"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(m.id)}
                          className="p-1.5 rounded-lg text-text-secondary hover:text-red-500 hover:bg-white"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}
                    {isActive && (
                      <div className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center">
                        <Check className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
