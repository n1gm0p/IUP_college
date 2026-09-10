"use client";

import { createContext, useContext, type ReactNode } from "react";
import { useSchedule, type UseScheduleReturn } from "@/hooks/use-schedule";

const ScheduleContext = createContext<UseScheduleReturn | null>(null);

export function ScheduleProvider({ children }: { children: ReactNode }) {
  const value = useSchedule();
  return (
    <ScheduleContext.Provider value={value}>{children}</ScheduleContext.Provider>
  );
}

export function useScheduleContext(): UseScheduleReturn {
  const ctx = useContext(ScheduleContext);
  if (!ctx) {
    throw new Error("useScheduleContext must be used within ScheduleProvider");
  }
  return ctx;
}
