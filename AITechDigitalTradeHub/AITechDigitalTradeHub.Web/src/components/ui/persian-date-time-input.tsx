"use client";

import { useMemo, useState } from "react";
import { CalendarClock } from "lucide-react";
import { TextField } from "@/components/ui/form-field";
import { PersianCalendar, formatJalaliDate, parsePersianDate, toPersianDigits } from "@/components/ui/persian-calendar";

type PersianDateTimeInputProps = {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  includeTime?: boolean;
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

export function PersianDateTimeInput({ label, value, onChange, includeTime = false, disabled, error, hint }: PersianDateTimeInputProps) {
  const [open, setOpen] = useState(false);
  const timeValue = useMemo(() => {
    const parts = value.trim().split(" ");
    return parts[1] ?? "";
  }, [value]);

  function updateDate(dateValue: string) {
    onChange(includeTime && timeValue ? `${dateValue} ${timeValue}` : dateValue);
    setOpen(false);
  }

  function updateTime(time: string) {
    const datePart = value.trim().split(" ")[0] || formatJalaliDate(gregorianToPersianToday());
    onChange(time ? `${datePart} ${toPersianDigits(time)}` : datePart);
  }

  return (
    <div className="relative grid gap-2">
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
        <div className="absolute right-0 top-full z-40 mt-1">
          <PersianCalendar value={value} onChange={updateDate} />
        </div>
      ) : null}
      <div className="flex flex-wrap gap-2">
        <button type="button" disabled={disabled} onClick={() => onChange(formatPersianDate(new Date(), includeTime))} className="h-8 rounded-md border border-border bg-white px-2 text-xs font-bold text-muted disabled:opacity-60">
          {includeTime ? "اکنون" : "امروز"}
        </button>
        <button type="button" disabled={disabled} onClick={() => setOpen((current) => !current)} className="h-8 rounded-md border border-border bg-white px-2 text-xs font-bold text-muted disabled:opacity-60">
          تقویم
        </button>
        {value ? (
          <button type="button" disabled={disabled} onClick={() => onChange("")} className="h-8 rounded-md border border-border bg-white px-2 text-xs font-bold text-muted disabled:opacity-60">
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

function gregorianToPersianToday() {
  return parsePersianDate(formatPersianDate(new Date(), false)) ?? { year: 1400, month: 1, day: 1 };
}

function toEnglishTime(value: string) {
  return value.replace(/[۰-۹]/g, (digit) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(digit))).replace(/[٠-٩]/g, (digit) => String("٠١٢٣٤٥٦٧٨٩".indexOf(digit)));
}
