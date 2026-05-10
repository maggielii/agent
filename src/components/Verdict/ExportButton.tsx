import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { buildExportPayload, downloadJson, exportVerdictFilename } from "@/services/exportService";
import type { CouncilRunResult } from "@/types/council";

interface ExportButtonProps {
  result: CouncilRunResult | null;
}

export function ExportButton({ result }: ExportButtonProps) {
  if (!result) return null;

  return (
    <Button
      variant="secondary"
      className="border border-white/15"
      onClick={() => {
        const payload = buildExportPayload(result);
        downloadJson(exportVerdictFilename(), payload);
      }}
    >
      <Download className="h-4 w-4" />
      Export JSON report
    </Button>
  );
}
