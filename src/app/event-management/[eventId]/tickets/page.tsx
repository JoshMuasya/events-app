"use client"

import { useParams } from 'next/navigation';
import React from 'react'

const page = () => {
    const params = useParams();
    const eventId = params.eventId as string;

    return (
        <div>
            Tickets for {eventId}
        </div>
    )
}

export default page
