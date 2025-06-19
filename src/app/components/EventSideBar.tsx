import { motion } from "framer-motion";
import { FiCalendar, FiFacebook, FiShare2, FiX } from "react-icons/fi";
import { IoLogoWhatsapp } from "react-icons/io";
import { EventDetail, EventSidebarProps } from "@/lib/types";
import { FaTelegram } from "react-icons/fa";

export default function EventSidebar({ event, handleAddToCalendar, shareEvent }: EventSidebarProps) {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h3 className="text-xl font-semibold">Organizer Contact</h3>
        <p>Email: {event.contactEmail}</p>
        <p>Phone: {event.contactPhone}</p>
      </div>
      <div>
        <h3 className="text-xl font-semibold">Add to Calendar</h3>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleAddToCalendar}
          className="px-4 py-2 rounded bg-gray-500 text-white flex items-center gap-2"
          aria-label="Add to Calendar"
        >
          <FiCalendar /> Add to Calendar
        </motion.button>
      </div>
      <div>
        <h3 className="text-xl font-semibold">Share Event</h3>
        <div className="flex gap-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => shareEvent("facebook")}
            className="p-2 rounded-full bg-blue-600 text-white"
            aria-label="Share on Facebook"
          >
            <FiFacebook />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => shareEvent("x")}
            className="p-2 rounded-full bg-black text-white"
            aria-label="Share on X"
          >
            <FiX />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => shareEvent("whatsapp")}
            className="p-2 rounded-full bg-green-500 text-white"
            aria-label="Share on WhatsApp"
          >
            <IoLogoWhatsapp />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => shareEvent("telegram")}
            className="p-2 rounded-full bg-blue-400 text-white"
            aria-label="Share on Telegram"
          >
            <FaTelegram />
          </motion.button>
        </div>
      </div>
    </div>
  );
}