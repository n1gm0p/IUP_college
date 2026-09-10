import type { ScheduleMap } from "@/lib/types";
import { createMockSchedule } from "@/data/mock";

const DB_NAME = "iup-college";
const DB_VERSION = 1;
const STORE = "kv";
const SCHEDULE_ID = "schedule";

/** Legacy localStorage keys — migrate once, never wipe by bumping. */
const LEGACY_LS_KEYS = [
  "iup-college-schedule-v7",
  "iup-college-schedule-v6",
  "iup-college-schedule-v5",
  "iup-college-schedule-v4",
  "iup-college-schedule-v3",
  "iup-college-schedule-v2",
  "iup-college-schedule-v1",
  "iup-college-schedule",
];

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE);
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error ?? new Error("indexedDB open failed"));
  });
}

function idbGet(db: IDBDatabase, key: string): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readonly");
    const req = tx.objectStore(STORE).get(key);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error ?? new Error("indexedDB get failed"));
  });
}

function idbSet(db: IDBDatabase, key: string, value: unknown): Promise<void> {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).put(value, key);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error ?? new Error("indexedDB put failed"));
  });
}

function scoreSchedule(map: ScheduleMap): number {
  let score = 0;
  for (const day of Object.values(map)) {
    for (const p of day.pairs ?? []) {
      if (p.teacherSubject) score += 3;
      if (p.driveLink?.trim()) score += 3;
      if (p.notes?.trim()) score += 1 + Math.min(p.notes.length, 5000) / 500;
    }
  }
  return score;
}

export function normalizeSchedule(raw: ScheduleMap): ScheduleMap {
  const next: ScheduleMap = {};
  for (const [date, day] of Object.entries(raw)) {
    if (!day?.pairs || !Array.isArray(day.pairs)) continue;
    next[date] = {
      date: day.date || date,
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

function parseLegacy(raw: string | null): ScheduleMap | null {
  if (!raw) return null;
  try {
    return normalizeSchedule(JSON.parse(raw) as ScheduleMap);
  } catch {
    return null;
  }
}

/** Pick the richest schedule among IndexedDB + all legacy localStorage keys. */
function collectLegacyCandidates(): ScheduleMap[] {
  if (typeof window === "undefined") return [];
  const out: ScheduleMap[] = [];
  for (const key of LEGACY_LS_KEYS) {
    try {
      const parsed = parseLegacy(localStorage.getItem(key));
      if (parsed && Object.keys(parsed).length > 0) out.push(parsed);
    } catch {
      /* ignore */
    }
  }
  return out;
}

function pickRichest(candidates: ScheduleMap[]): ScheduleMap {
  if (candidates.length === 0) return createMockSchedule();
  let best = candidates[0];
  let bestScore = scoreSchedule(best);
  for (let i = 1; i < candidates.length; i++) {
    const s = scoreSchedule(candidates[i]);
    if (s > bestScore) {
      best = candidates[i];
      bestScore = s;
    }
  }
  return best;
}

export async function loadSchedule(): Promise<ScheduleMap> {
  if (typeof window === "undefined") return createMockSchedule();

  const legacy = collectLegacyCandidates();
  let fromIdb: ScheduleMap | null = null;

  try {
    const db = await openDb();
    const raw = await idbGet(db, SCHEDULE_ID);
    db.close();
    if (raw && typeof raw === "object") {
      fromIdb = normalizeSchedule(raw as ScheduleMap);
    }
  } catch {
    /* fall through to legacy */
  }

  const candidates = [
    ...(fromIdb && Object.keys(fromIdb).length > 0 ? [fromIdb] : []),
    ...legacy,
  ];
  const chosen = pickRichest(candidates);

  // Persist into IndexedDB so future loads are stable
  if (Object.keys(chosen).length > 0) {
    try {
      await saveSchedule(chosen);
    } catch {
      /* ignore */
    }
  }

  return chosen;
}

export async function saveSchedule(schedule: ScheduleMap): Promise<void> {
  if (typeof window === "undefined") return;
  const normalized = normalizeSchedule(schedule);

  try {
    const db = await openDb();
    await idbSet(db, SCHEDULE_ID, normalized);
    db.close();
  } catch (err) {
    console.error("Failed to save schedule to IndexedDB", err);
    // Fallback: localStorage (may fail on huge answers)
    try {
      localStorage.setItem(LEGACY_LS_KEYS[0], JSON.stringify(normalized));
    } catch (lsErr) {
      console.error("Failed to save schedule to localStorage", lsErr);
      throw lsErr;
    }
  }
}
