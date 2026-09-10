import type { PairNumber, PairSlot } from "./types";

export const subjectsData = [
  {
    teacher: "Оствальд Анна Николаевна",
    subjects: ["Разработка кода информационных систем"],
  },
  {
    teacher: "Палий Галина Евгеньевна",
    subjects: [
      "Экономика отрасли",
      "Иностранный язык в профессиональной деятельности",
      "Менеджмент в профессиональной деятельности",
    ],
  },
  {
    teacher: "Сабинин Павел Алексеевич",
    subjects: [
      "Сопровождение информационных систем",
      "Производственная практика",
    ],
  },
  {
    teacher: "Емельянов Сергей Алексеевич",
    subjects: [
      "Интеллектуальные системы и технологии",
      "Сертификация информационных систем",
      "Тестирование информационных систем",
      "Инженерно-техническая поддержка сопровождения информационных систем",
      "Учебная практика",
      "Управление и автоматизация баз данных",
    ],
  },
  {
    teacher: "Семенова Наталья Андреевна",
    subjects: [
      "Администрирование информационных систем",
      "Выполнение работ по верификации и тестированию программных продуктов",
      "Стандартизация, сертификация и техническое документоведение",
    ],
  },
  {
    teacher: "Тетюева Александра Евгеньевна",
    subjects: [
      "Правовое обеспечение профессиональной деятельности",
      "Социальная адаптация и основы социально-правовых знаний",
    ],
  },
] as const;

/** Flat one-click options: "Преподаватель — Предмет" */
export const teacherSubjectOptions: string[] = subjectsData.flatMap(
  ({ teacher, subjects }) => subjects.map((subject) => `${teacher} — ${subject}`)
);

export const PAIR_TIMES: Record<
  PairNumber,
  { start: string; end: string; label: string }
> = {
  1: { start: "09:00", end: "10:40", label: "1 пара" },
  2: { start: "11:00", end: "12:40", label: "2 пара" },
  3: { start: "13:00", end: "14:40", label: "3 пара" },
  4: { start: "15:00", end: "16:40", label: "4 пара" },
};

export const PAIR_NUMBERS: PairNumber[] = [1, 2, 3, 4];

export function createEmptyPairs(): PairSlot[] {
  return PAIR_NUMBERS.map((pairNumber) => ({
    pairNumber,
    teacherSubject: "",
    notes: "",
    driveLink: "",
    status: "todo",
  }));
}

export const WEEKDAY_LABELS = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"] as const;

export const MONTH_LABELS = [
  "Январь",
  "Февраль",
  "Март",
  "Апрель",
  "Май",
  "Июнь",
  "Июль",
  "Август",
  "Сентябрь",
  "Октябрь",
  "Ноябрь",
  "Декабрь",
] as const;

/** Classic iOS system blue */
export const IOS_BLUE = "#007AFF";

/** Ensure links open reliably even without protocol */
export function normalizeExternalUrl(url: string): string {
  const trimmed = url.trim();
  if (!trimmed) return "";
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}