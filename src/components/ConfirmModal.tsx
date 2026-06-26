import { useState } from 'react';
import type { PlaceWithCount, Action } from '../types';
import type { Translations } from '../i18n';
import { Select } from './Select';

const ACTIONS: Action[] = ['left donation', 'volunteered', 'visited and still active'];
const WHEN_OPTIONS = ['today', 'yesterday', 'this-week', 'this-month', 'more-than-a-month'] as const;

const labelClass = 'font-mono text-[0.7rem] uppercase tracking-[0.1em] text-petroleum';

interface Props {
  place: PlaceWithCount;
  t: Translations;
  onClose: () => void;
  onSubmit: (action: Action, when: string) => Promise<void>;
}

export function ConfirmModal({ place, t, onClose, onSubmit }: Props) {
  const [action, setAction] = useState<Action>('left donation');
  const [when, setWhen] = useState<string>('today');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onSubmit(action, when);
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
        aria-labelledby="confirm-modal-title"
      >
        <div>
          <h2 className="font-display text-2xl font-bold text-petroleum" id="confirm-modal-title">
            {t.confirmModal.title}
          </h2>
          <p className="text-sm text-ink/65 mt-1">
            {place.name} · {place.city}
          </p>
        </div>
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-1.5">
            <label className={labelClass} htmlFor="confirm-action">
              {t.confirmModal.action}
            </label>
            <Select
              id="confirm-action"
              value={action}
              onChange={(v) => setAction(v as Action)}
              options={ACTIONS.map((a) => ({ value: a, label: t.confirmModal.actions[a] }))}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className={labelClass} htmlFor="confirm-when">
              {t.confirmModal.when}
            </label>
            <Select
              id="confirm-when"
              value={when}
              onChange={setWhen}
              options={WHEN_OPTIONS.map((opt) => ({ value: opt, label: t.confirmModal.whenOptions[opt] }))}
            />
          </div>
          <div className="flex gap-3 justify-end mt-1">
            <button
              type="button"
              className="text-petroleum font-medium px-4 py-2.5 rounded-lg opacity-65 hover:opacity-100 transition-opacity cursor-pointer"
              onClick={onClose}
            >
              {t.confirmModal.cancel}
            </button>
            <button
              type="submit"
              className="bg-petroleum text-cream font-semibold px-5 py-2.5 rounded-lg hover:bg-petroleum-dark disabled:opacity-50 transition-colors cursor-pointer"
              disabled={submitting}
            >
              {submitting ? '...' : t.confirmModal.submit}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
