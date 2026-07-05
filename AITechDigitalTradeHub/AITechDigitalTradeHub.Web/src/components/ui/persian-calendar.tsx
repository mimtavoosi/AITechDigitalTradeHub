"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";

type PersianCalendarProps = {
  value?: string;
  onChange: (value: string) => void;
  className?: string;
};

const monthNames = ["فروردین", "اردیبهشت", "خرداد", "تیر", "مرداد", "شهریور", "مهر", "آبان", "آذر", "دی", "بهمن", "اسفند"];
const weekDays = ["ش", "ی", "د", "س", "چ", "پ", "ج"];

export function PersianCalendar({ value, onChange, className }: PersianCalendarProps) {
  const today = gregorianToJalali(new Date());
  const selected = parsePersianDate(value) ?? today;
  const [view, setView] = useState({ year: selected.year, month: selected.month });
  const days = useMemo(() => buildMonthDays(view.year, view.month), [view.year, view.month]);

  function moveMonth(offset: number) {
    setView((current) => {
      const month = current.month + offset;
      if (month < 1) return { year: current.year - 1, month: 12 };
      if (month > 12) return { year: current.year + 1, month: 1 };
      return { year: current.year, month };
    });
  }

  return (
    <div className={cn("w-full max-w-xs rounded-md border border-border bg-white p-2.5 shadow-lg", className)}>
      <div className="flex items-center justify-between">
        <button type="button" className="grid size-7 place-items-center rounded-md border border-border text-muted" onClick={() => moveMonth(1)}>
          <ChevronRight className="size-3.5" />
        </button>
        <div className="text-xs font-black">{monthNames[view.month - 1]} {toPersianDigits(String(view.year))}</div>
        <button type="button" className="grid size-7 place-items-center rounded-md border border-border text-muted" onClick={() => moveMonth(-1)}>
          <ChevronLeft className="size-3.5" />
        </button>
      </div>

      <div className="mt-2.5 grid grid-cols-7 gap-1 text-center text-[11px] font-bold text-muted">
        {weekDays.map((day) => <div key={day}>{day}</div>)}
      </div>
      <div className="mt-1 grid grid-cols-7 gap-1">
        {days.map((day, index) =>
          day ? (
            <button
              key={`${view.year}-${view.month}-${day}`}
              type="button"
              className={cn(
                "grid aspect-square min-h-7 w-full place-items-center rounded-md text-xs font-bold hover:bg-slate-50",
                isSameDate({ year: view.year, month: view.month, day }, selected) && "bg-primary text-white hover:bg-primary",
                isSameDate({ year: view.year, month: view.month, day }, today) && !isSameDate({ year: view.year, month: view.month, day }, selected) && "border border-primary/30 text-primary"
              )}
              onClick={() => onChange(formatJalaliDate({ year: view.year, month: view.month, day }))}
            >
              {toPersianDigits(String(day))}
            </button>
          ) : (
            <span key={`empty-${index}`} className="aspect-square min-h-7 w-full" />
          )
        )}
      </div>
      <div className="mt-2.5 flex gap-2 border-t border-border pt-2.5">
        <button type="button" className="h-7 flex-1 rounded-md bg-primary px-2 text-[11px] font-bold text-white" onClick={() => {
          const current = gregorianToJalali(new Date());
          setView({ year: current.year, month: current.month });
          onChange(formatJalaliDate(current));
        }}>
          امروز
        </button>
        <button type="button" className="h-7 rounded-md border border-border px-2 text-[11px] font-bold text-muted" onClick={() => onChange("")}>
          پاک کردن
        </button>
      </div>
    </div>
  );
}

function buildMonthDays(year: number, month: number) {
  const firstGregorian = jalaliToGregorian(year, month, 1);
  const firstWeekDay = (firstGregorian.getDay() + 1) % 7;
  const daysInMonth = getJalaliMonthLength(year, month);
  return [...Array.from({ length: firstWeekDay }, () => null), ...Array.from({ length: daysInMonth }, (_, index) => index + 1)];
}

