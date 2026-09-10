"use client";

import { useRouter } from "next/navigation";
import { PairSlotForm } from "@/components/day-editor/pair-slot-form";
import { formatDayLong, parseDateKey } from "@/lib/date-utils";
import type { DaySchedule, PairNumber, PairSlot } from "@/lib/types";

interface DayEditorPageProps {
  dateKey: string;
  day: DaySchedule;
  onUpdatePair: (
    pairNumber: PairNumber,
    patch: Partial<Omit<PairSlot, "pairNumber">>
  ) => void;
  onClearDay: () => void;
}

export function DayEditorPage({
  dateKey,
  day,
  onUpdatePair,
  onClearDay,
}: DayEditorPageProps) {
  const router = useRouter();
  const title = capitalize(formatDayLong(parseDateKey(dateKey)));

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="sticky top-0 z-20 border-b border-gray-200/80 bg-gray-100/90 backdrop-blur-md">
        <div className="flex w-full items-center gap-3 px-4 py-3 sm:px-6 lg:px-10 xl:px-12">
          <button
            type="button"
            onClick={() => router.push("/")}
            className="flex min-h-[44px] items-center gap-1 text-[17px] text-[#007AFF] active:opacity-60"
          >
            <span className="text-[22px] leading-none">‹</span>
            Назад
          </button>
          <h1 className="min-w-0 flex-1 truncate text-center text-[17px] font-semibold text-gray-900 lg:text-[19px]">
            {title}
          </h1>
          <span className="w-[72px]" aria-hidden />
        </div>
      </header>

      <main className="w-full px-4 pb-16 pt-6 sm:px-6 lg:px-10 xl:px-12">
        <div className="mx-auto w-full max-w-3xl space-y-6 lg:max-w-4xl lg:space-y-8">
          {day.pairs.map((pair) => (
            <PairSlotForm
              key={pair.pairNumber}
              dateKey={dateKey}
              pair={pair}
              onChange={(patch) => onUpdatePair(pair.pairNumber, patch)}
            />
          ))}

          <button
            type="button"
            onClick={() => {
              onClearDay();
              router.push("/");
            }}
            className="min-h-[48px] w-full rounded-2xl bg-white py-3.5 text-[17px] text-red-500 active:bg-gray-50"
          >
            Очистить день
          </button>
        </div>
      </main>
    </div>
  );
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
