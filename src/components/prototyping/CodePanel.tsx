import { useStore } from "../../store/useStore";

export function CodePanel() {
  const generatedCode = useStore((state) => state.generatedCode);
  const isGeneratingCode = useStore((state) => state.isGeneratingCode);
  const streamingCode = useStore((state) => state.streamingText.swe1);
  const visibleCode = isGeneratingCode ? streamingCode : generatedCode;

  return (
    <section className="flex min-h-0 flex-col border-r border-white/10">
      <div className="flex h-10 items-center justify-between border-b border-white/10 px-3">
        <h2 className="text-xs uppercase tracking-wider text-zinc-500">Prototype</h2>
        <span className="font-mono text-xs text-zinc-600">{isGeneratingCode ? "streaming" : `${generatedCode.length} chars`}</span>
      </div>
      <pre className="h-full overflow-auto whitespace-pre-wrap p-3 font-mono text-xs leading-5 text-zinc-300 scrollbar-thin-dark">
        {visibleCode || "Prototype code will stream here during Stage 3."}
        {isGeneratingCode && <span className="text-zinc-50">▋</span>}
      </pre>
    </section>
  );
}
