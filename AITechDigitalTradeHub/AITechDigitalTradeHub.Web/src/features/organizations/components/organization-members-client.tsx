"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { addOrganizationMember, getMyOrganizations, getOrganizationMembers } from "@/features/organizations/api/organizations-api";
import { queryKeys } from "@/lib/query-keys";

export function OrganizationMembersClient() {
  const queryClient = useQueryClient();
  const organizationsQuery = useQuery({ queryKey: queryKeys.company.organizations(), queryFn: getMyOrganizations });
  const organization = organizationsQuery.data?.results?.[0];
  const membersQuery = useQuery({ queryKey: queryKeys.company.members(organization?.id ?? 0), queryFn: () => getOrganizationMembers(organization!.id), enabled: Boolean(organization?.id) });
  const mutation = useMutation({
    mutationFn: (payload: Parameters<typeof addOrganizationMember>[1]) => addOrganizationMember(organization!.id, payload),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: queryKeys.company.members(organization?.id ?? 0) })
  });

  if (!organizationsQuery.isLoading && !organization) return <div className="rounded-lg border border-dashed border-border p-10 text-center text-sm text-muted">ابتدا سازمان خود را در صفحه تنظیمات ثبت کنید.</div>;
  return (
    <div className="space-y-5">
      <form className="grid gap-3 rounded-lg border border-border bg-white p-4 md:grid-cols-[1fr_180px_auto]" onSubmit={(event) => {
        event.preventDefault(); const form = new FormData(event.currentTarget);
        mutation.mutate({ userId: Number(form.get("userId")), role: Number(form.get("role")), canRequestOrganizationPayments: true, canApproveOrganizationPayments: Number(form.get("role")) !== 3 });
      }}>
        <input name="userId" type="number" min="1" required placeholder="شناسه کاربر" className="h-10 rounded-md border border-border px-3" />
        <select name="role" className="h-10 rounded-md border border-border bg-white px-3"><option value="3">عضو</option><option value="2">مدیر</option><option value="1">مدیر سازمان</option></select>
        <button className="h-10 rounded-md bg-primary px-4 font-bold text-white" disabled={mutation.isPending}>افزودن عضو</button>
      </form>
      <div className="overflow-hidden rounded-lg border border-border bg-white">
        {(membersQuery.data?.results ?? []).map((member) => <div key={member.id} className="flex flex-wrap items-center justify-between gap-3 border-b border-border p-4 last:border-0"><div><div className="font-bold">{member.displayName || `کاربر ${member.userId}`}</div><div className="text-xs text-muted">{member.email}</div></div><span className="rounded-md bg-background px-2 py-1 text-xs font-bold">{getRoleLabel(member.role)}</span></div>)}
      </div>
    </div>
  );
}

function getRoleLabel(role: string | number) { const value = String(role); return value === "1" || value === "OrgAdmin" ? "مدیر سازمان" : value === "2" || value === "Manager" ? "مدیر" : "عضو"; }
