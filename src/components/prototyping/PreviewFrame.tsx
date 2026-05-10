import { motion } from "framer-motion";
import { ExternalLink } from "lucide-react";
import { useStore } from "../../store/useStore";

export function PreviewFrame() {
  const generatedCode = useStore((state) => state.generatedCode);
  const isGeneratingCode = useStore((state) => state.isGeneratingCode);
  const openPrototype = useStore((state) => state.openPrototype);

  return (
    <section className="flex min-h-0 flex-col">
      <div className="flex h-10 items-center justify-between border-b border-white/10 px-3">
        <h2 className="text-xs uppercase tracking-wider text-zinc-500">Preview</h2>
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs text-zinc-600">{generatedCode ? "srcdoc" : "waiting"}</span>
          <button
            type="button"
            disabled={!generatedCode}
            onClick={openPrototype}
            className="inline-flex items-center gap-1 rounded border border-white/10 px-2 py-1 text-xs text-zinc-300 hover:bg-white/[0.03] disabled:cursor-not-allowed disabled:text-zinc-700"
          >
            <ExternalLink className="h-3 w-3" />
            Open
          </button>
        </div>
      </div>
      <div className="relative h-full bg-zinc-950">
        {!generatedCode && (
          <div className="flex h-full items-center justify-center text-sm text-zinc-600">
            {isGeneratingCode ? "Rendering when code completes..." : "Prototype preview will appear here."}
          </div>
        )}
        <motion.iframe
          srcDoc={generatedCode}
          sandbox="allow-scripts"
          className="h-full w-full border-0"
          title="MVP Preview"
          animate={{ opacity: generatedCode ? 1 : 0 }}
          transition={{ duration: 0.5 }}
        />
      </div>
    </section>
  );
}
