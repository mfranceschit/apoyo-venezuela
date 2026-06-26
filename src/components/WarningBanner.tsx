import type { Translations } from '../i18n';

interface Props {
  t: Translations;
}

export function WarningBanner({ t }: Props) {
  return (
    <div className="relative z-20 -mt-12 max-w-4xl mx-auto px-4">
      <div className="bg-cream border-2 border-terracotta rounded-2xl shadow-lg px-6 py-4 flex gap-3">
        <span className="text-terracotta text-xl flex-shrink-0 mt-0.5">⚠️</span>
        <p className="text-sm text-ink leading-relaxed">
          <strong className="font-semibold">{t.warning.title}</strong>{' '}
          {t.warning.text}
        </p>
      </div>
    </div>
  );
}
