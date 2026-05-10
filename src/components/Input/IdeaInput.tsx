import { Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SampleIdeaButton } from "./SampleIdeaButton";

interface IdeaInputProps {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  disabled?: boolean;
}

export function IdeaInput({ value, onChange, onSubmit, disabled }: IdeaInputProps) {
  const valid = value.trim().length > 0;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-white/10 bg-black/50 px-4 py-4 backdrop-blur-2xl md:px-8">
      <div className="mx-auto flex max-w-[1600px] flex-col gap-3 md:flex-row md:items-end">
        <div className="flex-1 space-y-2">
          <label
            htmlFor="idea"
            className="text-xs font-semibold uppercase tracking-wider text-cyan-200/90"
          >
            What startup idea should the council evaluate?
          </label>
          <textarea
            id="idea"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
            rows={3}
            placeholder="Describe your startup idea — problem, wedge, buyer, edge."
            className="w-full resize-none rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-foreground shadow-inner outline-none ring-cyan-400/30 placeholder:text-muted-foreground focus:border-cyan-400/50 focus:ring-2 disabled:opacity-50"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2 md:justify-end">
          <SampleIdeaButton onFill={onChange} disabled={disabled} />
          <Button
            size="lg"
            className="min-w-[200px] bg-gradient-to-r from-cyan-500 to-violet-600 px-6 text-white shadow-[0_0_30px_rgba(34,211,238,0.35)] hover:from-cyan-400 hover:to-violet-500"
            disabled={disabled || !valid}
            onClick={onSubmit}
          >
            <Rocket className="h-5 w-5" />
            Summon Council
          </Button>
        </div>
      </div>
    </div>
  );
}
