import { Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function Header() {
  return (
    <header className="flex flex-col gap-3 border-b border-white/10 bg-black/20 px-6 py-4 backdrop-blur-xl md:flex-row md:items-center md:justify-between">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-cyan-400/40 bg-gradient-to-br from-cyan-500/30 to-violet-600/30 shadow-[0_0_24px_rgba(34,211,238,0.35)]">
          <Sparkles className="h-5 w-5 text-cyan-100" />
        </div>
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-white md:text-2xl">
              CouncilOS
            </h1>
            <Badge variant="glow" className="text-[10px]">
              Autonomous venture council
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            AI boardroom · venture governance · multi-agent decisions{" "}
            <span className="hidden sm:inline">— built for agents that ship.</span>
          </p>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        <span className="rounded-md border border-white/10 bg-white/5 px-2 py-1 font-mono">
          Nia · Greptile · CLoD · AllScale · BGA · Gemini-ready
        </span>
      </div>
    </header>
  );
}
