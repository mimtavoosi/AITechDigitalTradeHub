"use client";

import dynamic from "next/dynamic";

const loading = () => <div className="grid min-h-64 place-items-center">در حال بارگذاری...</div>;

export const LazyDashboardProjectsClient = dynamic(
  () => import("@/features/projects/components/dashboard-projects-client").then((module) => module.DashboardProjectsClient),
  { ssr: false, loading }
);

export const LazyDashboardEducationClient = dynamic(
  () => import("@/features/education/components/dashboard-education-client").then((module) => module.DashboardEducationClient),
  { ssr: false, loading }
);

export const LazyAdminProjectsClient = dynamic(
  () => import("@/features/projects/components/admin-projects-client").then((module) => module.AdminProjectsClient),
  { ssr: false, loading }
);

export const LazyAdminUsersClient = dynamic(
  () => import("@/features/users/components/admin-users-client").then((module) => module.AdminUsersClient),
  { ssr: false, loading }
);

export const LazyAdminAccessClient = dynamic(
  () => import("@/features/admin/components/admin-access-client").then((module) => module.AdminAccessClient),
  { ssr: false, loading }
);

export const LazyAdminReportsClient = dynamic(
  () => import("@/features/admin/components/admin-reports-client").then((module) => module.AdminReportsClient),
  { ssr: false, loading }
);

export const LazyAdminInvestmentsClient = dynamic(
  () => import("@/features/investments/components/admin-investments-client").then((module) => module.AdminInvestmentsClient),
  { ssr: false, loading }
);
