export type PlaceType = 'acopio' | 'voluntariado';

export type Action = 'dejé donativo' | 'fui voluntario' | 'lo visité y sigue activo';

export type Lang = 'es' | 'en';

export interface Lugar {
  id: string;
  nombre: string;
  tipo: PlaceType;
  ciudad: string;
  pais: string;
  direccion: string | null;
  creado_en: string;
}

export interface Confirmacion {
  id: string;
  lugar_id: string;
  accion: Action;
  cuando: string;
  creado_en: string;
}

export interface LugarWithCount extends Lugar {
  confirmaciones: Confirmacion[];
}

export interface Filters {
  pais: string;
  tipo: PlaceType | '';
}
