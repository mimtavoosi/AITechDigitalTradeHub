import Link from "next/link";
import { ArrowLeft, BadgeCheck, Clock3, LockKeyhole, Search } from "lucide-react";

type SmartSearchPanelProps = {
  suggestions: string[];
  className?: string;
};

export function SmartSearchPanel({ suggestions, className = "" }: SmartSearchPanelProps) {
  return (
    <div className={`glass-strong rounded-2xl p-2 shadow-[0_22px_70px_rgba(15,23,42,0.12)] sm:p-3 ${className}`}>
      <form action="/services" className="grid gap-3 rounded-xl border border-white/80 bg-white/88 p-2 sm:grid-cols-[1fr_auto] sm:items-center">
        <label className="flex min-h-14 min-w-0 items-center gap-3 rounded-lg px-2 sm:min-h-16">
          <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-accent/10 text-accent sm:size-11">
            <Search className="size-5" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-xs font-extrabold text-muted">جستجوی هوشمند خدمات و پروژه‌ها</span>
            <input
              name="q"
              className="mt-1 h-8 w-full min-w-0 bg-transparent text-sm font-black text-foreground placeholder:text-slate-400 focus:outline-none md:text-base"
              placeholder="مثلا: مدل تشخیص تصویر برای کارخانه"
            />
          </span>
        </label>
        <button type="submit" className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-foreground px-5 text-sm font-black text-white shadow-lg shadow-slate-900/15 transition hover:-translate-y-0.5 sm:h-14">
          پیدا کن
          <ArrowLeft className="size-4" />
        </button>
      </form>
      <div className="mt-3 grid gap-2 px-1 sm:flex sm:flex-wrap">
        {suggestions.map((item) => (
          <Link key={item} href="/services" className="rounded-full border border-white/80 bg-white/72 px-3 py-2 text-center text-xs font-extrabold text-muted transition hover:border-accent/40 hover:bg-white hover:text-accent">
            {item}
          </Link>
        ))}
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-3 border-t border-white/70 px-2 pt-3 text-xs font-bold text-muted">
        <span className="inline-flex items-center gap-1 text-accent">
          <LockKeyhole className="size-3.5" />
          پرداخت امن مرحله‌ای
        </span>
        <span className="inline-flex items-center gap-1">
          <BadgeCheck className="size-3.5" />
          متخصصان تاییدشده
        </span>
        <span className="inline-flex items-center gap-1">
          <Clock3 className="size-3.5" />
          پاسخ سریع پیشنهادها
        </span>
      </div>
    </div>
  );
}
