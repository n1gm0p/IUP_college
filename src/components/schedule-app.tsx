"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarView } from "@/components/calendar/calendar-view";
import { useScheduleContext } from "@/context/schedule-context";
import { PAIR_TIMES } from "@/lib/constants";
import { parseDateKey, toDateKey } from "@/lib/date-utils";
import type { CalendarMode, DayPairPreview } from "@/lib/types";

const CAL_STATE_KEY = "iup-college-calendar-ui";

export function ScheduleApp() {
  const router = useRouter();
  const { ready, getDay, hasContent } = useScheduleContext();

  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const [mode, setMode] = useState<CalendarMode>("week");
  const [anchor, setAnchor] = useState(() => new Date());
  const [restored, setRestored] = useState(false);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(CAL_STATE_KEY);
      if (raw) {
        const saved = JSON.parse(raw) as { mode?: CalendarMode; anchor?: string };
        if (saved.mode === "week" || saved.mode === "month") setMode(saved.mode);
        if (saved.anchor) setAnchor(parseDateKey(saved.anchor));
      }
    } catch {
      /* ignore */
    }
    setRestored(true);
  }, []);

  useEffect(() => {
    if (!restored) return;
    try {
      sessionStorage.setItem(
        CAL_STATE_KEY,
        JSON.stringify({ mode, anchor: toDateKey(anchor) })
      );
    } catch {
      /* ignore */
    }
  }, [mode, anchor, restored]);

  const getDayPreview = (dateKey: string): DayPairPreview[] => {
    const day = getDay(dateKey);
    return day.pairs
      .filter((p) => p.teacherSubject || p.driveLink.trim())
      .map((p) => ({
        pairNumber: p.pairNumber,
        time: PAIR_TIMES[p.pairNumber].start,
        subject: p.teacherSubject
          ? (p.teacherSubject.split(" — ")[1] ?? p.teacherSubject)
          : "Материал",
        driveLink: p.driveLink,
      }));
  };

  const openDay = (dateKey: string) => {
    setMode("week");
    setAnchor(parseDateKey(dateKey));
    try {
      sessionStorage.setItem(
        CAL_STATE_KEY,
        JSON.stringify({ mode: "week", anchor: dateKey })
      );
    } catch {
      /* ignore */
    }
    router.push(`/day/${dateKey}`);
  };

  if (!ready || !restored) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100 text-[15px] text-gray-400">
        Загрузка…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <main className="w-full px-4 pb-12 pt-8 sm:px-6 lg:px-10 xl:px-12">
        <CalendarView
          mode={mode}
          anchor={anchor}
          today={today}
          selectedKey={null}
          onModeChange={setMode}
          onAnchorChange={setAnchor}
          onSelectDay={openDay}
          hasContent={hasContent}
          getDayPreview={getDayPreview}
        />
      </main>
    </div>
  );
}
