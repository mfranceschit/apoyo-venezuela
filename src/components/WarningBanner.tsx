import type { Translations } from '../i18n';

interface Props {
  t: Translations;
}

export function WarningBanner({ t }: Props) {
  return (
    <div className="bg-amber-50 border-l-4 border-terracotta py-3.5" role="alert">
      <div className="max-w-6xl mx-auto px-6 flex items-start gap-3">
        <span className="text-terracotta text-lg shrink-0 leading-6" aria-hidden="true">
          ⚠
        </span>
        <p className="text-sm text-ink">{t.warning.text}</p>
      </div>
    </div>
  );
}
