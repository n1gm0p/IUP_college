/** Firestore-ready types. Document IDs use ISO date keys: YYYY-MM-DD */

export type PairNumber = 1 | 2 | 3 | 4;

export interface PairSlot {
  pairNumber: PairNumber;
  /** Flat value: "Teacher — Subject" or empty */
  teacherSubject: string;
  /** Free-form answer / notes (paste-friendly) */
  notes: string;
  /** Google Drive (or any) material URL */
  driveLink: string;
}

export interface DaySchedule {
  /** ISO date: YYYY-MM-DD — use as Firestore doc id */
  date: string;
  pairs: PairSlot[];
}

/** Map keyed by date string — mirrors a Firestore collection */
export type ScheduleMap = Record<string, DaySchedule>;

export type CalendarMode = "week" | "month";

export interface DayPairPreview {
  pairNumber: PairNumber;
  time: string;
  subject: string;
  driveLink: string;
}
