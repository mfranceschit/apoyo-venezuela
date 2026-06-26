import { es } from './es';
import { en } from './en';
import { pt } from './pt';
import type { Lang } from '../types';

export type Translations = typeof es;

export const translations: Record<Lang, Translations> = { es, en, pt };
