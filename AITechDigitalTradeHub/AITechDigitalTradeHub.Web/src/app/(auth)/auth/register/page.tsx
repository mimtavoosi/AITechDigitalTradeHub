import type { Metadata } from "next";
import { AuthCard } from "@/features/auth/components/auth-card";

export const metadata: Metadata = {
  title: "ثبت‌نام"
};

export default function RegisterPage() {
  return <AuthCard mode="register" />;
}
