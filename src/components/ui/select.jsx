'use client';

import { Children, isValidElement, useEffect, useId, useRef, useState } from 'react';

//Dropdown sendiri, pengganti <select> bawaan supaya daftar pilihannya bisa diberi gaya.
//Dipakai seperti <select>: isi dengan <option>, dan onChange menerima { target: { value } }.
export default function Select({ id, value, onChange, className = '', disabled = false, name, children }) {
  const autoId = useId();
  const buttonId = id ?? autoId;
  const rootRef = useRef(null);
  const listRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);

  //Daftar pilihan dari <option> anak komponen
  const options = [];
  for (const child of Children.toArray(children)) {
    if (isValidElement(child) && child.type === 'option') {
      options.push({ value: String(child.props.value ?? ''), label: child.props.children });
    }
  }

  const selectedIndex = options.findIndex((o) => o.value === String(value ?? ''));
  const selected = options[selectedIndex] ?? options[0];

  //Tutup saat klik di luar atau tekan Tab
  useEffect(() => {
    if (!open) return;

    function handlePointer(e) {
      if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handlePointer);
    return () => document.removeEventListener('mousedown', handlePointer);
  }, [open]);

  function openList() {
    if (disabled) return;
    setActive(selectedIndex >= 0 ? selectedIndex : 0);
    setOpen(true);
  }

  function choose(index) {
    const option = options[index];
    if (!option) return;
    setOpen(false);
    onChange?.({ target: { value: option.value, name, id: buttonId } });
    rootRef.current?.querySelector('button')?.focus();
  }

  function handleKey(e) {
    if (disabled) return;

    if (!open) {
      if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(e.key)) {
        e.preventDefault();
        openList();
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((i) => Math.min(i + 1, options.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      choose(active);
    } else if (e.key === 'Escape' || e.key === 'Tab') {
      setOpen(false);
    }
  }

  const wrapperWidth = className.includes('w-full') ? 'w-full' : 'inline-block';

  return (
    <div ref={rootRef} className={`relative ${wrapperWidth}`}>
      <button
        id={buttonId}
        type="button"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? `${buttonId}-list` : undefined}
        disabled={disabled}
        onClick={() => (open ? setOpen(false) : openList())}
        onKeyDown={handleKey}
        className={`group flex items-center justify-between gap-3 text-left transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-60 ${
          open ? 'border-orange-500 ring-2 ring-orange-300' : 'hover:border-orange-400'
        } ${className}`}
      >
        <span className="truncate">{selected?.label ?? ''}</span>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`h-4 w-4 shrink-0 text-orange-500 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          aria-hidden="true"
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {open && (
        <ul
          ref={listRef}
          id={`${buttonId}-list`}
          role="listbox"
          aria-labelledby={buttonId}
          className="absolute left-0 right-0 z-50 mt-2 max-h-72 overflow-auto rounded-xl border border-orange-200 bg-white p-1.5 shadow-xl shadow-orange-500/10"
        >
          {options.map((option, index) => {
            const isSelected = index === selectedIndex;
            const isActive = index === active;
            return (
              <li
                key={`${option.value}-${index}`}
                role="option"
                aria-selected={isSelected}
                onMouseEnter={() => setActive(index)}
                onMouseDown={(e) => {
                  e.preventDefault();
                  choose(index);
                }}
                className={`flex cursor-pointer items-center justify-between gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                  isSelected
                    ? 'bg-gradient-to-r from-orange-500 to-amber-500 font-bold text-white'
                    : isActive
                      ? 'bg-orange-50 text-orange-700'
                      : 'text-slate-800'
                }`}
              >
                <span className="truncate">{option.label}</span>
                {isSelected && (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 shrink-0" aria-hidden="true">
                    <path d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
