import { useEffect, useRef, useState } from 'react';

export interface SelectOption {
  value: string;
  label: string;
}

interface Props {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  id?: string;
  ariaLabel?: string;
  className?: string;
}

/** Styled, keyboard-accessible dropdown that replaces the native <select>. */
export function Select({ value, onChange, options, id, ariaLabel, className }: Props) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const selected = options.find((o) => o.value === value);

  // Close on outside click.
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [open]);

  // When opening, highlight the current value.
  useEffect(() => {
    if (!open) return;
    const idx = options.findIndex((o) => o.value === value);
    setActive(idx >= 0 ? idx : 0);
  }, [open, value, options]);

  // Keep the highlighted option in view while navigating with the keyboard.
  useEffect(() => {
    if (!open) return;
    const node = listRef.current?.children[active] as HTMLElement | undefined;
    node?.scrollIntoView({ block: 'nearest' });
  }, [active, open]);

  const choose = (v: string) => {
    onChange(v);
    setOpen(false);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setOpen(false);
    } else if (!open && (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      setOpen(true);
    } else if (open && e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, options.length - 1));
    } else if (open && e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (open && e.key === 'Enter') {
      e.preventDefault();
      if (options[active]) choose(options[active].value);
    }
  };

  return (
    <div ref={rootRef} className={`relative ${className ?? ''}`}>
      <button
        type="button"
        id={id}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={ariaLabel}
        onClick={() => setOpen((o) => !o)}
        onKeyDown={onKeyDown}
        className="w-full flex items-center justify-between gap-2 text-sm text-left px-3 py-2 border border-ink/15 rounded-lg bg-white text-ink hover:border-petroleum/40 focus:outline-none focus:border-petroleum focus:ring-2 focus:ring-petroleum/15 transition-colors cursor-pointer"
      >
        <span className="truncate">{selected?.label ?? ''}</span>
        <svg
          className={`w-4 h-4 text-ink/40 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`}
          viewBox="0 0 20 20"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          aria-hidden="true"
        >
          <path d="M5 7.5 10 12.5 15 7.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <ul
          ref={listRef}
          role="listbox"
          className="absolute z-50 mt-1.5 w-full max-h-64 overflow-auto rounded-xl border border-ink/10 bg-white py-1 shadow-xl shadow-ink/10"
        >
          {options.map((o, i) => {
            const isSelected = o.value === value;
            const isActive = i === active;
            return (
              <li
                key={o.value}
                role="option"
                aria-selected={isSelected}
                onMouseEnter={() => setActive(i)}
                onClick={() => choose(o.value)}
                className={`flex items-center justify-between gap-2 px-3 py-2 text-sm cursor-pointer transition-colors ${
                  isActive ? 'bg-petroleum/10' : ''
                } ${isSelected ? 'text-petroleum font-semibold' : 'text-ink'}`}
              >
                <span className="truncate">{o.label}</span>
                {isSelected && <span className="text-petroleum text-xs shrink-0">✓</span>}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
