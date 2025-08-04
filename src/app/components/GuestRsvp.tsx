"use client"

import { EventDetail } from '@/lib/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion'
import { useParams } from 'next/navigation';
import React, { useEffect, useState, useRef } from 'react'
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import z from 'zod';
import QRCode from 'qrcode';
import { jsPDF } from 'jspdf';

const rsvpSchema = z.object({
    fullName: z.string().min(1, "Name is required"),
    emailAddress: z.string().email("Not a valid Email please check"),
    numberofAttendees: z.string().min(1, "Can't be empty")
})

type FormData = z.infer<typeof rsvpSchema>;

const GuestRsvp = () => {
    const [error, setError] = useState<string | null>(null);
    const [event, setEvent] = useState<EventDetail>()
    const [loading, setLoading] = useState(false)
    const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null)
    const [rsvpId, setRsvpId] = useState<string | null>(null)
    const qrCodeRef = useRef<HTMLCanvasElement>(null)
    const { eventId } = useParams()

    const fetchEvent = async () => {
        try {
            const res = await fetch(`/api/events/event-management/${eventId}`)
            const data = await res.json()
            setEvent(data?.event)
        } catch (error) {
            console.error('Failed to fetch event:', error);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchEvent()
    }, [])

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

    const {
        register,
        handleSubmit,
        setValue,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<FormData>({
        resolver: zodResolver(rsvpSchema),
    })

    const generateQRCode = async (rsvpId: string) => {
        try {
            const qrCodeDataUrl = await QRCode.toDataURL(rsvpId, {
                width: 200,
                margin: 2,
            })
            setQrCodeUrl(qrCodeDataUrl)
        } catch (err) {
            console.error('Failed to generate QR code:', err)
            toast.error('Failed to generate QR code')
        }
    }

    const downloadPDF = () => {
        if (qrCodeUrl && event) {
            const doc = new jsPDF()
            doc.setFontSize(20)
            doc.text(`RSVP Confirmation for ${event.eventName}`, 20, 20)
            doc.setFontSize(12)
            doc.text(`RSVP ID: ${rsvpId}`, 20, 30)
            doc.addImage(qrCodeUrl, 'PNG', 20, 40, 80, 80)
            doc.save(`rsvp-${rsvpId}.pdf`)
        }
    }

    const onSubmit = async (data: FormData) => {
        try {
            const response = await fetch("/api/events/event-management/rsvp", {
                method: "POST",
                headers: {
                    "Content-type": "application/json"
                },
                body: JSON.stringify({
                    eventId: eventId,
                    fullName: data.fullName,
                    emailAddress: data.emailAddress,
                    numberofAttendees: data.numberofAttendees
                })
            })

            const responseData = await response.json()
            
            if (response.ok) {
                toast.success("RSVP Successful")
                setRsvpId(responseData.rsvpId)
                await generateQRCode(responseData.rsvpId)
                reset()
            } else {
                throw new Error(responseData.error || "Failed to RSVP")
            }
        } catch (err) {
            toast.error("Failed to RSVP. Try again")
            setError(err instanceof Error ? err.message : "Failed to create RSVP")
        }
    }

    return (
        <div>
            <motion.div
                className="bg-[rgba(255,215,0,0.2)] backdrop-blur-md rounded-lg p-6 mb-6 shadow-[0_4px_12px_rgba(106,13,173,0.3)] text-[#6A0DAD]"
                variants={formVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                role="form"
                aria-labelledby="add-event-form-title">
                <h3 className="text-lg font-medium mb-2">RSVP for {event?.eventName}</h3>
                <form onSubmit={handleSubmit(onSubmit)} className="border p-4 mb-4 rounded-lg">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium">
                                Full Name
                            </label>
                            <input
                                id="name"
                                {...register('fullName', { required: 'Name is required' })}
                                className="input input-bordered w-full bg-white text-[#6A0DAD]"
                                placeholder="Enter your Full Name"
                                aria-invalid={errors.fullName ? 'true' : 'false'}
                            />
                            {errors.fullName && (
                                <p className="text-red-500 text-sm" role="alert">
                                    {errors.fullName.message}
                                </p>
                            )}
                        </div>
                        <div>
                            <label htmlFor="photo" className="block text-sm font-medium">
                                Email Address
                            </label>
                            <input
                                id="email"
                                {...register('emailAddress', { required: 'email is required' })}
                                className="input input-bordered w-full bg-white text-[#6A0DAD]"
                                placeholder="Enter your Email Address"
                                aria-invalid={errors.emailAddress ? 'true' : 'false'}
                            />
                            {errors.emailAddress && (
                                <p className="text-red-500 text-sm" role="alert">
                                    {errors.emailAddress.message}
                                </p>
                            )}
                        </div>
                        <div className="md:col-span-2">
                            <label htmlFor="numberofAttendees" className="block text-sm font-medium">
                                Number of Attendees
                            </label>
                            <input
                                id="numberofAttendees"
                                {...register('numberofAttendees', { required: 'Number of Attendees is required' })}
                                className="input input-bordered w-full bg-white text-[#6A0DAD]"
                                placeholder="How many seats are you reserving?"
                                aria-invalid={errors.numberofAttendees ? 'true' : 'false'}
                            />
                            {errors.numberofAttendees && (
                                <p className="text-red-500 text-sm" role="alert">
                                    {errors.numberofAttendees.message}
                                </p>
                            )}
                        </div>
                    </div>
                    <button
                        type="submit"
                        className="btn bg-[#6A0DAD] text-white hover:bg-[#FFD700] hover:text-[#6A0DAD] mt-4"
                        aria-label="Submit RSVP"
                    >
                        RSVP
                    </button>
                </form>
                {qrCodeUrl && (
                    <div className="mt-6 text-center">
                        <h4 className="text-md font-medium mb-2">Your RSVP QR Code</h4>
                        <img src={qrCodeUrl} alt="RSVP QR Code" className="mx-auto mb-4" />
                        <button
                            onClick={downloadPDF}
                            className="btn bg-[#6A0DAD] text-white hover:bg-[#FFD700] hover:text-[#6A0DAD]"
                            aria-label="Download QR Code as PDF"
                        >
                            Download QR Code PDF
                        </button>
                    </div>
                )}
            </motion.div>
        </div>
    )
}

export default GuestRsvp