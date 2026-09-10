"use client";

import { useEffect, useState, type ReactNode } from "react";

interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  large?: boolean;
}

export function BottomSheet({
  open,
  onClose,
  title,
  children,
  large = false,
}: BottomSheetProps) {
  const [visible, setVisible] = useState(false);
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    if (open) {
      setVisible(true);
      const id = requestAnimationFrame(() => {
        requestAnimationFrame(() => setAnimating(true));
      });
      document.body.style.overflow = "hidden";
      return () => cancelAnimationFrame(id);
    }

    if (visible) {
      setAnimating(false);
      const t = window.setTimeout(() => setVisible(false), 280);
      document.body.style.overflow = "";
      return () => window.clearTimeout(t);
    }
  }, [open, visible]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-end sm:justify-center">
      <button
        type="button"
        aria-label="Закрыть"
        onClick={onClose}
        className={`absolute inset-0 bg-black/30 backdrop-blur-md transition-opacity ${
          animating ? "opacity-100" : "opacity-0"
        }`}
        style={{ transitionDuration: "280ms" }}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`relative z-10 flex w-full flex-col overflow-hidden rounded-t-2xl bg-gray-100 transition-transform ease-out ${
          large
            ? "h-[94vh] max-h-[94vh] sm:max-w-5xl sm:rounded-2xl"
            : "max-h-[88vh] sm:max-w-xl lg:max-w-2xl"
        } ${animating ? "translate-y-0" : "translate-y-full"}`}
        style={{ transitionDuration: "280ms" }}
      >
        <div className="flex shrink-0 flex-col items-center pt-2">
          <div className="h-1 w-9 rounded-full bg-gray-300" />
        </div>

        <header className="relative flex shrink-0 items-center px-4 pb-2 pt-3">
          <button
            type="button"
            onClick={onClose}
            className="z-10 min-h-[44px] text-[17px] font-normal text-[#007AFF] active:opacity-60"
          >
            Готово
          </button>
          {title ? (
            <h2 className="pointer-events-none absolute inset-x-16 truncate text-center text-[17px] font-semibold text-gray-900">
              {title}
            </h2>
          ) : null}
        </header>

        <div
          className={`min-h-0 flex-1 overscroll-contain px-4 pb-10 pt-2 ${
            large ? "flex flex-col overflow-hidden" : "overflow-y-auto"
          }`}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