function getJalaliMonthLength(year: number, month: number) {
  if (month <= 6) return 31;
  if (month <= 11) return 30;
  return isJalaliLeapYear(year) ? 30 : 29;
}

function isJalaliLeapYear(year: number) {
  return jalaliToGregorian(year + 1, 1, 1).getTime() - jalaliToGregorian(year, 1, 1).getTime() > 365 * 24 * 60 * 60 * 1000;
}

export function parsePersianDate(value?: string | null) {
  if (!value) return null;
  const normalized = toEnglishDigits(value).trim().split(" ")[0];
  const parts = normalized.split(/[/-]/).map(Number);
  if (parts.length !== 3 || parts.some(Number.isNaN)) return null;
  return { year: parts[0], month: parts[1], day: parts[2] };
}

export function formatJalaliDate(date: { year: number; month: number; day: number }) {
  return `${toPersianDigits(String(date.year))}/${toPersianDigits(String(date.month).padStart(2, "0"))}/${toPersianDigits(String(date.day).padStart(2, "0"))}`;
}

export function toPersianDigits(value: string) {
  return value.replace(/\d/g, (digit) => "۰۱۲۳۴۵۶۷۸۹"[Number(digit)]);
}

export function toEnglishDigits(value: string) {
  return value.replace(/[۰-۹]/g, (digit) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(digit))).replace(/[٠-٩]/g, (digit) => String("٠١٢٣٤٥٦٧٨٩".indexOf(digit)));
}

function isSameDate(first: { year: number; month: number; day: number }, second: { year: number; month: number; day: number }) {
  return first.year === second.year && first.month === second.month && first.day === second.day;
}

function div(a: number, b: number) {
  return ~~(a / b);
}

export function jalaliToGregorian(jy: number, jm: number, jd: number) {
  jy += 1595;
  let days = -355668 + 365 * jy + div(jy, 33) * 8 + div((jy % 33) + 3, 4) + jd;
  days += jm < 7 ? (jm - 1) * 31 : (jm - 7) * 30 + 186;
  let gy = 400 * div(days, 146097);
  days %= 146097;
  if (days > 36524) {
    gy += 100 * div(--days, 36524);
    days %= 36524;
    if (days >= 365) days++;
  }
  gy += 4 * div(days, 1461);
  days %= 1461;
  if (days > 365) {
    gy += div(days - 1, 365);
    days = (days - 1) % 365;
  }
  let gd = days + 1;
  const salA = [0, 31, isGregorianLeap(gy) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  let gm = 0;
  for (gm = 1; gm <= 12 && gd > salA[gm]; gm++) gd -= salA[gm];
  return new Date(gy, gm - 1, gd);
}

function gregorianToJalali(date: Date) {
  let gy = date.getFullYear();
  const gm = date.getMonth() + 1;
  const gd = date.getDate();
  const gdm = [0, 31, isGregorianLeap(gy) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  let jy = gy <= 1600 ? 0 : 979;
  gy -= gy <= 1600 ? 621 : 1600;
  const gy2 = gm > 2 ? gy + 1 : gy;
  let days = 365 * gy + div(gy2 + 3, 4) - div(gy2 + 99, 100) + div(gy2 + 399, 400) - 80 + gd;
  for (let i = 1; i < gm; ++i) days += gdm[i];
  jy += 33 * div(days, 12053);
  days %= 12053;
  jy += 4 * div(days, 1461);
  days %= 1461;
  if (days > 365) {
    jy += div(days - 1, 365);
    days = (days - 1) % 365;
  }
  const jm = days < 186 ? 1 + div(days, 31) : 7 + div(days - 186, 30);
  const jd = 1 + (days < 186 ? days % 31 : (days - 186) % 30);
  return { year: jy, month: jm, day: jd };
}

function isGregorianLeap(year: number) {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}
