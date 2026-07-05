"use client";

import { useQuery } from "@tanstack/react-query";
import { Award } from "lucide-react";
import { getAssignmentBadge, getAssignmentId, getBadgeTitle, getBadgesForTarget } from "@/features/badges/api/badges-api";
import type { BadgeTargetType } from "@/features/badges/types";

export function BadgeList({ targetType, targetId }: { targetType: BadgeTargetType; targetId: number }) {
  const query = useQuery({
    queryKey: ["badges", "target", targetType, targetId],
    queryFn: () => getBadgesForTarget(targetType, targetId),
    enabled: targetId > 0
  });

  const assignments = query.data?.results ?? [];
  if (!assignments.length) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {assignments.map((assignment) => {
        const badge = getAssignmentBadge(assignment);
        if (!badge) return null;
        return (
          <span key={getAssignmentId(assignment)} className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-800">
            <Award className="size-3.5" />
            {getBadgeTitle(badge)}
          </span>
        );
      })}
    </div>
  );
}
