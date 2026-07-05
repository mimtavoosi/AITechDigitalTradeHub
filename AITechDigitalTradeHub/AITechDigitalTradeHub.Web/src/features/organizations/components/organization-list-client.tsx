"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Building2, GraduationCap, Landmark, Search } from "lucide-react";
import { getOrganizations } from "@/features/organizations/api/organizations-api";
import type { Organization, OrganizationType } from "@/features/organizations/types";

export function OrganizationListClient() {
  const [searchText, setSearchText] = useState("");
  const [type, setType] = useState<OrganizationType | "">("");
  const query = useQuery({ queryKey: ["organizations", "public", type, searchText], queryFn: () => getOrganizations({ type: type || undefined, searchText }) });
  const items = query.data?.results ?? [];

  return (
    <div className="space-y-5">
      <div className="grid gap-3 rounded-lg border border-border bg-white p-4 md:grid-cols-[minmax(0,1fr)_240px]">
        <label className="flex h-11 items-center gap-2 rounded-md border border-border px-3">
          <Search className="size-4 text-muted" />
          <input value={searchText} onChange={(event) => setSearchText(event.target.value)} className="min-w-0 flex-1 outline-none" placeholder="جستجوی سازمان، دانشگاه یا پژوهشگاه" />
        </label>
        <select value={String(type)} onChange={(event) => setType(event.target.value ? Number(event.target.value) : "")} className="h-11 rounded-md border border-border bg-white px-3">
          <option value="">همه انواع سازمان</option>
          {organizationTypeOptions.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
        </select>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {items.map((item) => <OrganizationCard key={item.id} organization={item} />)}
      </div>
      {!query.isLoading && !items.length ? <div className="rounded-lg border border-dashed border-border p-10 text-center text-sm text-muted">سازمان تاییدشده‌ای پیدا نشد.</div> : null}
    </div>
  );
}

function OrganizationCard({ organization }: { organization: Organization }) {
  const Icon = Number(organization.type) === 2 ? GraduationCap : Number(organization.type) === 5 ? Landmark : Building2;
  return (
    <article className="rounded-lg border border-border bg-white p-5 shadow-sm">
      <div className="flex items-start gap-3">
        <span className="grid size-12 shrink-0 place-items-center rounded-md bg-primary/10 text-primary"><Icon className="size-6" /></span>
        <div className="min-w-0">
          <h2 className="truncate font-black">{organization.title}</h2>
          <div className="mt-1 text-xs font-bold text-primary">{getOrganizationTypeLabel(organization.type)}</div>
        </div>
      </div>
      <p className="mt-4 line-clamp-3 text-sm leading-7 text-muted">{organization.description || "پروفایل این سازمان هنوز تکمیل نشده است."}</p>
      <div className="mt-4 flex gap-2 text-xs text-muted"><span>{organization.membersCount.toLocaleString("fa-IR")} عضو</span><span>•</span><span>{organization.projectsCount.toLocaleString("fa-IR")} پروژه</span></div>
      {organization.websiteUrl ? <a href={organization.websiteUrl} target="_blank" rel="noreferrer" className="mt-4 inline-block text-sm font-bold text-primary">وب‌سایت سازمان</a> : null}
    </article>
  );
}

export const organizationTypeOptions = [
  { value: 1, label: "شرکت" }, { value: 2, label: "دانشگاه" }, { value: 3, label: "پژوهشگاه" },
  { value: 4, label: "استارتاپ" }, { value: 5, label: "نهاد دولتی" }, { value: 6, label: "غیرانتفاعی" },
  { value: 7, label: "شتاب‌دهنده" }, { value: 8, label: "سایر" }
];

export function getOrganizationTypeLabel(type: OrganizationType) {
  return organizationTypeOptions.find((item) => item.value === Number(type))?.label ?? String(type);
}
