import { useState } from 'react';
import { Analytics } from '@vercel/analytics/react';
import type { Filters, PlaceWithCount, Lang } from './types';
import { Hero } from './components/Hero';
import { WarningBanner } from './components/WarningBanner';
import { FilterBar } from './components/Filters';
import { PlacesGrid } from './components/PlacesGrid';
import { AddPlaceModal } from './components/AddPlaceModal';
import { ConfirmModal } from './components/ConfirmModal';
import { RemovePlaceModal } from './components/RemovePlaceModal';
import { usePlaces } from './hooks/usePlaces';
import { useCountries } from './hooks/useCountries';
import { useTranslation } from './hooks/useTranslation';
import { formatTimezone } from './lib/hours';

const LANGS: Lang[] = ['es', 'en', 'pt'];

export function App() {
  const [lang, setLang] = useState<Lang>('es');
  const [filters, setFilters] = useState<Filters>({ country: '', type: '', search: '', confirmedOnly: false, openNow: false });
  const [showAddModal, setShowAddModal] = useState(false);
  const [confirmTarget, setConfirmTarget] = useState<PlaceWithCount | null>(null);
  const [removeTarget, setRemoveTarget] = useState<PlaceWithCount | null>(null);

  const { t } = useTranslation(lang);
  const { places, loading, error, addPlace, addConfirmation, addClaim } = usePlaces(filters);
  const countries = useCountries();

  const countryNames = countries.map((c) => c.code);
  const selectedTimezone =
    filters.openNow && filters.country
      ? (countries.find((c) => c.code === filters.country)?.timezone ?? null)
      : null;

  return (
    <>
      <header className="bg-petroleum text-cream py-4 sticky top-0 z-40 shadow-sm">
        <div className="max-w-5xl mx-auto px-6 flex items-center justify-between">
          <span className="font-display text-xl font-bold tracking-tight">
            Apoyo<strong className="text-gold">Venezuela</strong>
          </span>
          <div className="flex items-center gap-1 bg-petroleum-dark rounded-full p-1">
            {LANGS.map((l) => (
              <button
                key={l}
                className={`font-mono text-[0.65rem] uppercase tracking-widest px-3 py-1 rounded-full transition-all cursor-pointer ${
                  lang === l
                    ? 'bg-gold text-ink font-bold'
                    : 'text-cream/50 hover:text-cream/80'
                }`}
                onClick={() => setLang(l)}
              >
                {l}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main>
        <Hero t={t} places={places} onAddClick={() => setShowAddModal(true)} />
        <WarningBanner t={t} />

        <section className="py-16 pb-20" id="places">
          <div className="max-w-5xl mx-auto px-6">
            <div className="flex items-baseline gap-4 mb-8 border-b-2 border-ink pb-3">
              <h2 className="font-display text-2xl font-bold text-ink">{t.section.title}</h2>
              <span className="font-mono text-xs text-ink/45">
                {t.section.results(places.length)}
              </span>
              {selectedTimezone && (
                <span className="ml-auto font-mono text-xs text-ink/45">
                  🕐 {formatTimezone(selectedTimezone)}
                </span>
              )}
            </div>

            <FilterBar filters={filters} onChange={setFilters} t={t} countries={countryNames} />

            {error && (
              <p className="bg-terracotta/10 border border-terracotta text-terracotta px-4 py-3 rounded-lg text-sm mb-5">
                {error}
              </p>
            )}

            <PlacesGrid places={places} loading={loading} t={t} onConfirm={setConfirmTarget} onRemove={setRemoveTarget} />
          </div>
        </section>

        <section className="bg-petroleum py-12 px-6">
          <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <h3 className="font-display text-xl font-bold text-cream mb-1">
                {t.addPlaceSection.title}
              </h3>
              <p className="text-cream/60 text-sm max-w-md">{t.addPlaceSection.subtitle}</p>
            </div>
            <button
              className="bg-gold text-ink font-semibold px-6 py-3 rounded-xl hover:brightness-105 transition-all cursor-pointer shrink-0"
              onClick={() => setShowAddModal(true)}
            >
              {t.addPlaceSection.button}
            </button>
          </div>
        </section>
      </main>

      <footer className="bg-petroleum-dark text-cream/45 text-center font-mono text-xs py-6 px-4">
        {t.footer}
      </footer>

      {showAddModal && (
        <AddPlaceModal
          t={t}
          countries={countryNames}
          onClose={() => setShowAddModal(false)}
          onSubmit={async (place) => {
            await addPlace(place);
            setShowAddModal(false);
          }}
        />
      )}

      {confirmTarget !== null && (
        <ConfirmModal
          place={confirmTarget}
          t={t}
          onClose={() => setConfirmTarget(null)}
          onSubmit={async (action, when) => {
            await addConfirmation(confirmTarget.id, action, when);
            setConfirmTarget(null);
          }}
        />
      )}

      {removeTarget !== null && (
        <RemovePlaceModal
          place={removeTarget}
          t={t}
          onClose={() => setRemoveTarget(null)}
          onSubmit={async (reason) => {
            await addClaim(removeTarget.id, reason);
            setRemoveTarget(null);
          }}
        />
      )}

      <Analytics />
    </>
  );
}
