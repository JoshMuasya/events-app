import { storage } from '@/lib/firebase';
import { zodResolver } from '@hookform/resolvers/zod';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import React, { useState } from 'react'
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { z } from 'zod';
import { motion } from "framer-motion";
import { useParams } from 'next/navigation';

const ticketSchema = z.object({
    ticketType: z.string().min(1, "Ticket type is required").max(50, "Ticket type must be 50 characters or less"),
    ticketPrice: z.number().positive("Price must be positive").min(0, "Price cannot be negative"),
    ticketAvailability: z.number().int("Availability must be an integer").min(0, "Availability cannot be negative"),
    ticketPerks: z.array(z.string().min(1, "Perk cannot be empty")).min(1, "At least one perk is required"),
    ticketStatus: z.string().min(1, "Ticket status required")
});

type FormData = z.infer<typeof ticketSchema>;

const AddTicket = () => {
    const params = useParams()
    const eventId = params.eventId as string

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
        resolver: zodResolver(ticketSchema),
    })

    const onSubmit = async (data: FormData) => {
        try {
            const response = await fetch("/api/ticket", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    eventId: eventId,
                    type: data.ticketType,
                    price: data.ticketPrice,
                    availability: data.ticketAvailability,
                    perks: data.ticketPerks,
                    status: data.ticketStatus
                })
            })

            if (!response.ok) {
                const result = await response.json();
                throw new Error(result.error || "Failed to create new Ticket")
            }

            toast.success("Ticket Added Successfully")
            reset();
        } catch (err) {
            toast.error("Failed to Add Ticket")
        }
    };

    return (
        <div className='pt-20'>
            {/* New Ticket */}
            <motion.div
                className="bg-[rgba(255,215,0,0.2)] backdrop-blur-md rounded-lg p-6 mb-6 shadow-[0_4px_12px_rgba(106,13,173,0.3)] text-[#6A0DAD]"
                variants={formVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                role="form"
                aria-labelledby="add-event-form-title">
                <h3 className="text-lg font-medium mb-2">Add New Ticket</h3>
                <form onSubmit={handleSubmit(onSubmit)} className="border p-4 mb-4 rounded-lg">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium">
                                Type of Ticket
                            </label>
                            <input
                                id="ticketType"
                                {...register('ticketType', { required: 'Type of Ticket is required' })}
                                className="input input-bordered w-full bg-white text-[#6A0DAD]"
                                placeholder="Enter Ticket Type"
                                aria-invalid={errors.ticketType ? 'true' : 'false'}
                            />
                            {errors.ticketType && (
                                <p className="text-red-500 text-sm" role="alert">
                                    {errors.ticketType.message}
                                </p>
                            )}
                        </div>

                        <div>
                            <label htmlFor="name" className="block text-sm font-medium">
                                Price of Ticket
                            </label>
                            <input
                                id="ticketPrice"
                                type='number'
                                {...register('ticketPrice', { valueAsNumber: true })}
                                className="input input-bordered w-full bg-white text-[#6A0DAD]"
                                placeholder="Enter Ticket Price"
                                aria-invalid={errors.ticketPrice ? 'true' : 'false'}
                            />
                            {errors.ticketPrice && (
                                <p className="text-red-500 text-sm" role="alert">
                                    {errors.ticketPrice.message}
                                </p>
                            )}
                        </div>

                        <div>
                            <label htmlFor="name" className="block text-sm font-medium">
                                Available Tickets
                            </label>
                            <input
                                id="ticketAvailability"
                                type='number'
                                {...register('ticketAvailability', { valueAsNumber: true })}
                                className="input input-bordered w-full bg-white text-[#6A0DAD]"
                                placeholder="Enter Available Ticket"
                                aria-invalid={errors.ticketAvailability ? 'true' : 'false'}
                            />
                            {errors.ticketAvailability && (
                                <p className="text-red-500 text-sm" role="alert">
                                    {errors.ticketAvailability.message}
                                </p>
                            )}
                        </div>

                        <div className="md:col-span-2">
                            <label htmlFor="description" className="block text-sm font-medium">
                                Ticket Perks
                            </label>
                            <textarea
                                id="ticketPerks"
                                {...register('ticketPerks', {
                                    setValueAs: (value: string) =>
                                        value.split(',').map((perk) => perk.trim()).filter((perk) => perk),
                                })}
                                className="textarea textarea-bordered w-full bg-white text-[#6A0DAD]"
                                placeholder="Enter Ticket Perks"
                                rows={3}
                                aria-invalid={errors.ticketPerks ? 'true' : 'false'}
                            />
                            {errors.ticketPerks && (
                                <p className="text-red-500 text-sm" role="alert">
                                    {errors.ticketPerks.message}
                                </p>
                            )}
                        </div>

                        <div>
                            <label htmlFor="name" className="block text-sm font-medium">
                                Ticket Status
                            </label>
                            <input
                                id="ticketStatus"
                                {...register('ticketStatus', { required: 'Ticket Status is required' })}
                                className="input input-bordered w-full bg-white text-[#6A0DAD]"
                                placeholder="Enter Ticket Status"
                                aria-invalid={errors.ticketStatus ? 'true' : 'false'}
                            />
                            {errors.ticketStatus && (
                                <p className="text-red-500 text-sm" role="alert">
                                    {errors.ticketStatus.message}
                                </p>
                            )}
                        </div>
                    </div>
                    <button
                        type="submit"
                        className="btn bg-[#6A0DAD] text-white hover:bg-[#FFD700] hover:text-[#6A0DAD] mt-4"
                        aria-label="Submit new ticket"
                    >
                        Submit Ticket
                    </button>
                </form>
            </motion.div>
        </div >
    )
}

export default AddTicket
