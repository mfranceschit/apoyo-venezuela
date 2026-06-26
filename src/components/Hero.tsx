import type { Translations } from '../i18n';

interface Props {
  t: Translations;
  onAddClick: () => void;
}

export function Hero({ t, onAddClick }: Props) {
  return (
    <section className="bg-petroleum text-cream py-20 text-center">
      <div className="max-w-6xl mx-auto px-6">
        <p className="font-mono text-[0.7rem] tracking-[0.14em] uppercase text-gold mb-4">
          {t.hero.eyebrow}
        </p>
        <h1 className="font-display text-5xl md:text-6xl font-black leading-tight mb-4">
          {t.hero.title}
        </h1>
        <p className="text-lg opacity-85 max-w-xl mx-auto mb-9 leading-relaxed">
          {t.hero.subtitle}
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          <a
            href="#catalog"
            className="bg-gold text-petroleum font-bold px-7 py-3 rounded-lg text-base transition-all hover:brightness-90 hover:-translate-y-px"
          >
            {t.hero.cta}
          </a>
          <button
            className="border border-cream/50 text-cream font-semibold px-6 py-3 rounded-lg transition-all hover:border-cream hover:bg-cream/10 cursor-pointer"
            onClick={onAddClick}
          >
            {t.hero.add}
          </button>
        </div>
      </div>
    </section>
  );
}
