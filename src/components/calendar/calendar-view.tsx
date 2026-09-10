"use client";

import { useState } from "react";
import { DriveViewer } from "@/components/drive-viewer";
import { MONTH_LABELS, WEEKDAY_LABELS } from "@/lib/constants";
import {
  addDays,
  addMonths,
  formatRangeLabel,
  getMonthGrid,
  getWeekDays,
  isSameDay,
  toDateKey,
} from "@/lib/date-utils";
import type { CalendarMode, DayPairPreview } from "@/lib/types";

interface CalendarViewProps {
  mode: CalendarMode;
  anchor: Date;
  today: Date;
  selectedKey: string | null;
  onModeChange: (mode: CalendarMode) => void;
  onAnchorChange: (date: Date) => void;
  onSelectDay: (dateKey: string) => void;
  hasContent: (dateKey: string) => boolean;
  getDayPreview: (dateKey: string) => DayPairPreview[];
}

export function CalendarView({
  mode,
  anchor,
  today,
  selectedKey,
  onModeChange,
  onAnchorChange,
  onSelectDay,
  hasContent,
  getDayPreview,
}: CalendarViewProps) {
  const [viewer, setViewer] = useState<{ url: string; title: string } | null>(
    null
  );
  const weekDays = getWeekDays(anchor);
  const monthCells = getMonthGrid(anchor);

  const yesterday = addDays(today, -1);
  const tomorrow = addDays(today, 1);

  const title =
    mode === "week"
      ? formatRangeLabel(weekDays[0], weekDays[6])
      : `${MONTH_LABELS[anchor.getMonth()]} ${anchor.getFullYear()}`;

  const focusKey = selectedKey ?? toDateKey(anchor);

  const jumpToDay = (date: Date) => {
    onModeChange("week");
    onAnchorChange(date);
    onSelectDay(toDateKey(date));
  };

  return (
    <div className="space-y-5 lg:space-y-6">
      <header>
        <h1 className="text-[34px] font-bold tracking-tight text-gray-900 lg:text-[40px]">
          Расписание
        </h1>
      </header>

      {/* Вчера / Сегодня / Завтра */}
      <div className="flex w-full rounded-xl bg-gray-200/80 p-1">
        {(
          [
            { label: "Вчера", date: yesterday },
            { label: "Сегодня", date: today },
            { label: "Завтра", date: tomorrow },
          ] as const
        ).map((tab) => {
          const key = toDateKey(tab.date);
          const active = focusKey === key;
          return (
            <button
              key={tab.label}
              type="button"
              onClick={() => jumpToDay(tab.date)}
              className={`min-h-[40px] flex-1 rounded-md px-2 text-sm font-medium transition-colors lg:min-h-[44px] lg:text-[15px] ${
                active
                  ? "bg-white text-gray-900 shadow-sm"
                  : "bg-transparent text-gray-600"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="flex items-center justify-between gap-3">
        <div className="inline-flex rounded-xl bg-gray-200/80 p-0.5">
          <Segment
            active={mode === "week"}
            onClick={() => onModeChange("week")}
            label="Неделя"
          />
          <Segment
            active={mode === "month"}
            onClick={() => onModeChange("month")}
            label="Месяц"
          />
        </div>
      </div>

      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() =>
            onAnchorChange(mode === "week" ? addDays(anchor, -7) : addMonths(anchor, -1))
          }
          className="flex h-11 w-11 items-center justify-center rounded-full text-[22px] text-[#007AFF] active:bg-gray-200"
          aria-label="Назад"
        >
          ‹
        </button>
        <p className="text-[17px] font-semibold text-gray-900 lg:text-[19px]">{title}</p>
        <button
          type="button"
          onClick={() =>
            onAnchorChange(mode === "week" ? addDays(anchor, 7) : addMonths(anchor, 1))
          }
          className="flex h-11 w-11 items-center justify-center rounded-full text-[22px] text-[#007AFF] active:bg-gray-200"
          aria-label="Вперёд"
        >
          ›
        </button>
      </div>

      {mode === "week" ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-7 lg:gap-4">
          {weekDays.map((day) => {
            const key = toDateKey(day);
            const isToday = isSameDay(day, today);
            const preview = getDayPreview(key);

            return (
              <div
                key={key}
                className={`flex min-h-[180px] flex-col rounded-2xl bg-white p-4 lg:min-h-[220px] lg:p-5 ${
                  selectedKey === key ? "ring-2 ring-[#007AFF]/30" : ""
                }`}
              >
                <button
                  type="button"
                  onClick={() => onSelectDay(key)}
                  className="flex w-full items-center justify-between text-left active:opacity-80"
                >
                  <span className="text-[13px] font-medium text-gray-500 lg:text-[14px]">
                    {WEEKDAY_LABELS[(day.getDay() + 6) % 7]}
                  </span>
                  <span
                    className={`flex h-8 w-8 items-center justify-center rounded-full text-[15px] font-semibold lg:h-9 lg:w-9 lg:text-[16px] ${
                      isToday ? "bg-[#007AFF] text-white" : "text-gray-900"
                    }`}
                  >
                    {day.getDate()}
                  </span>
                </button>

                <div className="mt-3 flex flex-1 flex-col gap-3 lg:mt-4 lg:gap-3.5">
                  {preview.length === 0 ? (
                    <button
                      type="button"
                      onClick={() => onSelectDay(key)}
                      className="text-left text-[13px] text-gray-400 active:opacity-80 lg:text-[14px]"
                    >
                      Нет пар
                    </button>
                  ) : (
                    preview.map((item) => (
                      <div key={item.pairNumber} className="space-y-1">
                        <button
                          type="button"
                          onClick={() => onSelectDay(key)}
                          className="w-full text-left text-[13px] leading-snug text-gray-700 active:opacity-80 lg:text-[15px] lg:leading-snug"
                        >
                          <span className="tabular-nums text-gray-400">
                            {item.time}
                          </span>{" "}
                          <span className="break-words">{item.subject}</span>
                        </button>
                        {item.driveLink.trim() ? (
                          <button
                            type="button"
                            onClick={() =>
                              setViewer({
                                url: item.driveLink,
                                title: item.subject,
                              })
                            }
                            className="inline-flex min-h-[40px] items-center gap-1.5 py-1 text-[14px] font-medium text-[#007AFF] active:opacity-60 lg:text-[15px]"
                          >
                            <LinkIcon />
                            Открыть материал
                          </button>
                        ) : null}
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl bg-white">
          <div className="grid grid-cols-7 border-b border-gray-100 px-1 pt-2 lg:px-3 lg:pt-3">
            {WEEKDAY_LABELS.map((label) => (
              <div
                key={label}
                className="py-2 text-center text-[12px] font-semibold text-gray-400 lg:text-[13px]"
              >
                {label}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-y-1 p-2 pb-3 lg:gap-y-2 lg:p-3 lg:pb-4">
            {monthCells.map((day) => {
              const key = toDateKey(day);
              const inMonth = day.getMonth() === anchor.getMonth();
              const isToday = isSameDay(day, today);
              const filled = hasContent(key);
              const hasMaterial = getDayPreview(key).some((p) => p.driveLink.trim());

              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => onSelectDay(key)}
                  className="relative flex aspect-square min-h-[48px] flex-col items-center justify-center rounded-xl active:bg-gray-50 lg:min-h-[64px]"
                >
                  <span
                    className={`flex h-9 w-9 items-center justify-center rounded-full text-[15px] lg:h-11 lg:w-11 lg:text-[17px] ${
                      isToday
                        ? "bg-[#007AFF] font-semibold text-white"
                        : inMonth
                          ? "font-medium text-gray-900"
                          : "text-gray-300"
                    }`}
                  >
                    {day.getDate()}
                  </span>
                  {(filled || hasMaterial) && (
                    <span
                      className={`absolute bottom-1 h-1 w-1 rounded-full lg:bottom-1.5 lg:h-1.5 lg:w-1.5 ${
                        hasMaterial ? "bg-[#007AFF]" : "bg-gray-400"
                      }`}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {viewer && (
        <DriveViewer
          url={viewer.url}
          title={viewer.title}
          onClose={() => setViewer(null)}
        />
      )}
    </div>
  );
}

function Segment({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`min-h-[36px] rounded-[10px] px-4 py-1.5 text-sm font-medium transition-colors lg:min-h-[40px] lg:px-5 lg:text-[15px] ${
        active ? "bg-white text-gray-900 shadow-sm" : "text-gray-600"
      }`}
    >
      {label}
    </button>
  );
}

function LinkIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      className="shrink-0"
    >
      <path
        d="M10 13a5 5 0 007.54.54l1.92-1.92a5 5 0 00-7.07-7.07L10.8 6.1"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M14 11a5 5 0 00-7.54-.54L4.54 12.4a5 5 0 007.07 7.07l1.59-1.55"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
