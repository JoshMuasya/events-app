"use client"

import React, { useState } from 'react'
import TicketManager from './TicketManager'
import TicketList from './TicketList'
import TicketAnalytics from './TicketAnalytics'
import { useParams } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import AddTicket from './AddTicket'
import { FiChevronUp, FiPlus } from 'react-icons/fi'

const Ticket = () => {
  const params = useParams()
  const eventId = params.eventId as string;
  const [addingTicket, setAddingTicket] = useState(false)

  console.log("Ticket ID", eventId)

  const formVariants = {
    hidden: { opacity: 0, height: 0 },
    visible: {
      opacity: 1,
      height: "auto",
      transition: {
        opacity: { duration: 0.3 },
        height: { duration: 0.4, ease: "easeOut" },
      },
    },
    exit: {
      opacity: 0,
      height: 0,
      transition: {
        opacity: { duration: 0.2 },
        height: { duration: 0.3, ease: "easeIn" },
      },
    },
  };

  const buttonVariants = {
    hover: {
      scale: 1.05,
      boxShadow: "0 4px 12px rgba(106, 13, 173, 0.5)",
      transition: { duration: 0.2 },
    },
    tap: { scale: 0.95, transition: { duration: 0.1 } },
  };

  const toggleAddTicketForm = () => {
    setAddingTicket(!addingTicket);
  };

  return (
    <motion.div
      variants={formVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      role='form'
      aria-labelledby='add-ticket-form-title'
      className='pt-10'
    >
      {/* Add Ticket Form */}
      <AnimatePresence>
        {addingTicket && <AddTicket />}
      </AnimatePresence>

      <motion.button
        className="bg-[#6A0DAD] text-[#FFD700] px-4 py-2 rounded-lg flex items-center gap-2"
        variants={buttonVariants}
        whileHover="hover"
        whileTap="tap"
        onClick={toggleAddTicketForm}
        aria-label={addingTicket ? "Hide add speaker form" : "Add new speaker"}
      >
        {addingTicket ? (
          <>
            <FiChevronUp aria-hidden="true" /> Hide Form
          </>
        ) : (
          <>
            <FiPlus aria-hidden="true" /> Add New Ticket
          </>
        )}
      </motion.button>

      <TicketManager eventId={eventId} />
      <TicketList eventId={eventId} event={{
        title: '',
        description: '',
        date: '',
        location: ''
      }} />
      <TicketAnalytics eventId={eventId} />
    </motion.div>
  )
}

export default Ticket
