// src/components/RemovePlaceModal.tsx
import { useState } from 'react';
import type { PlaceWithCount } from '../types';
import type { ClaimReason } from '../types';
import type { Translations } from '../i18n';
import { Select } from './Select';

const CLAIM_REASONS: ClaimReason[] = [
  'suspicious_activity',
  'permanently_closed',
  'incorrect_data',
];

const labelClass = 'font-mono text-[0.7rem] uppercase tracking-[0.1em] text-petroleum';

interface Props {
  place: PlaceWithCount;
  t: Translations;
  onClose: () => void;
  onSubmit: (reason: ClaimReason) => Promise<void>;
}

export function RemovePlaceModal({ place, t, onClose, onSubmit }: Props) {
  const [reason, setReason] = useState<ClaimReason>('suspicious_activity');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onSubmit(reason);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-ink/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="bg-cream rounded-xl p-8 w-full max-w-lg shadow-xl flex flex-col gap-5"
        role="dialog"
        aria-modal="true"
        aria-labelledby="remove-modal-title"
      >
        <div>
          <h2 className="font-display text-2xl font-bold text-petroleum" id="remove-modal-title">
            {t.removeModal.title}
          </h2>
          <p className="text-sm text-ink/65 mt-1">
            {place.name} · {place.city}
          </p>
        </div>
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-1.5">
            <label className={labelClass} htmlFor="remove-reason">
              {t.removeModal.reason}
            </label>
            <Select
              id="remove-reason"
              value={reason}
              onChange={(v) => setReason(v as ClaimReason)}
              options={CLAIM_REASONS.map((r) => ({ value: r, label: t.removeModal.reasons[r] }))}
            />
          </div>
          <p className="text-xs text-ink/50 leading-relaxed">{t.removeModal.disclaimer}</p>
          <div className="flex gap-3 justify-end mt-1">
            <button
              type="button"
              className="text-petroleum font-medium px-4 py-2.5 rounded-lg opacity-65 hover:opacity-100 transition-opacity cursor-pointer"
              onClick={onClose}
            >
              {t.removeModal.cancel}
            </button>
            <button
              type="submit"
              className="bg-petroleum text-cream font-semibold px-5 py-2.5 rounded-lg hover:bg-petroleum-dark disabled:opacity-50 transition-colors cursor-pointer"
              disabled={submitting}
            >
              {submitting ? '...' : t.removeModal.submit}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
