import { translations } from '../i18n';
import type { Lang } from '../types';
import type { Translations } from '../i18n';

export function useTranslation(lang: Lang): { t: Translations } {
  return { t: translations[lang] };
}
