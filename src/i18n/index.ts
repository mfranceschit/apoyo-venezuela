import { es } from './es';
import { en } from './en';
import type { Lang } from '../types';

export type Translations = typeof es;

export const translations: Record<Lang, Translations> = { es, en };
