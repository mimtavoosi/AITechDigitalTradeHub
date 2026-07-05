import { apiEndpoints } from "@/lib/api/api-endpoints";
import { apiRequest, toQueryString } from "@/lib/api/http-client";
import type { DotNetListResult, DotNetResult } from "@/types/api";
import type { FeeRulePayload, FeeRuleSummary, PlatformFeeContextType } from "@/features/finance/types";

export function getFeeRules() {
  return apiRequest<DotNetListResult<FeeRuleSummary>>(apiEndpoints.feeRules.list);
}

export function createFeeRule(payload: FeeRulePayload) {
  return apiRequest<DotNetResult>(apiEndpoints.feeRules.list, {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function updateFeeRule(id: number, payload: FeeRulePayload) {
  return apiRequest<DotNetResult>(apiEndpoints.feeRules.detail(id), {
    method: "PUT",
    body: JSON.stringify(payload)
  });
}

export function activateFeeRule(id: number) {
  return apiRequest<DotNetResult>(apiEndpoints.feeRules.activate(id), { method: "POST" });
}

export function deactivateFeeRule(id: number) {
  return apiRequest<DotNetResult>(apiEndpoints.feeRules.deactivate(id), { method: "POST" });
}

export function calculateFee(contextType: PlatformFeeContextType, amount: number) {
  return apiRequest<{ fee: number; netAmount: number }>(
    `${apiEndpoints.feeRules.calculate}${toQueryString({ contextType, amount })}`
  );
}

export function getFeeRuleId(rule: FeeRuleSummary) {
  return Number(rule.id ?? rule.iD ?? 0);
}

export function getFeeRuleContextType(rule: FeeRuleSummary) {
  return String(rule.contextType ?? rule.ContextType ?? "");
}

export function getFeeRulePercent(rule: FeeRuleSummary) {
  return Number(rule.percent ?? rule.Percent ?? 0);
}

export function getFeeRuleFixedAmount(rule: FeeRuleSummary) {
  return rule.fixedAmount ?? rule.FixedAmount ?? null;
}

export function getFeeRuleIsActive(rule: FeeRuleSummary) {
  return Boolean(rule.isActiveRule ?? rule.IsActiveRule ?? false);
}
