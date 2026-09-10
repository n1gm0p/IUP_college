"use client";

import { ScheduleProvider } from "@/context/schedule-context";

export function Providers({ children }: { children: React.ReactNode }) {
  return <ScheduleProvider>{children}</ScheduleProvider>;
}
