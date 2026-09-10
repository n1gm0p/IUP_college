"use client";

import { use, useMemo } from "react";
import { notFound } from "next/navigation";
import { DayEditorPage } from "@/components/day-editor/day-editor";
import { useScheduleContext } from "@/context/schedule-context";

function isValidDateKey(key: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(key)) return false;
  const [y, m, d] = key.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return (
    date.getFullYear() === y &&
    date.getMonth() === m - 1 &&
    date.getDate() === d
  );
}

export default function DayPage({
  params,
}: {
  params: Promise<{ date: string }>;
}) {
  const { date } = use(params);
  const { ready, getDay, updatePair, clearDay } = useScheduleContext();

  const valid = useMemo(() => isValidDateKey(date), [date]);

  if (!valid) notFound();

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100 text-[15px] text-gray-400">
        Загрузка…
      </div>
    );
  }

  const day = getDay(date);

  return (
    <DayEditorPage
      dateKey={date}
      day={day}
      onUpdatePair={(pairNumber, patch) => updatePair(date, pairNumber, patch)}
      onClearDay={() => clearDay(date)}
    />
  );
}
