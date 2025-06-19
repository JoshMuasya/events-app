"use client"

import EventEditForm from "@/app/components/EventEditForm";
import { useParams } from "next/navigation";
import React from 'react'

const page = () => {
    const params = useParams();
    const eventId = params.eventId as string;

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#F7E7CE] via-[#FFD700] to-[#E5C07B] overflow-hidden px-4">
            <EventEditForm />
        </div>
    )
}

export default page
