"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { CalendarClock } from "lucide-react";
import { TextField } from "@/components/ui/form-field";
import { PersianCalendar, formatJalaliDate, jalaliToGregorian, parsePersianDate, toPersianDigits } from "@/components/ui/persian-calendar";

type PersianDateTimeInputProps = {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  includeTime?: boolean;
  calendarMode?: "popover" | "inline";
  popoverAlign?: "start" | "end";
  disabled?: boolean;
  error?: string;
  hint?: string;
};

const persianPartsFormatter = new Intl.DateTimeFormat("fa-IR-u-ca-persian", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false
});

export function PersianDateTimeInput({ label, value, onChange, includeTime = false, calendarMode = "popover", popoverAlign = "end", disabled, error, hint }: PersianDateTimeInputProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const timeValue = useMemo(() => {
    const parts = value.trim().split(" ");
    return parts[1] ?? "";
  }, [value]);

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  function updateDate(dateValue: string) {
    onChange(includeTime && timeValue ? `${dateValue} ${timeValue}` : dateValue);
    setOpen(false);
  }

  function updateTime(time: string) {
    const datePart = value.trim().split(" ")[0] || formatJalaliDate(gregorianToPersianToday());
    onChange(time ? `${datePart} ${toPersianDigits(time)}` : datePart);
  }

  return (
    <div ref={rootRef} className="relative grid min-w-0 gap-1.5">
      <TextField
        label={label}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled}
        error={error}
        hint={hint ?? (includeTime ? "فرمت: ۱۴۰۳/۰۱/۰۱ ۱۴:۳۰" : "فرمت: ۱۴۰۳/۰۱/۰۱")}
        icon={<CalendarClock className="size-4" />}
        placeholder={includeTime ? "۱۴۰۳/۰۱/۰۱ ۱۴:۳۰" : "۱۴۰۳/۰۱/۰۱"}
        inputMode="numeric"
        onFocus={() => setOpen(true)}
      />
      {open ? (
        <div
          className={
            calendarMode === "inline"
              ? "relative z-10 mt-1 w-full min-w-0"
              : `absolute top-full z-50 mt-1.5 w-full min-w-0 ${popoverAlign === "end" ? "right-0" : "left-0"}`
          }
        >
          <PersianCalendar value={value} onChange={updateDate} className="w-full" />
        </div>
      ) : null}
      <div className="flex flex-wrap gap-1.5">
        <button type="button" disabled={disabled} onClick={() => onChange(formatPersianDate(new Date(), includeTime))} className="h-7 rounded-md border border-border bg-white px-2 text-[11px] font-bold text-muted disabled:opacity-60">
          {includeTime ? "اکنون" : "امروز"}
        </button>
        <button type="button" disabled={disabled} onClick={() => setOpen((current) => !current)} className="h-7 rounded-md border border-border bg-white px-2 text-[11px] font-bold text-muted disabled:opacity-60">
          تقویم
        </button>
        {value ? (
          <button type="button" disabled={disabled} onClick={() => onChange("")} className="h-7 rounded-md border border-border bg-white px-2 text-[11px] font-bold text-muted disabled:opacity-60">
            پاک کردن
          </button>
        ) : null}
      </div>
      {includeTime ? (
        <input
          type="time"
          value={toEnglishTime(timeValue)}
          onChange={(event) => updateTime(event.target.value)}
          className="h-10 w-36 rounded-md border border-border bg-white px-3 text-sm outline-none focus:border-accent"
          disabled={disabled}
        />
      ) : null}
    </div>
  );
}

export function formatPersianDate(date: Date, includeTime = false) {
  const parts = persianPartsFormatter.formatToParts(date);
  const read = (type: Intl.DateTimeFormatPartTypes) => parts.find((item) => item.type === type)?.value ?? "";
  const day = read("day");
  const month = read("month");
  const year = read("year");
  if (!includeTime) return `${year}/${month}/${day}`;
  return `${year}/${month}/${day} ${read("hour")}:${read("minute")}`;
}

export function persianDateTimeToLocalIso(value: string) {
  const date = parsePersianDate(value);
  if (!date) return "";

  const [, timePart = "00:00"] = value.trim().split(/\s+/);
  const [hourValue = "0", minuteValue = "0"] = toEnglishTime(timePart).split(":");
  const gregorian = jalaliToGregorian(date.year, date.month, date.day);
  gregorian.setHours(Number(hourValue) || 0, Number(minuteValue) || 0, 0, 0);

  const year = gregorian.getFullYear();
  const month = String(gregorian.getMonth() + 1).padStart(2, "0");
  const day = String(gregorian.getDate()).padStart(2, "0");
  const hour = String(gregorian.getHours()).padStart(2, "0");
  const minute = String(gregorian.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day}T${hour}:${minute}:00`;
}

function gregorianToPersianToday() {
  return parsePersianDate(formatPersianDate(new Date(), false)) ?? { year: 1400, month: 1, day: 1 };
}

function toEnglishTime(value: string) {
  return value.replace(/[۰-۹]/g, (digit) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(digit))).replace(/[٠-٩]/g, (digit) => String("٠١٢٣٤٥٦٧٨٩".indexOf(digit)));
}
