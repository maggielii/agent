import clsx from "clsx";

type ConfidenceBarProps = {
  value: number;
};

export function ConfidenceBar({ value }: ConfidenceBarProps) {
  const clamped = Math.max(0, Math.min(100, Math.round(value)));
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
      <div
        className={clsx(
          "h-full rounded-full transition-all duration-300",
          clamped > 70 && "bg-emerald-400",
          clamped >= 50 && clamped <= 70 && "bg-amber-400",
          clamped < 50 && "bg-red-400"
        )}
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}
