export type PlaceType = 'collection' | 'volunteering';

export type Action = 'left donation' | 'volunteered' | 'visited and still active';

export type Lang = 'es' | 'en' | 'pt';

export type DayKey = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';

/** [open, close] in 'HH:MM' 24h format. close may be '24:00' for end of day. */
export type DayRange = [string, string];

/** A weekly schedule. A missing day means closed that day. */
export type Hours = Partial<Record<DayKey, DayRange>>;

export interface Place {
  id: string;
  name: string;
  type: PlaceType;
  city: string;
  country: string;
  address: string | null;
  url: string | null;
  hours: Hours | null;
  created_at: string;
}

export interface Confirmation {
  id: string;
  place_id: string;
  action: Action;
  when: string;
  created_at: string;
}

export interface PlaceWithCount extends Place {
  confirmations: Confirmation[];
}

export interface Filters {
  country: string;
  type: PlaceType | '';
  search: string;
  confirmedOnly: boolean;
  openNow: boolean;
}
