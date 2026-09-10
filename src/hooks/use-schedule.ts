"use client";

import { useCallback, useEffect, useState } from "react";
import { createEmptyPairs } from "@/lib/constants";
import type { DaySchedule, PairNumber, PairSlot, ScheduleMap } from "@/lib/types";
import { createMockSchedule } from "@/data/mock";

const STORAGE_KEY = "iup-college-schedule-v7";

/**
 * Local state layer mimicking Firestore CRUD.
 * Swap implementations inside these functions for Firebase later:
 *   getDay  → getDoc(doc(db, "schedules", date))
 *   upsert  → setDoc(doc(db, "schedules", date), data, { merge: true })
 */
function normalizeSchedule(raw: ScheduleMap): ScheduleMap {
  const next: ScheduleMap = {};
  for (const [date, day] of Object.entries(raw)) {
    next[date] = {
      date: day.date,
      pairs: day.pairs.map((p) => ({
        pairNumber: p.pairNumber,
        teacherSubject: p.teacherSubject ?? "",
        notes: p.notes ?? "",
        driveLink: p.driveLink ?? "",
      })),
    };
  }
  return next;
}

function loadInitial(): ScheduleMap {
  if (typeof window === "undefined") return createMockSchedule();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return normalizeSchedule(JSON.parse(raw) as ScheduleMap);
  } catch {
    /* ignore */
  }
  return createMockSchedule();
}

function ensureDay(map: ScheduleMap, date: string): DaySchedule {
  return (
    map[date] ?? {
      date,
      pairs: createEmptyPairs(),
    }
  );
}

export function useSchedule() {
  const [schedule, setSchedule] = useState<ScheduleMap>({});
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setSchedule(loadInitial());
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(schedule));
    } catch {
      /* quota / private mode */
    }
  }, [schedule, ready]);

  const getDay = useCallback(
    (date: string): DaySchedule => ensureDay(schedule, date),
    [schedule]
  );

  const hasContent = useCallback(
    (date: string): boolean => {
      const day = schedule[date];
      if (!day) return false;
      return day.pairs.some((p) => p.teacherSubject || p.notes || p.driveLink.trim());
    },
    [schedule]
  );

  const updatePair = useCallback(
    (date: string, pairNumber: PairNumber, patch: Partial<Omit<PairSlot, "pairNumber">>) => {
      setSchedule((prev) => {
        const day = ensureDay(prev, date);
        const pairs = day.pairs.map((p) =>
          p.pairNumber === pairNumber ? { ...p, ...patch } : p
        );
        return { ...prev, [date]: { ...day, pairs } };
      });
    },
    []
  );

  const clearDay = useCallback((date: string) => {
    setSchedule((prev) => {
      const next = { ...prev };
      delete next[date];
      return next;
    });
  }, []);

  return {
    schedule,
    ready,
    getDay,
    hasContent,
    updatePair,
    clearDay,
  };
}

export type UseScheduleReturn = ReturnType<typeof useSchedule>;
