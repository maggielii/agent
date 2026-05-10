import clsx from "clsx";
import type { Position, Severity, StageStatus } from "../../types";

type StatusBadgeProps = {
  label: string;
  tone?: Position | Severity | StageStatus | "stage" | "success" | "warning" | "danger" | "neutral";
};

const toneClasses: Record<NonNullable<StatusBadgeProps["tone"]>, string> = {
  bullish: "border-emerald-400/25 bg-emerald-400/10 text-emerald-300",
  cautious: "border-amber-400/25 bg-amber-400/10 text-amber-300",
  adversarial: "border-red-400/25 bg-red-400/10 text-red-300",
  neutral: "border-zinc-400/20 bg-zinc-400/10 text-zinc-300",
  HIGH: "border-red-400/25 bg-red-400/10 text-red-300",
  MEDIUM: "border-amber-400/25 bg-amber-400/10 text-amber-300",
  LOW: "border-zinc-400/20 bg-zinc-400/10 text-zinc-300",
  pending: "border-white/10 bg-white/[0.03] text-zinc-500",
  active: "border-indigo-400/30 bg-indigo-400/10 text-indigo-300",
  complete: "border-emerald-400/25 bg-emerald-400/10 text-emerald-300",
  stage: "border-indigo-400/25 bg-indigo-400/10 text-indigo-300",
  success: "border-emerald-400/25 bg-emerald-400/10 text-emerald-300",
  warning: "border-amber-400/25 bg-amber-400/10 text-amber-300",
  danger: "border-red-400/25 bg-red-400/10 text-red-300",
};

export function StatusBadge({ label, tone = "neutral" }: StatusBadgeProps) {
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
        toneClasses[tone]
      )}
    >
      {label}
    </span>
  );
}
