"use client";

import { useState } from "react";
import { DriveViewer } from "@/components/drive-viewer";
import { Select } from "@/components/ui/select";
import { PAIR_TIMES, teacherSubjectOptions } from "@/lib/constants";
import type { PairSlot, PairStatus } from "@/lib/types";

interface PairSlotFormProps {
  pair: PairSlot;
  onChange: (patch: Partial<Omit<PairSlot, "pairNumber">>) => void;
}

const selectOptions = teacherSubjectOptions.map((value) => ({
  value,
  label: value,
}));

const STATUS_OPTIONS: { value: PairStatus; label: string }[] = [
  { value: "todo", label: "Не начато" },
  { value: "in_progress", label: "В процессе" },
  { value: "done", label: "Готово" },
];

export function PairSlotForm({ pair, onChange }: PairSlotFormProps) {
  const time = PAIR_TIMES[pair.pairNumber];
  const [viewerOpen, setViewerOpen] = useState(false);
  const hasLink = pair.driveLink.trim().length > 0;

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

        <div className="px-4 py-3.5">
          <p className="mb-2 text-[13px] text-gray-500">Статус</p>
          <div className="flex rounded-lg bg-gray-200/80 p-1">
            {STATUS_OPTIONS.map((opt) => {
              const active = pair.status === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => onChange({ status: opt.value })}
                  className={`min-h-[36px] flex-1 rounded-md px-1 text-sm font-medium transition-colors ${
                    active
                      ? "bg-white text-gray-900 shadow-sm"
                      : "bg-transparent text-gray-600"
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="ml-4 h-px bg-gray-200" />

        <div className="px-4 py-3.5">
          <p className="mb-1.5 text-[13px] text-gray-500">Заметки</p>
          <textarea
            value={pair.notes}
            onChange={(e) => onChange({ notes: e.target.value })}
            placeholder="Домашнее задание, аудитория…"
            rows={2}
            className="w-full resize-none border-0 bg-transparent p-0 text-[17px] leading-snug text-gray-900 outline-none placeholder:text-gray-300"
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
