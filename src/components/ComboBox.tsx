import { useEffect, useRef, useState } from 'react';
import type { SelectOption } from './Select';

interface Props {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  id?: string;
  ariaLabel?: string;
  className?: string;
  placeholder?: string;
}

export function ComboBox({ value, onChange, options, id, ariaLabel, className, placeholder }: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const selected = options.find((o) => o.value === value);

  const filtered = query
    ? options.filter((o) => o.label.toLowerCase().includes(query.toLowerCase()))
    : options;

  // Close on outside click.
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery('');
      }
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [open]);

  // When opening, highlight the current value.
  useEffect(() => {
    if (!open) return;
    const idx = filtered.findIndex((o) => o.value === value);
    setActive(idx >= 0 ? idx : 0);
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  // Reset active to 0 when query changes.
  useEffect(() => {
    setActive(0);
  }, [query]);

  // Keep highlighted option in view.
  useEffect(() => {
    if (!open) return;
    const node = listRef.current?.children[active] as HTMLElement | undefined;
    node?.scrollIntoView({ block: 'nearest' });
  }, [active, open]);

  const choose = (v: string) => {
    onChange(v);
    setQuery('');
    setOpen(false);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      setOpen(false);
      setQuery('');
    } else if (!open && (e.key === 'ArrowDown' || e.key === 'Enter')) {
      e.preventDefault();
      setOpen(true);
    } else if (open && e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, filtered.length - 1));
    } else if (open && e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (open && e.key === 'Enter') {
      e.preventDefault();
      if (filtered[active]) choose(filtered[active].value);
    }
  };

  const displayValue = query || (open ? '' : (selected?.label ?? ''));

  return (
    <div ref={rootRef} className={`relative ${className ?? ''}`}>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          id={id}
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-label={ariaLabel}
          placeholder={!open && !value ? placeholder : selected?.label}
          value={displayValue}
          onFocus={() => setOpen(true)}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onKeyDown={onKeyDown}
          onBlur={() => {
            setTimeout(() => {
              if (!rootRef.current?.contains(document.activeElement)) {
                setOpen(false);
                setQuery('');
              }
            }, 150);
          }}
          className="w-full text-sm text-left px-3 py-2 pr-8 border border-ink/15 rounded-lg bg-white text-ink hover:border-petroleum/40 focus:outline-none focus:border-petroleum focus:ring-2 focus:ring-petroleum/15 transition-colors cursor-text"
          autoComplete="off"
        />
        <span
          className="pointer-events-none absolute inset-y-0 right-3 flex items-center"
          aria-hidden="true"
        >
          <svg
            className={`w-4 h-4 text-ink/40 transition-transform ${open ? 'rotate-180' : ''}`}
            viewBox="0 0 20 20"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
          >
            <path d="M5 7.5 10 12.5 15 7.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </div>

      {open && (
        <ul
          ref={listRef}
          role="listbox"
          className="absolute z-50 mt-1.5 w-full max-h-64 overflow-auto rounded-xl border border-ink/10 bg-white py-1 shadow-xl shadow-ink/10"
        >
          {filtered.length === 0 ? (
            <li className="px-3 py-2 text-sm text-ink/40">No results</li>
          ) : (
            filtered.map((o, i) => {
              const isSelected = o.value === value;
              const isActive = i === active;
              return (
                <li
                  key={o.value}
                  role="option"
                  aria-selected={isSelected}
                  onMouseEnter={() => setActive(i)}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    choose(o.value);
                  }}
                  className={`flex items-center justify-between gap-2 px-3 py-2 text-sm cursor-pointer transition-colors ${
                    isActive ? 'bg-petroleum/10' : ''
                  } ${isSelected ? 'text-petroleum font-semibold' : 'text-ink'}`}
                >
                  <span className="truncate">{o.label}</span>
                  {isSelected && <span className="text-petroleum text-xs shrink-0">✓</span>}
                </li>
              );
            })
          )}
        </ul>
      )}
    </div>
  );
}
