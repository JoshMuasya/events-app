"use client"

import React from 'react'
import TicketList from './TicketList'
import { useParams } from 'next/navigation'

const GuestTicket = () => {
    const params = useParams()
    const eventId = params.eventId as string

  return (
    <div>
      <TicketList eventId={''} event={{
              title: '',
              description: '',
              date: '',
              location: ''
          }} />
    </div>
  )
}

export default GuestTicket
