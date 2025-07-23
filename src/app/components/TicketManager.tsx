import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TicketManagerProps, TicketType } from "@/lib/types";
import { motion } from "framer-motion";
import z from "zod";
import toast from "react-hot-toast";
import { useParams } from "next/navigation";

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  exit: { opacity: 0, y: -30, transition: { duration: 0.2 } },
};

// Zod schema for ticket form validation
const ticketSchema = z.object({
  id: z.string().uuid().optional(),
  type: z.string().min(1, "Ticket type is required").max(50, "Ticket type must be 50 characters or less"),
  price: z.number().positive("Price must be positive").min(0, "Price cannot be negative"),
  availability: z.number().int("Availability must be an integer").min(0, "Availability cannot be negative"),
  perks: z.array(z.string().min(1, "Perk cannot be empty")).min(1, "At least one perk is required"),
  status: z.string().min(1, "Status can't be empty"),
});

// Define TicketForm type from the schema
type TicketForm = z.infer<typeof ticketSchema>;

const TicketManager: React.FC<TicketManagerProps> = () => {
  const [tickets, setTickets] = useState<TicketType[]>([]);
  const [editingTicketId, setEditingTicketId] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
  } = useForm<TicketForm>({
    resolver: zodResolver(ticketSchema),
  });
  const { eventId } = useParams()

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const response = await fetch(`/api/ticket?eventId=${eventId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch tickets");
        }
        const data = await response.json();
        setTickets(data);
      } catch {
        toast.error("Failed to load tickets.");
      }
    };

    if (eventId) {
      fetchTickets();
    }
  }, [eventId]);

  const onSubmit = async (data: TicketForm) => {
    if (!editingTicketId) return;
    try {
      const response = await fetch("/api/ticket/update-ticket", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticketId: editingTicketId, updates: data }),
      });
      if (response.ok) {
        toast.success("Ticket updated successfully!");
        setEditingTicketId(null);
        reset();
      } else throw new Error("Failed to update ticket");
    } catch {
      toast.error("Failed to update ticket.");
    }
  };

  const handleDelete = async (ticketId: string) => {
  if (!confirm("Are you sure you want to delete this ticket?")) return;
  try {
    const response = await fetch("/api/ticket/delete-ticket", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ticketId }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Delete ticket failed:', {
        status: response.status,
        error: errorData.error,
        ticketId,
      });
      throw new Error(errorData.error || 'Failed to delete ticket');
    }

    toast.success("Ticket deleted successfully!");
  } catch (error) {
    console.error('Error in handleDelete:', error);
    toast.error("Failed to delete ticket.");
  }
};

  const startEditing = (ticket: TicketType) => {
    setEditingTicketId(ticket.id);
    setValue("type", ticket.type);
    setValue("price", ticket.price);
    setValue("availability", ticket.availability);
    setValue("perks", ticket.perks);
    setValue("status", ticket.status); // Ensure status is set
  };

  return (
    <div className="space-y-6 text-[#6A0DAD] mb-3 md:mb-5">
      <h2 className="text-xl font-bold">Manage Tickets</h2>

      {editingTicketId && (
        <motion.div
          className="bg-[rgba(255,215,0,0.2)] backdrop-blur-md rounded-lg shadow-[0_4px_12px_rgba(106,13,173,0.3)]"
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          <div className="p-4">
            <h3 className="text-lg font-semibold">Edit Ticket</h3>
          </div>
          <div className="p-4">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <Input
                  className="input input-bordered w-full bg-white text-[#6A0DAD]"
                  placeholder="Ticket Type"
                  {...register("type")}
                />
                {errors.type && <p className="text-red-500 text-sm">{errors.type.message}</p>}
              </div>
              <div>
                <Input
                  type="number"
                  className="input input-bordered w-full bg-white text-[#6A0DAD]"
                  placeholder="Price"
                  {...register("price", { valueAsNumber: true })}
                />
                {errors.price && <p className="text-red-500 text-sm">{errors.price.message}</p>}
              </div>
              <div>
                <Input
                  type="number"
                  className="input input-bordered w-full bg-white text-[#6A0DAD]"
                  placeholder="Availability"
                  {...register("availability", { valueAsNumber: true })}
                />
                {errors.availability && <p className="text-red-500 text-sm">{errors.availability.message}</p>}
              </div>
              <div>
                <Input
                  className="input input-bordered w-full bg-white text-[#6A0DAD]"
                  placeholder="Perks (comma-separated)"
                  onChange={(e) =>
                    setValue("perks", e.target.value.split(",").map((p) => p.trim()))
                  }
                />
                {errors.perks && <p className="text-red-500 text-sm">{errors.perks.message}</p>}
              </div>
              <div>
                <Input
                  className="input input-bordered w-full bg-white text-[#6A0DAD]"
                  placeholder="Status"
                  {...register("status")}
                />
                {errors.status && <p className="text-red-500 text-sm">{errors.status.message}</p>}
              </div>
              <div className="flex gap-2">
                <Button type="submit" className="bg-[#6A0DAD] text-white hover:bg-[#FFD700] hover:text-[#6A0DAD]">
                  Save Changes
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setEditingTicketId(null);
                    reset();
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </motion.div>
      )}

      <div className="flex flex-row flex-wrap justify-around align-middle items-center">
        {tickets.length === 0 ? (
          <p className="text-gray-500">No tickets found for this event.</p>
        ) : (
          tickets.map((ticket) => (
            <motion.div
              key={ticket.id}
              className="bg-gradient-to-br from-[#F7E7CE] via-[#FFD700] to-[#E5C07B] rounded-lg p-6 shadow-[0_4px_12px_rgba(106,13,173,0.15)] w-1/3"
              variants={fadeInUp}
              initial="hidden"
              animate="visible"
              exit="exit"
              whileHover={{ scale: 1.01 }}
            >
              <h3 className="text-lg font-semibold">{ticket.type}</h3>
              <p>Price: ${ticket.price.toFixed(2)}</p>
              <p>Availability: {ticket.availability}</p>
              <p>Status: {ticket.status}</p>
              <ul className="list-disc ml-4 text-sm mt-2">
                {ticket.perks.map((perk) => (
                  <li key={perk}>{perk}</li>
                ))}
              </ul>
              <div className="flex gap-2 mt-4">
                <Button
                  onClick={() => startEditing(ticket)}
                  className="bg-[#6A0DAD] text-white hover:bg-[#FFD700] hover:text-[#6A0DAD]"
                >
                  Edit
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => handleDelete(ticket.id)}
                >
                  Delete
                </Button>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};

export default TicketManager;