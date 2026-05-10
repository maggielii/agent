import { Download } from "lucide-react";
import type { FinalVerdict } from "../../types";

function exportVerdict(verdict: FinalVerdict) {
  const blob = new Blob([JSON.stringify(verdict, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `venture-court-verdict-${Date.now()}.json`;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function ExportButton({ verdict }: { verdict: FinalVerdict }) {
  return (
    <button
      type="button"
      onClick={() => exportVerdict(verdict)}
      className="inline-flex items-center gap-2 rounded border border-white/10 bg-zinc-100 px-3 py-2 text-sm font-medium text-zinc-950"
    >
      <Download className="h-4 w-4" />
      Export JSON
    </button>
  );
}
