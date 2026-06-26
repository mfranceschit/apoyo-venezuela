import { useState } from 'react';
import type { LugarWithCount, Action } from '../types';
import type { Translations } from '../i18n';

const ACTIONS: Action[] = ['dejé donativo', 'fui voluntario', 'lo visité y sigue activo'];

const inputClass =
  'w-full text-base px-3.5 py-2.5 border border-petroleum/20 rounded-lg bg-white text-ink focus:outline-none focus:border-petroleum transition-colors';
const labelClass = 'font-mono text-[0.7rem] uppercase tracking-[0.1em] text-petroleum';

interface Props {
  lugar: LugarWithCount;
  t: Translations;
  onClose: () => void;
  onSubmit: (accion: Action, cuando: string) => Promise<void>;
}

export function ConfirmModal({ lugar, t, onClose, onSubmit }: Props) {
  const [accion, setAccion] = useState<Action>('dejé donativo');
  const [cuando, setCuando] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cuando.trim()) return;
    setSubmitting(true);
    try {
      await onSubmit(accion, cuando.trim());
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
            {lugar.nombre} · {lugar.ciudad}
          </p>
        </div>
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-1.5">
            <label className={labelClass} htmlFor="confirm-accion">
              {t.confirmModal.action}
            </label>
            <select
              id="confirm-accion"
              className={inputClass}
              value={accion}
              onChange={(e) => setAccion(e.target.value as Action)}
            >
              {ACTIONS.map((a) => (
                <option key={a} value={a}>
                  {t.confirmModal.actions[a]}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className={labelClass} htmlFor="confirm-cuando">
              {t.confirmModal.when}
            </label>
            <input
              id="confirm-cuando"
              className={inputClass}
              value={cuando}
              onChange={(e) => setCuando(e.target.value)}
              placeholder={t.confirmModal.whenPlaceholder}
              required
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
