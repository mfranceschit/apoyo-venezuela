export type PlaceType = 'collection' | 'volunteering';
export type Action = 'left donation' | 'volunteered' | 'visited and still active';
export type ClaimReason = 'suspicious_activity' | 'permanently_closed' | 'incorrect_data';
export type DayKey = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';
export type DayRange = [string, string];
export type Hours = Partial<Record<DayKey, DayRange>>;

export interface AddPlacePayload {
  name: string;
  type: PlaceType;
  city: string;
  country: string;
  address: string | null;
  url: string | null;
  hours: Hours | null;
}

export interface AddConfirmationPayload {
  placeId: string;
  action: Action;
  when: string;
}

export interface ReportPlacePayload {
  placeId: string;
  reason: ClaimReason;
}

const PLACE_TYPES: PlaceType[] = ['collection', 'volunteering'];
const ACTIONS: Action[] = ['left donation', 'volunteered', 'visited and still active'];
const WHEN_OPTIONS = ['today', 'yesterday', 'this-week', 'this-month', 'more-than-a-month'];
const CLAIM_REASONS: ClaimReason[] = ['suspicious_activity', 'permanently_closed', 'incorrect_data'];
const DAY_KEYS: DayKey[] = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];

function requireRecord(value: unknown): Record<string, unknown> {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error('Invalid request body');
  }
  return value as Record<string, unknown>;
}

function optionalString(value: unknown): string | null {
  if (value === null || value === undefined) return null;
  if (typeof value !== 'string') throw new Error('Invalid optional text field');
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function requiredString(value: unknown, field: string, maxLength: number): string {
  if (typeof value !== 'string') throw new Error(`${field} is required`);
  const trimmed = value.trim();
  if (trimmed.length === 0) throw new Error(`${field} is required`);
  if (trimmed.length > maxLength) throw new Error(`${field} is too long`);
  return trimmed;
}

function normalizeUrl(value: unknown): string | null {
  const url = optionalString(value);
  if (url === null) return null;
  if (url.length > 500) throw new Error('URL is too long');
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    throw new Error('URL must start with http:// or https://');
  }
  try {
    new URL(url);
  } catch {
    throw new Error('URL is invalid');
  }
  return url;
}

function isTwoDigitNumber(value: string): boolean {
  return value.length === 2 && value >= '00' && value <= '99';
}

function isValidTime(value: string): boolean {
  if (value === '24:00') return true;
  const parts = value.split(':');
  if (parts.length !== 2) return false;
  const [hour, minute] = parts;
  if (!isTwoDigitNumber(hour) || !isTwoDigitNumber(minute)) return false;
  const hourNumber = Number(hour);
  const minuteNumber = Number(minute);
  return hourNumber >= 0 && hourNumber <= 23 && minuteNumber >= 0 && minuteNumber <= 59;
}

function normalizeHours(value: unknown): Hours | null {
  if (value === null || value === undefined) return null;
  const input = requireRecord(value);
  const hours: Hours = {};

  for (const [day, range] of Object.entries(input)) {
    if (!DAY_KEYS.includes(day as DayKey)) throw new Error('Invalid hours day');
    if (!Array.isArray(range) || range.length !== 2) throw new Error('Invalid hours range');
    const [open, close] = range;
    if (typeof open !== 'string' || typeof close !== 'string') throw new Error('Invalid hours range');
    if (!isValidTime(open) || !isValidTime(close)) throw new Error('Invalid hours time');
    hours[day as DayKey] = [open, close];
  }

  return Object.keys(hours).length > 0 ? hours : null;
}

export function normalizeAddPlacePayload(input: unknown): AddPlacePayload {
  const body = requireRecord(input);
  const type = body.type;
  if (!PLACE_TYPES.includes(type as PlaceType)) throw new Error('Invalid place type');

  const address = optionalString(body.address);
  if (address !== null && address.length > 500) throw new Error('Address is too long');

  return {
    name: requiredString(body.name, 'Name', 120),
    type: type as PlaceType,
    city: requiredString(body.city, 'City', 80),
    country: requiredString(body.country, 'Country', 80),
    address,
    url: normalizeUrl(body.url),
    hours: normalizeHours(body.hours),
  };
}

export function normalizeAddConfirmationPayload(input: unknown): AddConfirmationPayload {
  const body = requireRecord(input);
  const action = body.action;
  const when = body.when;
  if (!ACTIONS.includes(action as Action)) throw new Error('Invalid confirmation action');
  if (!WHEN_OPTIONS.includes(when as string)) throw new Error('Invalid confirmation time');

  return {
    placeId: requiredString(body.placeId, 'Place id', 80),
    action: action as Action,
    when: when as string,
  };
}

export function normalizeReportPlacePayload(input: unknown): ReportPlacePayload {
  const body = requireRecord(input);
  const reason = body.reason;
  if (!CLAIM_REASONS.includes(reason as ClaimReason)) throw new Error('Invalid report reason');

  return {
    placeId: requiredString(body.placeId, 'Place id', 80),
    reason: reason as ClaimReason,
  };
}

async function sha256(value: string): Promise<string> {
  const bytes = new TextEncoder().encode(value);
  const hash = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(hash))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}

export async function buildRateLimitKeys({
  operation,
  ip,
  userAgent,
  placeId,
}: {
  operation: 'add-place' | 'add-confirmation' | 'report-place';
  ip: string;
  userAgent: string;
  placeId?: string;
}): Promise<string[]> {
  const fingerprint = await sha256(`${ip}|${userAgent}`);
  const keys = [`${operation}:${fingerprint}`];
  if ((operation === 'add-confirmation' || operation === 'report-place') && placeId) {
    keys.push(`${operation}:${placeId}:${fingerprint}`);
  }
  return keys;
}
