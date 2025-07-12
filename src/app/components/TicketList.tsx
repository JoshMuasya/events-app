"use client"

import { EventDetail, SelectedTicket, Ticket, TicketListProps } from '@/lib/types';
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
    exit: { opacity: 0, y: -30, transition: { duration: 0.2 } },
};

const TicketList: React.FC<TicketListProps> = () => {
    const [event, setEvent] = useState<EventDetail>()
    const [tickets, setTickets] = useState<Ticket[]>([])
    const [selectedTickets, setSelectedTickets] = useState<SelectedTicket[]>([]);

    // Handle quantity change
    const handleQuantityChange = (ticketId: string, quantity: number) => {
        setSelectedTickets((prev) => {
            const existing = prev.find((t) => t.id === ticketId);
            const ticket = tickets.find((t) => t.id === ticketId);
            if (!ticket) return prev;

            const maxQuantity = ticket.availability;
            const newQuantity = Math.max(0, Math.min(quantity, maxQuantity));

            if (newQuantity === 0) {
                return prev.filter((t) => t.id !== ticketId);
            }

            if (existing) {
                return prev.map((t) =>
                    t.id === ticketId ? { ...t, quantity: newQuantity } : t
                );
            }

            return [
                ...prev,
                {
                    id: ticketId,
                    type: ticket.type,
                    price: ticket.price,
                    quantity: newQuantity,
                },
            ];
        });
    };

    // Calculate total
    const total = selectedTickets.reduce(
        (sum, ticket) => sum + ticket.price * ticket.quantity,
        0
    );

    // Handle purchase
    const handlePurchase = async () => {
        if (selectedTickets.length === 0) {
            toast("No Tickets selected");
            return;
        }

        try {
            // For simplicity, create a single PaymentIntent for the total
            const response = await fetch("/api/create-payment-intent", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ticketId: selectedTickets[0].id, // Use first ticket ID for metadata
                    amount: total * 100, // Convert to cents
                }),
            });

            const { clientSecret } = await response.json()
        } catch (error) {
            toast("Failed");
        }
    };

    return (
        <div className="container mx-auto p-4 text-[#6A0DAD] space-y-6">
            {/* Event Summary */}
            <motion.div
                className="bg-[rgba(255,215,0,0.2)] backdrop-blur-md rounded-lg p-6 shadow-[0_4px_12px_rgba(106,13,173,0.3)]"
                variants={fadeInUp}
                initial="hidden"
                animate="visible"
                exit="exit"
            >
                <h1 className="text-2xl font-bold mb-2">{event?.eventName}</h1>
                <p className="text-gray-600">{event?.eventDesc}</p>
                <p className="mt-2">Date: {event?.date}</p>
                <p>Location: {event?.location}</p>
            </motion.div>

            {/* Ticket Selection */}
            <motion.div
                className="grid gap-6 md:grid-cols-2"
                variants={fadeInUp}
                initial="hidden"
                animate="visible"
                exit="exit"
            >
                {tickets?.length === 0 ? (
                    <p className="col-span-full text-center text-gray-500">
                        No tickets available for this event.
                    </p>
                ) : (
                    tickets.map((ticket) => (
                        <motion.div
                            key={ticket.id}
                            className="bg-white text-[#6A0DAD] rounded-lg p-6 shadow-[0_4px_12px_rgba(106,13,173,0.15)]"
                            variants={fadeInUp}
                            whileHover={{ scale: 1.02 }}
                        >
                            <h2 className="text-lg font-semibold">{ticket.type}</h2>
                            <p className="text-lg font-bold mt-2">${ticket.price.toFixed(2)}</p>
                            <p className="text-sm text-gray-500">
                                {ticket.availability} tickets left
                            </p>
                            <ul className="list-disc ml-4 text-sm mt-2">
                                {ticket.perks.map((perk) => (
                                    <li key={perk}>{perk}</li>
                                ))}
                            </ul>
                            <div className="mt-4 flex items-center gap-4">
                                <input
                                    type="number"
                                    min="0"
                                    max={ticket.availability}
                                    value={
                                        selectedTickets.find((t) => t.id === ticket.id)?.quantity || 0
                                    }
                                    onChange={(e) =>
                                        handleQuantityChange(ticket.id, parseInt(e.target.value) || 0)
                                    }
                                    className="input input-bordered w-20 bg-white text-[#6A0DAD]"
                                    aria-label={`Quantity for ${ticket.type}`}
                                />
                                <button
                                    onClick={() => handleQuantityChange(ticket.id, 1)}
                                    disabled={ticket.availability === 0}
                                    className="btn bg-[#6A0DAD] text-white hover:bg-[#FFD700] hover:text-[#6A0DAD]"
                                >
                                    Add to Cart
                                </button>
                            </div>
                        </motion.div>
                    ))
                )}
            </motion.div>

            {/* Checkout Summary */}
            {selectedTickets.length > 0 && (
                <motion.div
                    className="bg-[rgba(255,215,0,0.2)] backdrop-blur-md rounded-lg p-6 shadow-[0_4px_12px_rgba(106,13,173,0.3)] mt-6 sticky top-4 max-w-md mx-auto md:ml-auto"
                    variants={fadeInUp}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                >
                    <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
                    {selectedTickets.map((ticket) => (
                        <div key={ticket.id} className="flex justify-between mb-2">
                            <span>
                                {ticket.type} x {ticket.quantity}
                            </span>
                            <span>${(ticket.price * ticket.quantity).toFixed(2)}</span>
                        </div>
                    ))}
                    <div className="flex justify-between font-bold mt-4">
                        <span>Total</span>
                        <span>${total.toFixed(2)}</span>
                    </div>
                    <button
                        onClick={handlePurchase}
                        disabled={total === 0}
                        className="btn bg-[#6A0DAD] text-white hover:bg-[#FFD700] hover:text-[#6A0DAD] w-full mt-4"
                    >
                        Proceed to Payment
                    </button>
                </motion.div>
            )}
        </div>
    );
};

export default TicketList;
