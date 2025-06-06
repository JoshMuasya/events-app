import { motion } from "framer-motion";
import Image from "next/image";
import { format } from "date-fns";
import { EventHeaderProps } from "@/lib/types";

export default function EventHeader({ event, liveData }: EventHeaderProps) {
  console.log("Font", event.eventName)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-6 flex flex-col justify-center align-middle items-center"
    >
      <h1
        className="text-4xl font-bold mb-2"
        style={{ fontFamily: event.headingFont, color: event.primaryColor }}
      >
        {event.eventName}
      </h1>
      <p className="text-lg">{format(new Date(event.date), "PPp")}</p>
      <p>
        {event.isVirtual ? (
          <a href={event.location} className="text-blue-500" target="_blank" rel="noopener noreferrer">
            Virtual Event ({event.location})
          </a>
        ) : (
          <>Location: {event.location}</>
        )}
      </p>
      <p>
        Live Attendees: {liveData.attendees} / {event.maxAttendees || "Unlimited"} | Tickets Remaining: {liveData.ticketsRemaining}
      </p>
      {event.image && (
        <Image
          src={event.image}
          alt={event.eventName}
          width={600}
          height={400}
          className="rounded-lg mt-4 w-full max-w-2xl object-cover"
        />
      )}
    </motion.div>
  );
}