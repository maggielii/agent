import { motion } from "framer-motion";
import { useStore } from "../../store/useStore";

export function PreviewFrame() {
  const generatedCode = useStore((state) => state.generatedCode);
  const isGeneratingCode = useStore((state) => state.isGeneratingCode);

  return (
    <section className="flex min-h-0 flex-col">
      <div className="flex h-10 items-center justify-between border-b border-white/10 px-3">
        <h2 className="text-xs uppercase tracking-wider text-zinc-500">Preview</h2>
        <span className="font-mono text-xs text-zinc-600">{generatedCode ? "srcdoc" : "waiting"}</span>
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
