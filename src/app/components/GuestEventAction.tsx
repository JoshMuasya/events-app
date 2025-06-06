import { motion } from "framer-motion";
import { FiEdit, FiTrash2, FiUsers } from "react-icons/fi";
import { EventActionsProps } from "@/lib/types";

export function GuestEventActions({
  user,
  isEventOver,
  event,
  rsvpForm,
  ticketCheckForm,
  rsvpResult,
  ticketInfo,
  waitlistJoined,
  handleRsvpSubmit,
  handleTicketCheckSubmit,
  handlePurchaseTickets,
}: EventActionsProps) {
  if (user || isEventOver) return null;

  return (
    <div className="mb-6">
      <h3 className="text-xl font-semibold mb-2">Guest Actions</h3>
      <div className="flex flex-wrap gap-4 mb-4">
        <div>
          <h4 className="text-lg font-medium">RSVP</h4>
          <form onSubmit={rsvpForm.handleSubmit(handleRsvpSubmit)} className="flex flex-col gap-2">
            <input
              {...rsvpForm.register("name")}
              placeholder="Your Name"
              className="border p-2 rounded"
              aria-invalid={rsvpForm.formState.errors.name ? "true" : "false"}
            />
            {rsvpForm.formState.errors.name && (
              <p className="text-red-500">{rsvpForm.formState.errors.name.message}</p>
            )}
            <input
              {...rsvpForm.register("email")}
              placeholder="Your Email"
              className="border p-2 rounded"
              aria-invalid={rsvpForm.formState.errors.email ? "true" : "false"}
            />
            {rsvpForm.formState.errors.email && (
              <p className="text-red-500">{rsvpForm.formState.errors.email.message}</p>
            )}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              className="px-4 py-2 rounded text-white"
              style={{ backgroundColor: event.primaryColor }}
              aria-label="Submit RSVP"
            >
              {waitlistJoined ? "Joined Waitlist" : "Submit RSVP"}
            </motion.button>
          </form>
        </div>
        {event.ticketEnabled && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handlePurchaseTickets}
            className="px-4 py-2 rounded text-white"
            style={{ backgroundColor: event.primaryColor }}
            aria-label="Purchase Tickets"
          >
            Purchase Tickets ${event.ticketPrice}
          </motion.button>
        )}
      </div>
      <div className="mt-4">
        <h4 className="text-lg font-medium">Manage RSVP/Ticket</h4>
        <form onSubmit={ticketCheckForm.handleSubmit(handleTicketCheckSubmit)} className="flex flex-col gap-2">
          <input
            {...ticketCheckForm.register("email")}
            placeholder="Your Email"
            className="border p-2 rounded"
            aria-invalid={ticketCheckForm.formState.errors.email ? "true" : "false"}
          />
          {ticketCheckForm.formState.errors.email && (
            <p className="text-red-500">{ticketCheckForm.formState.errors.email.message}</p>
          )}
          <input
            {...ticketCheckForm.register("code")}
            placeholder="Confirmation Code"
            className="border p-2 rounded"
            aria-invalid={ticketCheckForm.formState.errors.code ? "true" : "false"}
          />
          {ticketCheckForm.formState.errors.code && (
            <p className="text-red-500">{ticketCheckForm.formState.errors.code.message}</p>
          )}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            className="px-4 py-2 rounded text-white"
            style={{ backgroundColor: event.primaryColor }}
            aria-label="View Details"
          >
            View Details
          </motion.button>
        </form>
        {rsvpResult && <p className="mt-2">{rsvpResult}</p>}
        {ticketInfo && (
          <div className="mt-4">
            <h4 className="text-lg font-medium">Your Ticket</h4>
            {/* <QRCode value={ticketInfo.qrCode} size={128} /> */}
            <p>Ticket Code: {ticketInfo.code}</p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => window.print()}
              className="px-4 py-2 rounded text-white mt-2"
              style={{ backgroundColor: event.primaryColor }}
              aria-label="Print Ticket"
            >
              Print Ticket
            </motion.button>
          </div>
        )}
      </div>
    </div>
  );
}