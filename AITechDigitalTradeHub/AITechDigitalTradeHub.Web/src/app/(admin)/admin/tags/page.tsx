import type { Metadata } from "next";
import { AdminTagsClient } from "@/features/tags/components/admin-tags-client";

export const metadata: Metadata = {
  title: "مدیریت مهارت‌های پروژه",
  description: "ساخت و مدیریت مهارت‌های مورد نیاز پروژه‌ها."
};

export default function AdminTagsPage() {
  return <AdminTagsClient />;
}
