"use client";

import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";

export interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  options: SelectOption[];
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
}

/** iOS Settings-style disclosure row + picker sheet */
export function Select({
  options,
  value,
  onValueChange,
  placeholder = "Не выбрано",
}: SelectProps) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const listId = useId();
  const selected = options.find((o) => o.value === value);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const display = selected?.label ?? placeholder;
  const [teacher, subject] = splitLabel(display);

  return (
    <>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen(true)}
        className="flex w-full items-center gap-3 bg-white px-4 py-3 text-left active:bg-gray-50"
      >
        <div className="min-w-0 flex-1">
          <p className="text-[13px] text-gray-500">Предмет</p>
          {selected ? (
            <>
              <p className="truncate text-[17px] text-gray-900">{subject}</p>
              <p className="truncate text-[15px] text-gray-500">{teacher}</p>
            </>
          ) : (
            <p className="text-[17px] text-gray-400">{placeholder}</p>
          )}
        </div>
        <ChevronRight />
      </button>

      {mounted &&
        open &&
        createPortal(
          <PickerSheet
            listId={listId}
            options={options}
            value={value}
            placeholder={placeholder}
            onClose={() => setOpen(false)}
            onPick={(v) => {
              onValueChange(v);
              setOpen(false);
            }}
          />,
          document.body
        )}
    </>
  );
}

function PickerSheet({
  listId,
  options,
  value,
  placeholder,
  onClose,
  onPick,
}: {
  listId: string;
  options: SelectOption[];
  value: string;
  placeholder: string;
  onClose: () => void;
  onPick: (v: string) => void;
}) {
  const [animating, setAnimating] = useState(false);
  const sheetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => setAnimating(true));
    });
  }, []);

  const items = [{ value: "", label: placeholder }, ...options];

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center">
      <button
        type="button"
        aria-label="Закрыть"
        className={`absolute inset-0 bg-black/30 backdrop-blur-sm transition-opacity duration-280 ${
          animating ? "opacity-100" : "opacity-0"
        }`}
        onClick={onClose}
      />
      <div
        ref={sheetRef}
        role="listbox"
        id={listId}
        className={`relative z-10 flex max-h-[80vh] w-full flex-col overflow-hidden rounded-t-2xl bg-gray-100 transition-transform duration-280 ease-out ${
          animating ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <div className="flex flex-col items-center pt-2">
          <div className="h-1 w-9 rounded-full bg-gray-300" />
        </div>
        <header className="flex items-center justify-between px-4 py-3">
          <button
            type="button"
            onClick={onClose}
            className="text-[17px] text-[#007AFF] active:opacity-60"
          >
            Отмена
          </button>
          <h3 className="text-[17px] font-semibold text-gray-900">Выбор пары</h3>
          <span className="w-[64px]" />
        </header>

        <ul className="mx-4 mb-8 overflow-y-auto rounded-2xl bg-white">
          {items.map((opt, i) => {
            const isSelected = opt.value === value;
            const isLast = i === items.length - 1;
            return (
              <li key={opt.value || "__empty"}>
                <button
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => onPick(opt.value)}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left active:bg-gray-50"
                >
                  <span
                    className={`min-w-0 flex-1 text-[17px] ${
                      opt.value === "" ? "text-gray-400" : "text-gray-900"
                    }`}
                  >
                    {opt.label}
                  </span>
                  {isSelected && <Checkmark />}
                </button>
                {!isLast && <div className="ml-4 h-px bg-gray-200" />}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

function splitLabel(label: string): [string, string] {
  const parts = label.split(" — ");
  if (parts.length < 2) return ["", label];
  return [parts[0], parts.slice(1).join(" — ")];
}

function ChevronRight() {
  return (
    <svg
      width="8"
      height="14"
      viewBox="0 0 8 14"
      fill="none"
      aria-hidden
      className="shrink-0 text-gray-300"
    >
      <path
        d="M1 1l6 6-6 6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function Checkmark() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      className="shrink-0 text-[#007AFF]"
    >
      <path
        d="M5 12l5 5L20 7"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
