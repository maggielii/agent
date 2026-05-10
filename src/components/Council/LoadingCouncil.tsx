import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

export function LoadingCouncil() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }}
      >
        <Loader2 className="h-10 w-10 text-cyan-300" />
      </motion.div>
      <div>
        <p className="text-lg font-semibold text-white">Convening the council…</p>
        <p className="text-sm text-muted-foreground">
          Streaming agent deliberation, sponsor layers, and judge scoring.
        </p>
      </div>
    </div>
  );
}
