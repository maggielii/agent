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
      <div className="flex min-h-full items-center justify-center p-8 text-center">
        <div className="max-w-lg">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-600">Session idle</p>
          <h2 className="mt-3 text-2xl font-semibold text-zinc-100">Submit a startup idea to convene the court.</h2>
          <p className="mt-3 text-sm leading-6 text-zinc-500">
            Six agents will evaluate thesis quality, market evidence, technical feasibility, prototype quality, and governance trail.
          </p>
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
