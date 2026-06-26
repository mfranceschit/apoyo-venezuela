import type { Filters, PlaceType } from '../types';
import type { Translations } from '../i18n';

const COUNTRIES = ['España', 'Chile', 'Argentina', 'Uruguay', 'México'] as const;
const TYPES: PlaceType[] = ['acopio', 'voluntariado'];

const activeClass = 'bg-petroleum text-cream border-petroleum';
const inactiveClass = 'border-petroleum/20 text-petroleum hover:border-petroleum';
const btnBase =
  'text-sm px-3.5 py-1.5 rounded-full border font-medium transition-all cursor-pointer';

interface Props {
  filters: Filters;
  onChange: (filters: Filters) => void;
  t: Translations;
}

export function FilterBar({ filters, onChange, t }: Props) {
  return (
    <div className="flex gap-2.5 flex-wrap mb-8 items-center" role="group">
      <span className="font-mono text-[0.7rem] uppercase tracking-[0.1em] text-petroleum/65">
        {t.filters.country}:
      </span>
      <button
        className={`${btnBase} ${filters.pais === '' ? activeClass : inactiveClass}`}
        onClick={() => onChange({ ...filters, pais: '' })}
      >
        {t.filters.all}
      </button>
      {COUNTRIES.map((country) => (
        <button
          key={country}
          className={`${btnBase} ${filters.pais === country ? activeClass : inactiveClass}`}
          onClick={() => onChange({ ...filters, pais: country })}
        >
          {t.filters.countries[country]}
        </button>
      ))}
      <span className="font-mono text-[0.7rem] uppercase tracking-[0.1em] text-petroleum/65 ml-2">
        {t.filters.type}:
      </span>
      <button
        className={`${btnBase} ${filters.tipo === '' ? activeClass : inactiveClass}`}
        onClick={() => onChange({ ...filters, tipo: '' })}
      >
        {t.filters.all}
      </button>
      {TYPES.map((tipo) => (
        <button
          key={tipo}
          className={`${btnBase} ${filters.tipo === tipo ? activeClass : inactiveClass}`}
          onClick={() => onChange({ ...filters, tipo })}
        >
          {t.filters[tipo]}
        </button>
      ))}
    </div>
  );
}
