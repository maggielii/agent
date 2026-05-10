import { Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DEFAULT_SAMPLE_IDEA } from "@/data/sampleIdeas";

interface SampleIdeaButtonProps {
  onFill: (text: string) => void;
  disabled?: boolean;
}

export function SampleIdeaButton({ onFill, disabled }: SampleIdeaButtonProps) {
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      disabled={disabled}
      className="border-cyan-500/30 text-cyan-50 hover:bg-cyan-500/10"
      onClick={() => onFill(DEFAULT_SAMPLE_IDEA)}
    >
      <Wand2 className="h-4 w-4" />
      Load sample idea
    </Button>
  );
}
