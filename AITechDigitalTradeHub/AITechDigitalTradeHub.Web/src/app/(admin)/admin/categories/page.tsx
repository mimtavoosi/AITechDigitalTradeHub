import type { Metadata } from "next";
import { AdminCategoriesClient } from "@/features/categories/components/admin-categories-client";

export const metadata: Metadata = {
  title: "مدیریت دسته‌بندی‌ها",
  description: "ساخت و مدیریت دسته‌بندی‌های پروژه، خدمات و محصولات."
};

export default function AdminCategoriesPage() {
  return <AdminCategoriesClient />;
}
