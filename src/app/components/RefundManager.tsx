import { useState } from "react";
import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CardHeader, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  exit: { opacity: 0, y: -30, transition: { duration: 0.2 } },
};

const RefundManager: React.FC = () => {
  const [ticketId, setTicketId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const ticketDoc = await getDoc(doc(db, "tickets", ticketId));
      if (!ticketDoc.exists()) throw new Error("Ticket not found");
      const ticket = ticketDoc.data();
      if (!ticket.paymentIntentId) throw new Error("No payment associated with this ticket");

      const response = await fetch("/api/refund-ticket", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticketId, paymentIntentId: ticket.paymentIntentId }),
      });

      if (!response.ok) throw new Error("Failed to process refund");

      await updateDoc(doc(db, "tickets", ticketId), { status: "refunded" });
      toast.success("Refund processed successfully!");
      setTicketId("");
    } catch (error: any) {
      toast.error("Failed to process refund.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      variants={fadeInUp}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="bg-[rgba(255,215,0,0.2)] backdrop-blur-md rounded-lg p-6 shadow-[0_4px_12px_rgba(106,13,173,0.3)] text-[#6A0DAD] max-w-md mx-auto"
    >
      <CardHeader className="p-0 mb-4">
        <h2 className="text-xl font-bold">Process Refund</h2>
      </CardHeader>
      <CardContent className="p-0">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            placeholder="Enter Ticket ID"
            value={ticketId}
            onChange={(e) => setTicketId(e.target.value)}
            className="input input-bordered bg-white text-[#6A0DAD]"
            aria-label="Ticket ID for refund"
          />
          <Button
            type="submit"
            disabled={isSubmitting || !ticketId}
            className="bg-[#6A0DAD] text-white hover:bg-[#FFD700] hover:text-[#6A0DAD] w-full"
          >
            {isSubmitting ? "Processing..." : "Process Refund"}
          </Button>
        </form>
      </CardContent>
    </motion.div>
  );
};

export default RefundManager;
