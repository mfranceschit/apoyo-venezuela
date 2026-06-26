import { PlaceCard } from './PlaceCard';
import type { LugarWithCount } from '../types';
import type { Translations } from '../i18n';

interface Props {
  places: LugarWithCount[];
  loading: boolean;
  t: Translations;
  onConfirm: (lugar: LugarWithCount) => void;
}

const gridClass = 'grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-5';
const emptyClass = 'col-span-full text-center py-14 font-mono text-sm text-petroleum/55';

export function PlacesGrid({ places, loading, t, onConfirm }: Props) {
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
        <p className={emptyClass}>{t.empty}</p>
      </div>
    );
  }
  return (
    <div className={gridClass}>
      {places.map((lugar) => (
        <PlaceCard key={lugar.id} lugar={lugar} t={t} onConfirm={onConfirm} />
      ))}
    </div>
  );
}
