import { useState } from 'react';
import type { Place, PlaceType, DayKey, Hours } from '../types';
import type { Translations } from '../i18n';
import { DAY_ORDER } from '../lib/hours';
import { Select } from './Select';

const inputClass =
  'w-full text-base px-3.5 py-2.5 border border-petroleum/20 rounded-lg bg-white text-ink focus:outline-none focus:border-petroleum transition-colors';
const labelClass = 'font-mono text-[0.7rem] uppercase tracking-[0.1em] text-petroleum';

type DayState = { enabled: boolean; open: string; close: string };

const initialDayHours = (): Record<DayKey, DayState> =>
  DAY_ORDER.reduce(
    (acc, d) => ({ ...acc, [d]: { enabled: false, open: '09:00', close: '18:00' } }),
    {} as Record<DayKey, DayState>,
  );

function buildHours(dayHours: Record<DayKey, DayState>, hoursMode: 'schedule' | 'open24'): Hours | null {
  if (hoursMode === 'open24') {
    return DAY_ORDER.reduce((acc, d) => ({ ...acc, [d]: ['00:00', '24:00'] }), {} as Hours);
  }
  const hours: Hours = {};
  for (const d of DAY_ORDER) {
    if (dayHours[d].enabled) hours[d] = [dayHours[d].open, dayHours[d].close];
  }
  return Object.keys(hours).length > 0 ? hours : null;
}

interface Props {
  t: Translations;
  countries: string[];
  onClose: () => void;
  onSubmit: (place: Omit<Place, 'id' | 'created_at' | 'timezone'>) => Promise<void>;
}

export function AddPlaceModal({ t, countries, onClose, onSubmit }: Props) {
  const [name, setName] = useState('');
  const [type, setType] = useState<PlaceType>('collection');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState(() => countries[0] ?? 'España');
  const [address, setAddress] = useState('');
  const [url, setUrl] = useState('');
  const [hoursMode, setHoursMode] = useState<'schedule' | 'open24'>('schedule');
  const [dayHours, setDayHours] = useState<Record<DayKey, DayState>>(initialDayHours);
  const [submitting, setSubmitting] = useState(false);
  const [hoursOpen, setHoursOpen] = useState(false);

  const setDay = (day: DayKey, patch: Partial<DayState>) =>
    setDayHours((prev) => ({ ...prev, [day]: { ...prev[day], ...patch } }));

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
        hours: buildHours(dayHours, hoursMode),
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
        className="bg-cream rounded-xl w-full max-w-lg shadow-xl flex flex-col max-h-[90vh]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-place-title"
      >
        <div className="px-8 pt-8 pb-4">
          <h2 className="font-display text-2xl font-bold text-petroleum" id="add-place-title">
            {t.addPlace.title}
          </h2>
        </div>
        <form className="flex flex-col min-h-0 flex-1" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-4 overflow-y-auto no-scrollbar px-8 pb-4 flex-1">
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
            <Select
              id="add-type"
              value={type}
              onChange={(v) => setType(v as PlaceType)}
              options={[
                { value: 'collection', label: t.filters.collection },
                { value: 'volunteering', label: t.filters.volunteering },
              ]}
            />
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
            <Select
              id="add-country"
              value={country}
              onChange={setCountry}
              options={countries.map((c) => ({ value: c, label: t.filters.countries[c] ?? c }))}
            />
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
          <div className="flex flex-col gap-2">
            <button
              type="button"
              className="flex items-center justify-between w-full cursor-pointer group"
              onClick={() => setHoursOpen((v) => !v)}
            >
              <span className={labelClass}>{t.addPlace.hours.label}</span>
              <span className="text-petroleum/50 group-hover:text-petroleum transition-colors text-lg leading-none">
                {hoursOpen ? '−' : '+'}
              </span>
            </button>
            {hoursOpen && (
              <>
                <div className="flex w-full border border-petroleum/20 rounded-lg overflow-hidden bg-white text-sm font-medium mb-2">
                  <button
                    type="button"
                    className={`flex-1 py-2.5 text-center transition-colors cursor-pointer ${hoursMode === 'schedule' ? 'bg-petroleum text-cream' : 'text-ink/60 hover:text-ink'}`}
                    onClick={() => setHoursMode('schedule')}
                  >
                    {t.hours.title}
                  </button>
                  <button
                    type="button"
                    className={`flex-1 py-2.5 text-center transition-colors cursor-pointer ${hoursMode === 'open24' ? 'bg-petroleum text-cream' : 'text-ink/60 hover:text-ink'}`}
                    onClick={() => setHoursMode('open24')}
                  >
                    {t.hours.open24}
                  </button>
                </div>
                {hoursMode === 'schedule' && (
                  <div className="flex flex-col gap-1.5">
                    {DAY_ORDER.map((day) => {
                      const ds = dayHours[day];
                      return (
                        <div key={day} className="flex items-center gap-3">
                          <label className="flex items-center gap-2 w-16 text-base text-ink cursor-pointer shrink-0">
                            <span className="relative flex items-center justify-center">
                              <input
                                type="checkbox"
                                className="peer w-4 h-4 appearance-none rounded border border-petroleum/20 bg-white checked:bg-petroleum checked:border-petroleum cursor-pointer transition-colors"
                                checked={ds.enabled}
                                onChange={(e) => setDay(day, { enabled: e.target.checked })}
                              />
                              <svg className="absolute pointer-events-none hidden peer-checked:block w-2.5 h-2.5 text-white" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5">
                                <polyline points="1.5,5 4,7.5 8.5,2.5" />
                              </svg>
                            </span>
                            {t.hours.days[day]}
                          </label>
                          {ds.enabled ? (
                            <div className="flex items-center gap-2 flex-1">
                              <input
                                type="time"
                                className="text-base px-3.5 py-2.5 border border-petroleum/20 rounded-lg bg-white text-ink focus:outline-none focus:border-petroleum transition-colors flex-1"
                                value={ds.open}
                                onChange={(e) => setDay(day, { open: e.target.value })}
                              />
                              <span className="text-ink/40 shrink-0">–</span>
                              <input
                                type="time"
                                className="text-base px-3.5 py-2.5 border border-petroleum/20 rounded-lg bg-white text-ink focus:outline-none focus:border-petroleum transition-colors flex-1"
                                value={ds.close}
                                onChange={(e) => setDay(day, { close: e.target.value })}
                              />
                            </div>
                          ) : (
                            <span className="text-base text-ink/35">{t.addPlace.hours.closed}</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            )}
          </div>
          </div>

          <div className="flex gap-3 justify-end px-8 py-5 border-t border-petroleum/10 flex-shrink-0">
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
