"use client"

import React, { useEffect, useState } from 'react'
import TicketList from './TicketList'
import { useParams } from 'next/navigation'
import { EventDetail } from '@/lib/types'
import toast from 'react-hot-toast'

const GuestTicket = () => {
  const params = useParams()
  const eventId = params.eventId as string
  const [event, setEvent] = useState<EventDetail>()
  const [loading, setLoading] = useState(false)

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

    useEffect(() => {
      fetchEvent()
    }, [])

  return (
    <div className='w-2/3'>
      <TicketList eventId={eventId} event={{
        eventName: `${event?.eventName}`,
        eventDesc: `${event?.eventDesc}`,
        date: `${event?.date}`,
        location: `${event?.location}`
      }} />
    </div>
  )
}

export default GuestTicket
