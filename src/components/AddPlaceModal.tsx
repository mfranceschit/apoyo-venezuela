import { useState } from 'react';
import type { Lugar, PlaceType } from '../types';
import type { Translations } from '../i18n';

const COUNTRIES = ['España', 'Chile', 'Argentina', 'Uruguay', 'México'] as const;

const inputClass =
  'w-full text-base px-3.5 py-2.5 border border-petroleum/20 rounded-lg bg-white text-ink focus:outline-none focus:border-petroleum transition-colors';
const labelClass = 'font-mono text-[0.7rem] uppercase tracking-[0.1em] text-petroleum';

interface Props {
  t: Translations;
  onClose: () => void;
  onSubmit: (place: Omit<Lugar, 'id' | 'creado_en'>) => Promise<void>;
}

export function AddPlaceModal({ t, onClose, onSubmit }: Props) {
  const [nombre, setNombre] = useState('');
  const [tipo, setTipo] = useState<PlaceType>('acopio');
  const [ciudad, setCiudad] = useState('');
  const [pais, setPais] = useState('España');
  const [direccion, setDireccion] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim() || !ciudad.trim()) return;
    setSubmitting(true);
    try {
      await onSubmit({
        nombre: nombre.trim(),
        tipo,
        ciudad: ciudad.trim(),
        pais,
        direccion: direccion.trim() || null,
      });
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
        aria-labelledby="add-place-title"
      >
        <h2 className="font-display text-2xl font-bold text-petroleum" id="add-place-title">
          {t.addPlace.title}
        </h2>
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-1.5">
            <label className={labelClass} htmlFor="add-nombre">
              {t.addPlace.name}
            </label>
            <input
              id="add-nombre"
              className={inputClass}
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder={t.addPlace.placeholder.name}
              required
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className={labelClass} htmlFor="add-tipo">
              {t.addPlace.type}
            </label>
            <select
              id="add-tipo"
              className={inputClass}
              value={tipo}
              onChange={(e) => setTipo(e.target.value as PlaceType)}
            >
              <option value="acopio">{t.filters.acopio}</option>
              <option value="voluntariado">{t.filters.voluntariado}</option>
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className={labelClass} htmlFor="add-ciudad">
              {t.addPlace.city}
            </label>
            <input
              id="add-ciudad"
              className={inputClass}
              value={ciudad}
              onChange={(e) => setCiudad(e.target.value)}
              placeholder={t.addPlace.placeholder.city}
              required
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className={labelClass} htmlFor="add-pais">
              {t.addPlace.country}
            </label>
            <select
              id="add-pais"
              className={inputClass}
              value={pais}
              onChange={(e) => setPais(e.target.value)}
            >
              {COUNTRIES.map((c) => (
                <option key={c} value={c}>
                  {t.filters.countries[c]}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className={labelClass} htmlFor="add-direccion">
              {t.addPlace.address}
            </label>
            <input
              id="add-direccion"
              className={inputClass}
              value={direccion}
              onChange={(e) => setDireccion(e.target.value)}
              placeholder={t.addPlace.placeholder.address}
            />
          </div>
          <div className="flex gap-3 justify-end mt-1">
            <button
              type="button"
              className="text-petroleum font-medium px-4 py-2.5 rounded-lg opacity-65 hover:opacity-100 transition-opacity cursor-pointer"
              onClick={onClose}
            >
              {t.addPlace.cancel}
            </button>
            <button
              type="submit"
              className="bg-petroleum text-cream font-semibold px-5 py-2.5 rounded-lg hover:bg-petroleum-dark disabled:opacity-50 transition-colors cursor-pointer"
              disabled={submitting}
            >
              {submitting ? '...' : t.addPlace.submit}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
