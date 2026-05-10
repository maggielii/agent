import { GitMerge } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface DisagreementPanelProps {
  items: string[];
}

export function DisagreementPanel({ items }: DisagreementPanelProps) {
  return (
    <Card className="border-amber-500/30 bg-amber-500/[0.06]">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base text-amber-100">
          <GitMerge className="h-5 w-5" />
          Council disagreements
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2 text-sm text-muted-foreground">
          {items.map((d) => (
            <li
              key={d}
              className="rounded-lg border border-amber-500/20 bg-black/30 px-3 py-2 leading-relaxed"
            >
              {d}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
