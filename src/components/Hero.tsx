import type { PlaceWithCount } from '../types';
import type { Translations } from '../i18n';

interface Props {
  t: Translations;
  places: PlaceWithCount[];
  onAddClick: () => void;
}

export function Hero({ t, places, onAddClick }: Props) {
  const uniqueCountries = new Set(places.map((p) => p.country)).size;
  const confirmedPlaces = places.filter((p) => p.confirmations.length > 0).length;

  return (
    <section
      className="relative overflow-hidden bg-petroleum-dark text-cream py-16 px-6"
      style={{
        backgroundImage: `
          radial-gradient(ellipse 60% 70% at 100% 0%, rgba(242,199,92,0.18) 0%, transparent 65%),
          repeating-linear-gradient(
            -45deg,
            transparent,
            transparent 28px,
            rgba(255,255,255,0.025) 28px,
            rgba(255,255,255,0.025) 30px
          )
        `,
      }}
    >
      <div className="max-w-5xl mx-auto">
        <p className="flex items-center gap-2 font-mono text-xs text-gold uppercase tracking-widest mb-6">
          <span className="inline-block w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          {t.hero.eyebrow}
        </p>

        <h1 className="font-display text-4xl md:text-5xl font-bold leading-tight mb-6 max-w-2xl">
          {t.hero.titleParts.before}
          <em className="not-italic italic text-gold">{t.hero.titleParts.em}</em>
          {t.hero.titleParts.after}
        </h1>

        <p className="text-cream/70 text-lg mb-10 max-w-xl leading-relaxed">
          {t.hero.subtitle}
        </p>

        <div className="flex gap-10 mb-10">
          <div>
            <p className="font-display text-4xl font-bold text-gold">{places.length}</p>
            <p className="text-cream/60 text-sm mt-1">{t.hero.stats.places}</p>
          </div>
          <div>
            <p className="font-display text-4xl font-bold text-gold">{uniqueCountries}</p>
            <p className="text-cream/60 text-sm mt-1">{t.hero.stats.countries}</p>
          </div>
          <div>
            <p className="font-display text-4xl font-bold text-gold">{confirmedPlaces}</p>
            <p className="text-cream/60 text-sm mt-1">{t.hero.stats.confirmed}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <a
            href="#places"
            className="bg-gold text-ink font-semibold px-6 py-3 rounded-xl hover:brightness-105 transition-all"
          >
            {t.hero.cta}
          </a>
          <button
            onClick={onAddClick}
            className="border border-cream/40 text-cream px-6 py-3 rounded-xl hover:bg-cream/10 transition-all cursor-pointer"
          >
            {t.hero.add}
          </button>
        </div>
      </div>
    </section>
  );
}
