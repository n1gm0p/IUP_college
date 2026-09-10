"use client";

import { use } from "react";
import { notFound } from "next/navigation";
import { AnswerEditorPage } from "@/components/day-editor/answer-editor";
import { useScheduleContext } from "@/context/schedule-context";
import type { PairNumber } from "@/lib/types";

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

function isValidPair(n: number): n is PairNumber {
  return n === 1 || n === 2 || n === 3 || n === 4;
}

export default function PairAnswerPage({
  params,
}: {
  params: Promise<{ date: string; pairNumber: string }>;
}) {
  const { date, pairNumber: pairRaw } = use(params);
  const { ready, getDay, updatePair } = useScheduleContext();

  const pairNumber = Number(pairRaw);

  if (!isValidDateKey(date) || !isValidPair(pairNumber)) notFound();

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#fbfbfa] text-[15px] text-gray-400">
        Загрузка…
      </div>
    );
  }

  const day = getDay(date);
  const pair = day.pairs.find((p) => p.pairNumber === pairNumber);
  if (!pair) notFound();

  return (
    <AnswerEditorPage
      dateKey={date}
      pairNumber={pairNumber}
      pair={pair}
      onChange={(notes) => updatePair(date, pairNumber, { notes })}
    />
  );
}
