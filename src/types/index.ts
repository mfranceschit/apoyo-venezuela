export type PlaceType = 'collection' | 'volunteering';

export type Action = 'left donation' | 'volunteered' | 'visited and still active';

export type Lang = 'es' | 'en' | 'pt';

export interface Place {
  id: string;
  name: string;
  type: PlaceType;
  city: string;
  country: string;
  address: string | null;
  url: string | null;
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
}
