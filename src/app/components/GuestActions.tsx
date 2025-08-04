import { GuestEventActionsProps } from '@/lib/types'
import { motion } from 'framer-motion'
import React from 'react'
import { FaGift, FaTicketAlt } from 'react-icons/fa'
import { MdOutlineRsvp } from 'react-icons/md'

const GuestActions = ({
    event,
    handleBuyTickets,
    handleGuestRsvp,
    handleGifts,
}: GuestEventActionsProps) => {
    return (
        <div className="my-6">
            <div className="flex flex-wrap mb-4">
                {!event.ticketEnabled && (
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleGuestRsvp}
                        className="px-4 py-2 mx-3 md:mx-5 rounded text-white flex items-center gap-2"
                        style={{ backgroundColor: event.primaryColor, color: event.secondaryColor }}
                        aria-label="Edit Event"
                    >
                        <MdOutlineRsvp /> RSVP
                    </motion.button>
                )}
                {event.ticketEnabled && (
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleBuyTickets}
                        className="px-4 py-2 mx-3 md:mx-5 rounded bg-gray-500 text-white flex items-center gap-2"
                        style={{ backgroundColor: event.primaryColor, color: event.secondaryColor }}
                        aria-label="Manage Tickets"
                    >
                        <FaTicketAlt /> Buy Tickets
                    </motion.button>
                )}

                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleGifts}
                    className="px-4 py-2 rounded bg-gray-500 text-white flex items-center gap-2"
                    style={{ backgroundColor: event.primaryColor, color: event.secondaryColor }}
                    aria-label="Manage Tickets"
                >
                    <FaGift /> Register Gifts
                </motion.button>
            </div>
        </div>
    )
}

export default GuestActions
