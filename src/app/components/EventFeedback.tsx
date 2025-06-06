import { EventFeedbackProps } from "@/lib/types";
import { motion, AnimatePresence } from "framer-motion";

export default function EventFeedback({
  isEventOver,
  showFeedback,
  feedbackForm,
  handleFeedbackSubmit,
  setShowFeedback,
  primaryColor,
}: EventFeedbackProps) {
  if (!isEventOver) return null;
  return (
    <AnimatePresence>
      {showFeedback && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="mb-6"
        >
          {/* <FeedbackForm form={feedbackForm} onSubmit={handleFeedbackSubmit} primaryColor={primaryColor} /> */}
        </motion.div>
      )}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setShowFeedback(!showFeedback)}
        className="px-4 py-2 rounded text-white mb-4"
        style={{ backgroundColor: primaryColor }}
        aria-label={showFeedback ? "Hide Feedback" : "Submit Feedback"}
      >
        {showFeedback ? "Hide Feedback" : "Submit Feedback"}
      </motion.button>
    </AnimatePresence>
  );
}