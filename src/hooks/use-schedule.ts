"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createEmptyPairs } from "@/lib/constants";
import { loadSchedule, saveSchedule } from "@/lib/schedule-storage";
import type { DaySchedule, PairNumber, PairSlot, ScheduleMap } from "@/lib/types";

/**
 * Local state layer mimicking Firestore CRUD.
 * Persists to IndexedDB (with legacy localStorage migration).
 */
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
  const hydratedRef = useRef(false);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latestRef = useRef<ScheduleMap>({});

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const data = await loadSchedule();
      if (cancelled) return;
      latestRef.current = data;
      setSchedule(data);
      hydratedRef.current = true;
      setReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!hydratedRef.current || !ready) return;
    latestRef.current = schedule;

    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      void saveSchedule(latestRef.current).catch(() => {
        /* logged in storage layer */
      });
    }, 200);

    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [schedule, ready]);

  // Flush pending save on tab close / hide
  useEffect(() => {
    const flush = () => {
      if (!hydratedRef.current) return;
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
        saveTimerRef.current = null;
      }
      void saveSchedule(latestRef.current);
    };
    const onVisibility = () => {
      if (document.visibilityState === "hidden") flush();
    };
    window.addEventListener("beforeunload", flush);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.removeEventListener("beforeunload", flush);
      document.removeEventListener("visibilitychange", onVisibility);
      flush();
    };
  }, []);

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
