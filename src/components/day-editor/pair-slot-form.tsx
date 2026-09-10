"use client";

import { useEffect, useRef, useState } from "react";
import { DriveViewer } from "@/components/drive-viewer";
import { Select } from "@/components/ui/select";
import { PAIR_TIMES, teacherSubjectOptions } from "@/lib/constants";
import type { PairSlot } from "@/lib/types";

interface PairSlotFormProps {
  pair: PairSlot;
  onChange: (patch: Partial<Omit<PairSlot, "pairNumber">>) => void;
}

const selectOptions = teacherSubjectOptions.map((value) => ({
  value,
  label: value,
}));

export function PairSlotForm({ pair, onChange }: PairSlotFormProps) {
  const time = PAIR_TIMES[pair.pairNumber];
  const [viewerOpen, setViewerOpen] = useState(false);
  const hasLink = pair.driveLink.trim().length > 0;
  const notesRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const el = notesRef.current;
    if (!el) return;
    el.style.height = "0px";
    el.style.height = `${Math.max(el.scrollHeight, 280)}px`;
  }, [pair.notes]);

  return (
    <section className="space-y-2">
      <div className="flex items-baseline justify-between px-1">
        <h3 className="text-[13px] font-semibold uppercase tracking-wide text-gray-500">
          {time.label}
        </h3>
        <span className="text-[13px] tabular-nums text-gray-400">
          {time.start}–{time.end}
        </span>
      </div>

      <div className="overflow-hidden rounded-2xl bg-white">
        <Select
          value={pair.teacherSubject}
          onValueChange={(teacherSubject) => onChange({ teacherSubject })}
          options={selectOptions}
          placeholder="Выберите пару"
        />

        <div className="ml-4 h-px bg-gray-200" />

        <div className="px-4 py-4 sm:px-5">
          <p className="mb-2 text-[13px] text-gray-500">Ответ</p>
          <textarea
            ref={notesRef}
            value={pair.notes}
            onChange={(e) => onChange({ notes: e.target.value })}
            placeholder="Вставь текст — переносы и отступы сохранятся…"
            spellCheck={false}
            className="min-h-[280px] w-full resize-none border-0 bg-transparent p-0 font-mono text-[15px] leading-[1.7] text-gray-900 outline-none placeholder:font-sans placeholder:text-gray-300 whitespace-pre-wrap break-words"
          />
        </div>

        <div className="ml-4 h-px bg-gray-200" />

        <div className="bg-gray-50 px-4 py-3.5">
          <p className="mb-1.5 text-[13px] text-gray-500">Материал</p>
          <input
            type="url"
            inputMode="url"
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck={false}
            value={pair.driveLink}
            onChange={(e) => onChange({ driveLink: e.target.value })}
            placeholder="Ссылка на Google Диск"
            className="min-h-[44px] w-full rounded-xl border-0 bg-transparent px-0 py-1 text-[17px] text-gray-900 outline-none placeholder:text-gray-300"
          />
          {hasLink && (
            <button
              type="button"
              onClick={() => setViewerOpen(true)}
              className="mt-1 min-h-[40px] text-[15px] font-medium text-[#007AFF] active:opacity-60"
            >
              Открыть на сайте
            </button>
          )}
        </div>
      </div>

      {viewerOpen && hasLink && (
        <DriveViewer
          url={pair.driveLink}
          title={pair.teacherSubject.split(" — ")[1] ?? time.label}
          onClose={() => setViewerOpen(false)}
        />
      )}
    </section>
  );
}
