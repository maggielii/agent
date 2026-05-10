import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-white/10 bg-white/10 text-foreground shadow-sm",
        secondary:
          "border-white/10 bg-secondary text-secondary-foreground",
        outline: "border-white/20 text-foreground",
        success:
          "border-emerald-500/40 bg-emerald-500/10 text-emerald-200",
        warn: "border-amber-500/40 bg-amber-500/10 text-amber-100",
        danger:
          "border-red-500/40 bg-red-500/10 text-red-100",
        glow:
          "border-cyan-400/40 bg-cyan-500/15 text-cyan-50 shadow-[0_0_20px_rgba(34,211,238,0.25)]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
