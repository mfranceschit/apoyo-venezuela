import type { DayKey, DayRange, Hours, Place } from '../types';

export const DAY_ORDER: DayKey[] = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];

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
  if (h === 24) h = 0;
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
  return minutes >= open || minutes < close;
}

/**
 * Is the place open right now in its local timezone?
 * Returns null when hours or timezone are missing (can't determine open/closed).
 */
export function isOpenNow(place: Place, now: Date = new Date()): boolean | null {
  if (!place.hours || Object.keys(place.hours).length === 0) return null;
  if (!place.timezone) return null;
  const { day, minutes } = localParts(place.timezone, now);
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

/** Converts an IANA timezone string to a human-readable Spanish label. */
export function formatTimezone(tz: string): string {
  return (
    new Intl.DateTimeFormat('es', {
      timeZoneName: 'longGeneric',
      timeZone: tz,
    })
      .formatToParts(new Date())
      .find((p) => p.type === 'timeZoneName')?.value ?? tz
  );
}
