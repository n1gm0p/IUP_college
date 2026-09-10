import { createEmptyPairs } from "@/lib/constants";
import type { ScheduleMap } from "@/lib/types";
import { toDateKey, addDays } from "@/lib/date-utils";

/**
 * Mock seed — mirrors a Firestore `schedules` collection.
 * Replace with getDocs later.
 */
export function createMockSchedule(): ScheduleMap {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const monday = (() => {
    const d = new Date(today);
    const day = d.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    d.setDate(d.getDate() + diff);
    return d;
  })();

  const mon = toDateKey(monday);
  const tue = toDateKey(addDays(monday, 1));
  const wed = toDateKey(addDays(monday, 2));

  return {
    [mon]: {
      date: mon,
      pairs: [
        {
          pairNumber: 1,
          teacherSubject:
            "Емельянов Сергей Алексеевич — Тестирование информационных систем",
          notes: "Лабораторная №3 — сдать до пятницы",
          driveLink: "https://docs.google.com/document/d/e/2PACX-1vExample/pub",
          status: "in_progress",
        },
        {
          pairNumber: 2,
          teacherSubject:
            "Оствальд Анна Николаевна — Разработка кода информационных систем",
          notes: "Контрольная по модулю 2",
          driveLink: "",
          status: "todo",
        },
        {
          pairNumber: 3,
          teacherSubject: "Палий Галина Евгеньевна — Экономика отрасли",
          notes: "",
          driveLink: "",
          status: "done",
        },
        {
          pairNumber: 4,
          teacherSubject: "",
          notes: "",
          driveLink: "",
          status: "todo",
        },
      ],
    },
    [tue]: {
      date: tue,
      pairs: [
        {
          pairNumber: 1,
          teacherSubject:
            "Семенова Наталья Андреевна — Администрирование информационных систем",
          notes: "Практика в аудитории 204",
          driveLink: "https://drive.google.com/file/d/example-admin/view",
          status: "todo",
        },
        {
          pairNumber: 2,
          teacherSubject:
            "Сабинин Павел Алексеевич — Сопровождение информационных систем",
          notes: "",
          driveLink: "",
          status: "in_progress",
        },
        {
          pairNumber: 3,
          teacherSubject:
            "Тетюева Александра Евгеньевна — Правовое обеспечение профессиональной деятельности",
          notes: "Прочитать гл. 4–5",
          driveLink: "",
          status: "todo",
        },
        {
          pairNumber: 4,
          teacherSubject:
            "Палий Галина Евгеньевна — Иностранный язык в профессиональной деятельности",
          notes: "",
          driveLink: "",
          status: "done",
        },
      ],
    },
    [wed]: {
      date: wed,
      pairs: createEmptyPairs().map((p, i) =>
        i === 0
          ? {
              ...p,
              teacherSubject:
                "Емельянов Сергей Алексеевич — Управление и автоматизация баз данных",
              notes: "SQL: join и подзапросы",
              driveLink: "",
              status: "todo" as const,
            }
          : p
      ),
    },
  };
}
