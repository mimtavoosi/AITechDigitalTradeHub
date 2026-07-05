"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createOrganization, getMyOrganizations, updateOrganization } from "@/features/organizations/api/organizations-api";
import { organizationTypeOptions } from "@/features/organizations/components/organization-list-client";
import { queryKeys } from "@/lib/query-keys";

export function OrganizationSettingsClient() {
  const queryClient = useQueryClient();
  const query = useQuery({ queryKey: queryKeys.company.organizations(), queryFn: getMyOrganizations });
  const organization = query.data?.results?.[0];
  const mutation = useMutation({
    mutationFn: (payload: Parameters<typeof createOrganization>[0]) => organization ? updateOrganization(organization.id, payload) : createOrganization(payload),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: queryKeys.company.organizations() })
  });

  return (
    <form className="grid gap-4 rounded-lg border border-border bg-white p-5 md:grid-cols-2" onSubmit={(event) => {
      event.preventDefault();
      const form = new FormData(event.currentTarget);
      mutation.mutate({
        title: String(form.get("title") || ""), slug: String(form.get("slug") || ""), type: Number(form.get("type") || 1),
        nationalId: String(form.get("nationalId") || "") || undefined, description: String(form.get("description") || "") || undefined,
        websiteUrl: String(form.get("websiteUrl") || "") || undefined, publicEmail: String(form.get("publicEmail") || "") || undefined,
        publicPhone: String(form.get("publicPhone") || "") || undefined, requireApprovalForMemberPayments: form.get("requireApproval") === "on",
        defaultMemberPaymentLimit: Number(form.get("paymentLimit") || 0) || undefined
      });
    }}>
      <Field label="نام سازمان"><input name="title" defaultValue={organization?.title} required className="input" /></Field>
      <Field label="شناسه URL انگلیسی"><input name="slug" defaultValue={organization?.slug} required pattern="[a-z0-9]+(?:-[a-z0-9]+)*" dir="ltr" className="input" /></Field>
      <Field label="نوع سازمان"><select name="type" defaultValue={Number(organization?.type ?? 1)} className="input">{organizationTypeOptions.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></Field>
      <Field label="شناسه ملی/ثبت"><input name="nationalId" defaultValue={organization?.nationalId ?? ""} className="input" /></Field>
      <Field label="وب‌سایت"><input name="websiteUrl" defaultValue={organization?.websiteUrl ?? ""} type="url" dir="ltr" className="input" /></Field>
      <Field label="ایمیل عمومی"><input name="publicEmail" defaultValue={organization?.publicEmail ?? ""} type="email" dir="ltr" className="input" /></Field>
      <Field label="تلفن عمومی"><input name="publicPhone" defaultValue={organization?.publicPhone ?? ""} dir="ltr" className="input" /></Field>
      <Field label="سقف پیش‌فرض پرداخت اعضا"><input name="paymentLimit" defaultValue={organization?.defaultMemberPaymentLimit ?? ""} type="number" min="0" className="input" /></Field>
      <label className="flex items-center gap-2 text-sm md:col-span-2"><input name="requireApproval" type="checkbox" defaultChecked={organization?.requireApprovalForMemberPayments ?? true} /> پرداخت اعضا نیازمند تایید مدیر سازمان باشد</label>
      <Field label="معرفی سازمان" wide><textarea name="description" defaultValue={organization?.description ?? ""} className="min-h-32 rounded-md border border-border px-3 py-2" /></Field>
      <div className="md:col-span-2 flex items-center gap-3"><button className="h-11 rounded-md bg-primary px-5 font-bold text-white disabled:opacity-60" disabled={mutation.isPending}>{organization ? "ذخیره تغییرات" : "ثبت سازمان"}</button><span className="text-xs text-muted">{organization ? `وضعیت: ${String(organization.status)}` : "پس از ثبت، سازمان برای تایید مدیریت ارسال می‌شود."}</span></div>
    </form>
  );
}

function Field({ label, wide, children }: { label: string; wide?: boolean; children: React.ReactNode }) { return <label className={`grid gap-2 text-sm font-bold ${wide ? "md:col-span-2" : ""}`}>{label}{children}</label>; }
