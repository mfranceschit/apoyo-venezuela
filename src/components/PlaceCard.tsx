import type { LugarWithCount } from '../types';
import type { Translations } from '../i18n';

function TrustStamp({ count }: { count: number }) {
  if (count === 0) {
    return (
      <div
        className="w-11 h-11 rounded-full border-2 border-dashed border-petroleum/30 text-petroleum/45 flex flex-col items-center justify-center shrink-0"
        aria-label="No confirmations"
      >
        <span className="text-base font-bold leading-none">?</span>
      </div>
    );
  }
  return (
    <div
      className="w-11 h-11 rounded-full bg-petroleum text-cream flex flex-col items-center justify-center shrink-0 gap-0.5"
      aria-label={`${count} confirmations`}
    >
      <span className="text-base font-bold leading-none">✓</span>
      <span className="font-mono text-[0.58rem] leading-none">{count}</span>
    </div>
  );
}

interface Props {
  lugar: LugarWithCount;
  t: Translations;
  onConfirm: (lugar: LugarWithCount) => void;
}

export function PlaceCard({ lugar, t, onConfirm }: Props) {
  const count = lugar.confirmaciones.length;
  return (
    <article className="bg-white rounded-xl p-5 shadow-sm flex flex-col gap-2 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between gap-2 mb-1">
        <span
          className={`font-mono text-[0.62rem] tracking-[0.1em] uppercase px-2.5 py-1 rounded-full font-medium ${
            lugar.tipo === 'acopio'
              ? 'bg-petroleum/10 text-petroleum'
              : 'bg-amber-100 text-amber-800'
          }`}
        >
          {t.filters[lugar.tipo]}
        </span>
        <TrustStamp count={count} />
      </div>
      <h3 className="font-display text-lg font-bold text-ink leading-tight">{lugar.nombre}</h3>
      <p className="font-mono text-[0.72rem] text-petroleum/65 tracking-wide">
        {lugar.ciudad}, {lugar.pais}
      </p>
      {lugar.direccion && (
        <p className="text-sm text-ink/75 leading-snug">{lugar.direccion}</p>
      )}
      <p className="text-sm text-petroleum/80 italic mt-0.5">
        {count > 0 ? t.card.confirmed(count) : t.card.unconfirmed}
      </p>
      <button
        className="mt-auto bg-petroleum text-cream rounded-lg text-sm font-semibold px-4 py-2 self-start transition-colors hover:bg-petroleum-dark cursor-pointer"
        onClick={() => onConfirm(lugar)}
      >
        {t.card.confirm}
      </button>
    </article>
  );
}
