import { PlaceCard } from './PlaceCard';
import type { PlaceWithCount } from '../types';
import type { Translations } from '../i18n';

interface Props {
  places: PlaceWithCount[];
  loading: boolean;
  t: Translations;
  onConfirm: (place: PlaceWithCount) => void;
  onRemove: (place: PlaceWithCount) => void;
}

const gridClass = 'grid grid-cols-[repeat(auto-fill,minmax(310px,1fr))] gap-5';
const emptyClass = 'col-span-full text-center py-14 font-mono text-sm text-petroleum/55';

export function PlacesGrid({ places, loading, t, onConfirm, onRemove }: Props) {
  if (loading) {
    return (
      <div className={gridClass}>
        <p className={emptyClass}>{t.loading}</p>
      </div>
    );
  }
  if (places.length === 0) {
    return (
      <div className={gridClass}>
        <div className={emptyClass}>
          <p className="font-semibold text-base text-ink/60 mb-1">{t.empty}</p>
          <p className="text-ink/40">{t.emptyHint}</p>
        </div>
      </div>
    );
  }
  return (
    <div className={gridClass}>
      {places.map((place) => (
        <PlaceCard key={place.id} place={place} t={t} onConfirm={onConfirm} onRemove={onRemove} />
      ))}
    </div>
  );
}
