import { Badge } from "@/components/ui/badge";
import type { FinalDecision } from "@/types/council";
import { cn } from "@/lib/utils";

interface VerdictBadgeProps {
  decision: FinalDecision;
  className?: string;
}

export function VerdictBadge({ decision, className }: VerdictBadgeProps) {
  const variant =
    decision === "Proceed" ? "success" : decision === "Pivot" ? "warn" : "danger";
  return (
    <Badge
      variant={variant}
      className={cn("px-4 py-1.5 text-sm font-semibold tracking-wide", className)}
    >
      {decision}
    </Badge>
  );
}
