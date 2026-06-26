import type { Filters, PlaceType } from '../types';
import type { Translations } from '../i18n';

const COUNTRIES = ['España', 'Chile', 'Argentina', 'Uruguay', 'México'] as const;

const activeChip = 'bg-petroleum text-cream border-petroleum';
const inactiveChip = 'border border-ink/15 bg-white text-ink hover:border-petroleum/40';
const chipBase = 'text-sm px-3.5 py-1.5 rounded-full font-medium transition-all cursor-pointer';

const selectClass =
  'text-sm px-3 py-2 border border-ink/15 rounded-lg bg-white text-ink focus:outline-none focus:border-petroleum transition-colors';

interface Props {
  filters: Filters;
  onChange: (filters: Filters) => void;
  t: Translations;
}

export function FilterBar({ filters, onChange, t }: Props) {
  return (
    <div className="flex flex-col gap-3 mb-8">
      <div className="flex items-center gap-3 flex-wrap">
        <span className="font-mono text-[0.7rem] uppercase tracking-[0.1em] text-petroleum/65">
          {t.filters.country}
        </span>
        <select
          className={selectClass}
          value={filters.country}
          onChange={(e) => onChange({ ...filters, country: e.target.value })}
        >
          <option value="">{t.filters.all}</option>
          {COUNTRIES.map((c) => (
            <option key={c} value={c}>
              {t.filters.countries[c] ?? c}
            </option>
          ))}
        </select>
        <input
          type="search"
          className="flex-1 min-w-[180px] text-sm px-3 py-2 border border-ink/15 rounded-lg bg-white text-ink placeholder:text-ink/40 focus:outline-none focus:border-petroleum transition-colors"
          placeholder={t.filters.searchPlaceholder}
          value={filters.search}
          onChange={(e) => onChange({ ...filters, search: e.target.value })}
        />
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <button
          className={`${chipBase} ${filters.type === '' ? activeChip : inactiveChip}`}
          onClick={() => onChange({ ...filters, type: '' })}
        >
          {t.filters.all}
        </button>
        {(['collection', 'volunteering'] as PlaceType[]).map((type) => (
          <button
            key={type}
            className={`${chipBase} ${filters.type === type ? activeChip : inactiveChip}`}
            onClick={() => onChange({ ...filters, type })}
          >
            {t.filters[type]}
          </button>
        ))}

        <span className="mx-1 h-5 w-px bg-ink/15" aria-hidden="true" />

        <button
          aria-pressed={filters.confirmedOnly}
          className={`${chipBase} ${filters.confirmedOnly ? activeChip : inactiveChip}`}
          onClick={() => onChange({ ...filters, confirmedOnly: !filters.confirmedOnly })}
        >
          {t.filters.confirmedOnly}
        </button>
      </div>
    </div>
  );
}
