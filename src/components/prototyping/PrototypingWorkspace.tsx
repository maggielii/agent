import { AnimatePresence, motion } from "framer-motion";
import { useStore } from "../../store/useStore";
import { CodePanel } from "./CodePanel";
import { CodeReviewPanel } from "./CodeReviewPanel";
import { PreviewFrame } from "./PreviewFrame";

export function PrototypingWorkspace() {
  const codeReview = useStore((state) => state.codeReview);

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key="prototype-workspace"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="flex min-h-full flex-col"
      >
        <div className="grid min-h-[calc(100vh-176px)] flex-1 grid-cols-2 border-b border-white/10">
          <CodePanel />
          <PreviewFrame />
        </div>
        {codeReview && <CodeReviewPanel review={codeReview} />}
      </motion.div>
    </AnimatePresence>
  );
}
