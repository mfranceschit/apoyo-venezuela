import type { DayKey, DayRange, Hours, Place } from '../types';

export const DAY_ORDER: DayKey[] = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];

/**
 * Country (as stored in the DB) -> IANA timezone. "Open now" must be evaluated
 * in each place's local time, not the visitor's browser time.
 */
const COUNTRY_TZ: Record<string, string> = {
  España: 'Europe/Madrid',
  Chile: 'America/Santiago',
  Argentina: 'America/Argentina/Buenos_Aires',
  Uruguay: 'America/Montevideo',
  México: 'America/Mexico_City',
  Colombia: 'America/Bogota',
  Venezuela: 'America/Caracas',
  Perú: 'America/Lima',
  Ecuador: 'America/Guayaquil',
  Brasil: 'America/Sao_Paulo',
  Panamá: 'America/Panama',
  'Estados Unidos': 'America/New_York',
};

/** Fallback when a country has no explicit mapping. */
const DEFAULT_TZ = 'America/Caracas';

export function timezoneFor(country: string): string {
  return COUNTRY_TZ[country] ?? DEFAULT_TZ;
}

const WEEKDAY_TO_KEY: Record<string, DayKey> = {
  Mon: 'mon',
  Tue: 'tue',
  Wed: 'wed',
  Thu: 'thu',
  Fri: 'fri',
  Sat: 'sat',
  Sun: 'sun',
};

/** Current weekday + minutes-since-midnight in the given timezone. */
function localParts(tz: string, now: Date): { day: DayKey; minutes: number } {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: tz,
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(now);

  const weekday = parts.find((p) => p.type === 'weekday')?.value ?? 'Mon';
  const hour = parts.find((p) => p.type === 'hour')?.value ?? '00';
  const minute = parts.find((p) => p.type === 'minute')?.value ?? '00';

  let h = parseInt(hour, 10);
  if (h === 24) h = 0; // some engines emit 24 for midnight under h23
  return { day: WEEKDAY_TO_KEY[weekday] ?? 'mon', minutes: h * 60 + parseInt(minute, 10) };
}

/** 'HH:MM' -> minutes since midnight. '24:00' -> 1440. */
function toMinutes(time: string): number {
  const [h, m] = time.split(':').map((n) => parseInt(n, 10));
  return h * 60 + (m || 0);
}

export function isRangeOpen(range: DayRange, minutes: number): boolean {
  const open = toMinutes(range[0]);
  const close = toMinutes(range[1]);
  if (close > open) return minutes >= open && minutes < close;
  // Overnight range (e.g. 22:00–02:00): open if before close OR after open.
  return minutes >= open || minutes < close;
}

/**
 * Is the place open right now in its local timezone?
 * Returns null when the place has no structured hours (we can't claim it's open).
 */
export function isOpenNow(place: Place, now: Date = new Date()): boolean | null {
  if (!place.hours || Object.keys(place.hours).length === 0) return null;
  const { day, minutes } = localParts(timezoneFor(place.country), now);
  const range = place.hours[day];
  if (!range) return false;
  return isRangeOpen(range, minutes);
}

/** Group consecutive days (mon→sun) that share an identical range, for compact display. */
export function summarizeHours(hours: Hours): { days: DayKey[]; range: DayRange }[] {
  const groups: { days: DayKey[]; range: DayRange }[] = [];
  for (const day of DAY_ORDER) {
    const range = hours[day];
    if (!range) continue;
    const last = groups[groups.length - 1];
    if (last && last.range[0] === range[0] && last.range[1] === range[1]) {
      last.days.push(day);
    } else {
      groups.push({ days: [day], range: [...range] });
    }
  }
  return groups;
}

export function is24h(range: DayRange): boolean {
  return toMinutes(range[0]) === 0 && toMinutes(range[1]) >= 1440;
}
