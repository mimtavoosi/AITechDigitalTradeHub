"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { BriefcaseBusiness } from "lucide-react";
import { DataGrid, type DataGridColumn } from "@/components/ui/data-grid";
import { getOrganizationProjects } from "@/features/projects/api/projects-api";
import type { ProjectSummary } from "@/features/projects/types";
import { queryKeys } from "@/lib/query-keys";
import { getMyOrganizations } from "@/features/organizations/api/organizations-api";

export function CompanyProjectsClient() {
  const organizationsQuery = useQuery({ queryKey: queryKeys.company.organizations(), queryFn: getMyOrganizations });
  const organization = organizationsQuery.data?.results?.[0];
  const numericOrganizationId = organization?.id ?? 0;

  const projectsQuery = useQuery({
    queryKey: queryKeys.company.projects(numericOrganizationId),
    queryFn: () => getOrganizationProjects(numericOrganizationId),
    enabled: numericOrganizationId > 0
  });

  const projects = projectsQuery.data?.results ?? [];

  const columns = useMemo<Array<DataGridColumn<ProjectSummary>>>(
    () => [
      {
        key: "title",
        title: "پروژه",
        priority: "primary",
        sortable: true,
        searchValue: (item) => `${item.title} ${item.description ?? ""}`,
        sortValue: (item) => item.title,
        exportValue: (item) => item.title,
        render: (item) => (
          <div>
            <div className="flex items-center gap-2 font-black">
              <BriefcaseBusiness className="size-4 text-primary" />
              {item.title}
            </div>
            <div className="mt-1 line-clamp-1 text-xs text-muted">{item.description ?? "بدون توضیح"}</div>
          </div>
        )
      },
      {
        key: "employer",
        title: "کارفرما",
        priority: "meta",
        exportValue: (item) => item.employerName || `کاربر ${item.employerUserId}`,
        render: (item) => <span className="text-xs text-muted">{item.employerName || `کاربر ${item.employerUserId}`}</span>
      },
      {
        key: "budget",
        title: "بودجه",
        sortable: true,
        sortValue: (item) => item.budgetMax ?? item.budgetMin ?? 0,
        exportValue: (item) => formatBudget(item),
        render: (item) => <span className="text-xs text-muted">{formatBudget(item)}</span>
      },
      {
        key: "proposals",
        title: "پیشنهاد",
        sortable: true,
        sortValue: (item) => item.proposalsCount ?? 0,
        exportValue: (item) => item.proposalsCount ?? 0,
        render: (item) => <span className="text-xs text-muted">{(item.proposalsCount ?? 0).toLocaleString("fa-IR")}</span>
      },
      {
        key: "status",
        title: "وضعیت",
        sortable: true,
        sortValue: (item) => String(item.status),
        exportValue: (item) => String(item.status),
        render: (item) => <span className="rounded-md bg-white px-2 py-1 text-xs font-bold text-muted">{String(item.status)}</span>
      }
    ],
    []
  );

  return (
    <div className="space-y-5">
      <section className="rounded-lg border border-border bg-white p-4 text-sm">
        {organization ? <><span className="font-bold">{organization.title}</span><span className="mr-2 text-muted">پروژه‌های ثبت‌شده برای این سازمان نمایش داده می‌شوند.</span></> : <span className="text-muted">ابتدا سازمان خود را در تنظیمات ثبت کنید.</span>}
      </section>

      <DataGrid
        title="پروژه‌های سازمان"
        items={projects}
        columns={columns}
        getRowId={(item) => item.id}
        loading={projectsQuery.isLoading}
        exportFileName="company-projects"
        printTitle="گزارش پروژه‌های سازمان"
        searchPlaceholder="جستجو در پروژه‌های سازمان"
        emptyText={numericOrganizationId > 0 ? "پروژه‌ای برای این سازمان یافت نشد." : "شناسه سازمان را وارد کنید."}
      />
    </div>
  );
}

function formatBudget(project: Pick<ProjectSummary, "budgetMin" | "budgetMax" | "currency">) {
  const currency = project.currency ?? "IRR";
  if (project.budgetMin && project.budgetMax) {
    return `${project.budgetMin.toLocaleString("fa-IR")} تا ${project.budgetMax.toLocaleString("fa-IR")} ${currency}`;
  }
  if (project.budgetMin) {
    return `از ${project.budgetMin.toLocaleString("fa-IR")} ${currency}`;
  }
  if (project.budgetMax) {
    return `تا ${project.budgetMax.toLocaleString("fa-IR")} ${currency}`;
  }
  return "توافقی";
}
