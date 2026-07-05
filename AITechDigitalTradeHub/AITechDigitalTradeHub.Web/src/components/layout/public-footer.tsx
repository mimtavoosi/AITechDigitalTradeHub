import Link from "next/link";
import Image from "next/image";

export function PublicFooter() {
  return (
    <footer className="border-t border-border bg-white py-8">
      <div className="container-page flex flex-col gap-5 text-sm text-muted md:flex-row md:items-center md:justify-between">
        <div>
          <Image
            src="/brand/ainet-lockup-cropped.png"
            alt="آی نت"
            width={170}
            height={54}
            className="h-9 w-32 object-contain"
          />
          <span className="mt-1 block text-xs">شبکه تخصصی هوش مصنوعی ایران</span>
        </div>
        <div className="flex flex-wrap gap-4 text-xs font-bold">
          <Link href="/about" className="hover:text-accent">درباره</Link>
          <Link href="/domains" className="hover:text-accent">حوزه‌ها</Link>
          <Link href="/services" className="hover:text-accent">خدمات و تجهیزات</Link>
          <Link href="/projects" className="hover:text-accent">پروژه‌ها</Link>
          <Link href="/courses" className="hover:text-accent">آموزش</Link>
        </div>
      </div>
    </footer>
  );
}
