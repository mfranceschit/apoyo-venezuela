import { useState } from 'react';
import type { Place, PlaceType } from '../types';
import type { Translations } from '../i18n';

const inputClass =
  'w-full text-base px-3.5 py-2.5 border border-petroleum/20 rounded-lg bg-white text-ink focus:outline-none focus:border-petroleum transition-colors';
const labelClass = 'font-mono text-[0.7rem] uppercase tracking-[0.1em] text-petroleum';

interface Props {
  t: Translations;
  countries: string[];
  onClose: () => void;
  onSubmit: (place: Omit<Place, 'id' | 'created_at'>) => Promise<void>;
}

export function AddPlaceModal({ t, countries, onClose, onSubmit }: Props) {
  const [name, setName] = useState('');
  const [type, setType] = useState<PlaceType>('collection');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState(() => countries[0] ?? 'España');
  const [address, setAddress] = useState('');
  const [url, setUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !city.trim()) return;
    setSubmitting(true);
    try {
      await onSubmit({
        name: name.trim(),
        type,
        city: city.trim(),
        country,
        address: address.trim() || null,
        url: url.trim() || null,
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
        className="bg-cream rounded-xl p-8 w-full max-w-lg shadow-xl flex flex-col gap-5 max-h-[90vh] overflow-y-auto"
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-place-title"
      >
        <h2 className="font-display text-2xl font-bold text-petroleum" id="add-place-title">
          {t.addPlace.title}
        </h2>
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-1.5">
            <label className={labelClass} htmlFor="add-name">
              {t.addPlace.name}
            </label>
            <input
              id="add-name"
              className={inputClass}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t.addPlace.placeholder.name}
              required
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className={labelClass} htmlFor="add-type">
              {t.addPlace.type}
            </label>
            <select
              id="add-type"
              className={inputClass}
              value={type}
              onChange={(e) => setType(e.target.value as PlaceType)}
            >
              <option value="collection">{t.filters.collection}</option>
              <option value="volunteering">{t.filters.volunteering}</option>
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className={labelClass} htmlFor="add-city">
              {t.addPlace.city}
            </label>
            <input
              id="add-city"
              className={inputClass}
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder={t.addPlace.placeholder.city}
              required
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className={labelClass} htmlFor="add-country">
              {t.addPlace.country}
            </label>
            <select
              id="add-country"
              className={inputClass}
              value={country}
              onChange={(e) => setCountry(e.target.value)}
            >
              {countries.map((c) => (
                <option key={c} value={c}>
                  {t.filters.countries[c] ?? c}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className={labelClass} htmlFor="add-address">
              {t.addPlace.address}
            </label>
            <input
              id="add-address"
              className={inputClass}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder={t.addPlace.placeholder.address}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className={labelClass} htmlFor="add-url">
              {t.addPlace.url}
            </label>
            <input
              id="add-url"
              type="url"
              className={inputClass}
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder={t.addPlace.placeholder.url}
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
