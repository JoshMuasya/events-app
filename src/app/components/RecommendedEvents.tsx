import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { format } from "date-fns";
import { RecommendedEventsProps } from "@/lib/types";

export default function RecommendedEvents({ recommendedEvents, primaryColor }: RecommendedEventsProps) {
  if (recommendedEvents.length === 0) return null;
  return (
    <div className="mt-6">
      <h2 className="text-2xl font-semibold">Recommended Events</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {recommendedEvents.map((recEvent) => (
          <motion.div
            key={recEvent.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-lg p-4 shadow-lg"
            style={{ backgroundColor: primaryColor + "20" }}
          >
            <Link href={`/events/${recEvent.id}`}>
              <Image
                src={recEvent.image || "/event-placeholder.png"}
                alt={recEvent.eventName}
                width={200}
                height={150}
                className="rounded-lg mb-2"
              />
              <h3 className="text-lg font-semibold">{recEvent.eventName}</h3>
              <p>{format(new Date(recEvent.date), "PP")}</p>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}