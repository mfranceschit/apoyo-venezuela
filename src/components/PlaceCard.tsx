import type { PlaceWithCount } from '../types';
import type { Translations } from '../i18n';

interface Props {
  place: PlaceWithCount;
  t: Translations;
  onConfirm: (place: PlaceWithCount) => void;
}

export function PlaceCard({ place, t, onConfirm }: Props) {
  const count = place.confirmations.length;

  return (
    <article className="bg-white rounded-2xl p-5 shadow-sm flex flex-col gap-3 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <span
        className={`self-start font-mono text-[0.62rem] tracking-[0.1em] uppercase px-2.5 py-1 rounded-full font-medium ${
          place.type === 'collection'
            ? 'bg-stone-100 text-stone-600'
            : 'bg-amber-50 text-amber-700'
        }`}
      >
        {t.filters[place.type]}
      </span>

      {place.url ? (
        <a
          href={place.url}
          target="_blank"
          rel="noopener noreferrer"
          className="font-display text-xl font-bold text-ink leading-tight hover:text-petroleum transition-colors"
        >
          {place.name}
        </a>
      ) : (
        <h3 className="font-display text-xl font-bold text-ink leading-tight">{place.name}</h3>
      )}

      <p className="text-sm text-ink/55 flex items-center gap-1 -mt-1">
        <span className="text-terracotta text-xs">📍</span>
        {place.city}, {place.country}
      </p>

      {place.address && (
        <p className="text-sm text-ink/70 leading-snug">{place.address}</p>
      )}

      <div className="border-t border-dashed border-ink/15 mt-auto" />

      <div className="flex items-center gap-3">
        {count > 0 ? (
          <div className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-sm ring-2 ring-emerald-500/25">
            <span className="text-base font-bold leading-none">✓</span>
          </div>
        ) : (
          <div className="w-10 h-10 rounded-full border-2 border-dashed border-ink/25 text-ink/35 flex items-center justify-center shrink-0">
            <span className="text-sm font-bold">?</span>
          </div>
        )}

        <div className="flex-1 min-w-0">
          {count > 0 ? (
            <p className="text-sm font-bold text-emerald-700 leading-tight">{t.card.confirmed(count)}</p>
          ) : (
            <>
              <p className="text-sm font-bold text-ink leading-tight">{t.card.unconfirmed}</p>
              <p className="text-xs text-ink/45">{t.card.unconfirmedHint}</p>
            </>
          )}
        </div>

        <button
          className="border border-petroleum text-petroleum rounded-lg text-sm font-semibold px-4 py-2 transition-colors hover:bg-petroleum hover:text-cream cursor-pointer shrink-0"
          onClick={() => onConfirm(place)}
        >
          {t.card.confirm}
        </button>
      </div>
    </article>
  );
}
