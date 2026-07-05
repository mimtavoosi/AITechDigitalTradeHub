"use client";

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="fa" dir="rtl">
      <body>
        <main style={{ minHeight: "100vh", padding: 24, fontFamily: "sans-serif", background: "#f7f6fb", color: "#12181b" }}>
          <section style={{ maxWidth: 560, margin: "48px auto", background: "white", border: "1px solid #e2dfeb", borderRadius: 8, padding: 24 }}>
            <div style={{ color: "#c42f3f", fontWeight: 900, fontSize: 14 }}>خطای جدی در برنامه</div>
            <h1 style={{ marginTop: 12, fontSize: 24 }}>رابط کاربری کامل بارگذاری نشد</h1>
            <p style={{ lineHeight: 2, color: "#677479" }}>احتمالا یکی از فایل‌های JavaScript/CSS یا پاسخ سرور با خطا برگشته است.</p>
            <button type="button" onClick={reset} style={{ height: 40, padding: "0 16px", border: 0, borderRadius: 6, background: "#7e57f5", color: "white", fontWeight: 800 }}>تلاش دوباره</button>
          </section>
        </main>
      </body>
    </html>
  );
}
