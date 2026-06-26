import { useState } from 'react';
import type { Filters, LugarWithCount, Lang } from './types';
import { Hero } from './components/Hero';
import { WarningBanner } from './components/WarningBanner';
import { FilterBar } from './components/Filters';
import { PlacesGrid } from './components/PlacesGrid';
import { AddPlaceModal } from './components/AddPlaceModal';
import { ConfirmModal } from './components/ConfirmModal';
import { usePlaces } from './hooks/usePlaces';
import { useTranslation } from './hooks/useTranslation';

export function App() {
  const [lang, setLang] = useState<Lang>('es');
  const [filters, setFilters] = useState<Filters>({ pais: '', tipo: '' });
  const [showAddModal, setShowAddModal] = useState(false);
  const [confirmTarget, setConfirmTarget] = useState<LugarWithCount | null>(null);

  const { t } = useTranslation(lang);
  const { places, loading, error, addPlace, addConfirmation } = usePlaces(filters);

  return (
    <>
      <header className="bg-petroleum text-cream py-4 sticky top-0 z-40 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
          <span className="font-display text-xl font-bold tracking-tight">Apoyo Venezuela</span>
          <button
            className="font-mono text-[0.7rem] text-gold border border-gold px-3 py-1 rounded-full tracking-[0.1em] hover:bg-gold hover:text-petroleum transition-colors cursor-pointer"
            onClick={() => setLang((l) => (l === 'es' ? 'en' : 'es'))}
          >
            {t.langToggle}
          </button>
        </div>
      </header>

      <main>
        <Hero t={t} onAddClick={() => setShowAddModal(true)} />
        <WarningBanner t={t} />
        <section className="py-10 pb-16" id="catalog">
          <div className="max-w-6xl mx-auto px-6">
            <FilterBar filters={filters} onChange={setFilters} t={t} />
            {error && (
              <p className="bg-terracotta/10 border border-terracotta text-terracotta px-4 py-3 rounded-lg text-sm mb-5">
                {error}
              </p>
            )}
            <PlacesGrid places={places} loading={loading} t={t} onConfirm={setConfirmTarget} />
          </div>
        </section>
      </main>

      {showAddModal && (
        <AddPlaceModal
          t={t}
          onClose={() => setShowAddModal(false)}
          onSubmit={async (place) => {
            await addPlace(place);
            setShowAddModal(false);
          }}
        />
      )}

      {confirmTarget !== null && (
        <ConfirmModal
          lugar={confirmTarget}
          t={t}
          onClose={() => setConfirmTarget(null)}
          onSubmit={async (accion, cuando) => {
            await addConfirmation(confirmTarget.id, accion, cuando);
            setConfirmTarget(null);
          }}
        />
      )}
    </>
  );
}
