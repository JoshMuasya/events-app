import { StaffEventActionsProps } from "@/lib/types";
import { motion } from "framer-motion";
import { FiEdit, FiTrash2, FiUsers } from "react-icons/fi";

export function StaffEventActions({
    isStaff,
    event,
    handleEdit,
    handleDelete,
    handleManageRsvps,
    handleManageTickets,
}: StaffEventActionsProps) {
    if (!isStaff) return null;

    return (
        <div className="my-6">
            <div className="flex flex-wrap gap-4 mb-4">
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleEdit}
                    className="px-4 py-2 rounded text-white flex items-center gap-2"
                    style={{ backgroundColor: event.primaryColor }}
                    aria-label="Edit Event"
                >
                    <FiEdit /> Edit Event
                </motion.button>
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleDelete}
                    className="px-4 py-2 rounded bg-red-500 text-white flex items-center gap-2"
                    aria-label="Delete Event"
                >
                    <FiTrash2 /> Delete Event
                </motion.button>
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleManageRsvps}
                    className="px-4 py-2 rounded bg-gray-500 text-white flex items-center gap-2"
                    aria-label="Manage RSVPs"
                >
                    <FiUsers /> Manage RSVPs
                </motion.button>
                {event.ticketEnabled && (
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleManageTickets}
                        className="px-4 py-2 rounded bg-gray-500 text-white flex items-center gap-2"
                        aria-label="Manage Tickets"
                    >
                        <FiUsers /> Manage Tickets
                    </motion.button>
                )}
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => window.location.href = `/events/${event.id}/analytics`}
                    className="px-4 py-2 rounded bg-gray-500 text-white flex items-center gap-2"
                    aria-label="View Analytics"
                >
                    <FiUsers /> View Analytics
                </motion.button>
            </div>
        </div>
    );
}