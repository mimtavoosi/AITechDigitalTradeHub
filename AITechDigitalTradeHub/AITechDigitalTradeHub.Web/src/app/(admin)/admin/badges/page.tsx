import type { Metadata } from "next";
import { AdminBadgesClient } from "@/features/badges/components/admin-badges-client";

export const metadata: Metadata = {
  title: "نشان‌ها و رتبه‌بندی",
  description: "ساخت نشان‌های حرفه‌ای و اختصاص یا لغو آن‌ها برای کاربران و شرکت‌ها."
};

export default function AdminBadgesPage() {
  return <AdminBadgesClient />;
}
