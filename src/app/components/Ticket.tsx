"use client"

import React, { useEffect, useState } from 'react'
import TicketManager from './TicketManager'
import TicketList from './TicketList'
import TicketAnalytics from './TicketAnalytics'
import { useParams } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import AddTicket from './AddTicket'
import { FiChevronUp, FiPlus } from 'react-icons/fi'
import { EventDetail, TicketType } from '@/lib/types'
import toast from 'react-hot-toast'
import TicketSkeleton from './TicketSkeleton'
import SearchTickets from './SearchTickets'

const Ticket = () => {
  const params = useParams()
  const eventId = params.eventId as string;
  const [addingTicket, setAddingTicket] = useState(false)
  const [tickets, setTickets] = useState<TicketType[]>([])
  const [loading, setLoading] = useState(false)
  const [event, setEvent] = useState<EventDetail>()

  const fetchEvent = async () => {
    try {
      setLoading(true)

      const response = await fetch(`/api/events/event-management/${eventId}`)
      if (!response.ok) {
        throw new Error("Failed to fetch Events")
      }

      const data = await response.json()
      setEvent(data.event)
    } catch (error) {
      console.error("Error fetching Event:", error)
      toast.error("Failed to load Event")
    } finally {
      setLoading(false)
    }
  }

  const fetchTicket = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/ticket?eventId=${eventId}`)
      if (!response.ok) {
        throw new Error("Failed to fetch Tickets")
      }
      const data = await response.json()
      setTickets(data);
    } catch (error) {
      console.error("Error fetching Tickets:", error)
      toast.error("Failed to load Tickets")
    } finally {
      setLoading(false)
    }
  }

  if (eventId) {
    useEffect(() => {
      fetchTicket()
      fetchEvent()
    }, [])
  }

  console.log("Event", event?.eventName)

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
      className='pt-10 md:mb-10 w-2/3'
    >
      {loading ? (
        <TicketSkeleton />
      ) : (
        <>
          <AnimatePresence>
            {addingTicket && <AddTicket />}
          </AnimatePresence>

          <motion.button
            className="bg-[#6A0DAD] text-[#FFD700] px-4 py-2 rounded-lg flex items-center gap-2 md:mt-20"
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
          
          <TicketAnalytics eventId={eventId} />

          <SearchTickets />
        </>
      )}
    </motion.div>
  )
}

export default Ticket
