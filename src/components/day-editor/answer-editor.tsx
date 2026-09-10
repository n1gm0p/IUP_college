"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { PAIR_TIMES } from "@/lib/constants";
import { formatDayLong, parseDateKey } from "@/lib/date-utils";
import type { PairNumber, PairSlot } from "@/lib/types";

interface AnswerEditorPageProps {
  dateKey: string;
  pairNumber: PairNumber;
  pair: PairSlot;
  onChange: (notes: string) => void;
}

export function AnswerEditorPage({
  dateKey,
  pairNumber,
  pair,
  onChange,
}: AnswerEditorPageProps) {
  const router = useRouter();
  const time = PAIR_TIMES[pairNumber];
  const subject =
    (pair.teacherSubject.split(" — ")[1] ?? pair.teacherSubject) || time.label;
  const dayTitle = capitalize(formatDayLong(parseDateKey(dateKey)));
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.focus();
    // Place caret at end for continued writing
    const len = el.value.length;
    el.setSelectionRange(len, len);
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-[#fbfbfa]">
      <header className="sticky top-0 z-20 border-b border-gray-200/80 bg-[#fbfbfa]/90 backdrop-blur-md">
        <div className="flex w-full items-center gap-3 px-4 py-3 sm:px-6 lg:px-10">
          <button
            type="button"
            onClick={() => router.push(`/day/${dateKey}`)}
            className="flex min-h-[44px] shrink-0 items-center gap-1 text-[17px] text-[#007AFF] active:opacity-60"
          >
            <span className="text-[22px] leading-none">‹</span>
            День
          </button>
          <div className="min-w-0 flex-1 text-center">
            <h1 className="truncate text-[17px] font-semibold text-gray-900">
              {subject}
            </h1>
            <p className="truncate text-[12px] text-gray-500">
              {dayTitle} · {time.label}
            </p>
          </div>
          <span className="w-[64px] shrink-0 text-right text-[12px] tabular-nums text-gray-400">
            {pair.notes.length > 0
              ? pair.notes.length.toLocaleString("ru-RU")
              : ""}
          </span>
        </div>
      </header>

      <main className="flex flex-1 flex-col">
        <textarea
          ref={textareaRef}
          value={pair.notes}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Вставь или напиши ответ… Переносы и отступы сохраняются."
          spellCheck={false}
          className="box-border min-h-[calc(100vh-64px)] w-full flex-1 resize-none border-0 bg-transparent px-4 py-6 font-mono text-[15px] leading-[1.75] text-gray-900 outline-none placeholder:font-sans placeholder:text-gray-300 whitespace-pre-wrap break-words sm:px-8 lg:px-16 lg:text-[16px]"
        />
      </main>
    </div>
  );
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
