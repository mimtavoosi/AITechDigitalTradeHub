import Link from "next/link";

export function PublicFooter() {
  return (
    <footer className="border-t border-border bg-white py-8">
      <div className="container-page flex flex-col gap-5 text-sm text-muted md:flex-row md:items-center md:justify-between">
        <div>
          <span className="block font-black text-foreground">هاب تجارت دیجیتال هوش مصنوعی</span>
          <span className="mt-1 block text-xs">زیرساخت اجرای پروژه، خدمات، آموزش و سرمایه‌گذاری AI</span>
        </div>
        <div className="flex flex-wrap gap-4 text-xs font-bold">
          <Link href="/about" className="hover:text-accent">درباره</Link>
          <Link href="/services" className="hover:text-accent">خدمات</Link>
          <Link href="/projects" className="hover:text-accent">پروژه‌ها</Link>
          <Link href="/courses" className="hover:text-accent">آموزش</Link>
        </div>
      </div>
    </footer>
  );
}
