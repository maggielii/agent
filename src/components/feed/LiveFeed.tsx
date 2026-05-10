import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useStore } from "../../store/useStore";
import { FeedEvent } from "./FeedEvent";

export function LiveFeed() {
  const events = useStore((state) => state.events);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [events.length]);

  if (events.length === 0) {
    return (
      <div className="flex min-h-full items-center justify-center px-6 py-16 pb-28">
        <div className="w-full max-w-xl rounded-lg border border-white/[0.08] bg-court-raised/40 px-8 py-10 shadow-sm">
          <h2 className="text-lg font-medium tracking-tight text-zinc-100">New evaluation</h2>
          <p className="mt-2 text-sm leading-6 text-zinc-500">
            Enter a concise venture thesis below. The workflow runs stage-by-stage with checkpoints you can approve or stop.
          </p>
          <ul className="mt-8 space-y-3 text-sm text-zinc-400">
            <li className="flex gap-3">
              <span className="font-mono text-xs tabular-nums text-zinc-600">01</span>
              <span>Idea and thesis framing, then market and technical review.</span>
            </li>
            <li className="flex gap-3">
              <span className="font-mono text-xs tabular-nums text-zinc-600">02</span>
              <span>Prototype or implementation stage when applicable, with code review signals.</span>
            </li>
            <li className="flex gap-3">
              <span className="font-mono text-xs tabular-nums text-zinc-600">03</span>
              <span>Sealed stages, risk register, and a final proceed or pivot recommendation.</span>
            </li>
          </ul>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3 p-4 pb-40">
      {events.map((event) => (
        <motion.div
          key={event.id}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
        >
          <FeedEvent event={event} />
        </motion.div>
      ))}
      <div ref={bottomRef} />
    </div>
  );
}
