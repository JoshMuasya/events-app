
"use client";

import { EventDetail, SelectedTicket, TicketListProps, TicketType } from '@/lib/types';
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useParams } from 'next/navigation';
import QRCode from 'react-qr-code';

const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
    exit: { opacity: 0, y: -30, transition: { duration: 0.2 } },
};

// Payment Form Component
const PaymentForm: React.FC<{
    clientSecret: string;
    selectedTickets: SelectedTicket[];
    onSuccess: (purchasedTickets: SelectedTicket[]) => void;
    onCancel: () => void;
}> = ({ clientSecret, selectedTickets, onSuccess, onCancel }) => {
    const [paymentLoading, setPaymentLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [cardNumber, setCardNumber] = useState('');
    const [expMonth, setExpMonth] = useState('');
    const [expYear, setExpYear] = useState('');
    const [cvc, setCvc] = useState('');

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setPaymentLoading(true);
        try {
            const response = await fetch('/api/confirm-payment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    clientSecret,
                    paymentMethod: {
                        card: {
                            number: cardNumber,
                            exp_month: parseInt(expMonth),
                            exp_year: parseInt(expYear),
                            cvc,
                        },
                    },
                }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const { error, paymentIntent } = await response.json();

            if (error) {
                setError(error.message || 'Payment failed');
                toast.error(error.message || 'Payment failed');
            } else if (paymentIntent?.status === 'succeeded') {
                toast.success('Payment successful!');
                onSuccess(selectedTickets);
            }
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : 'Unknown payment error';
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setPaymentLoading(false);
        }
    };

    return (
        <motion.div
            className="bg-[rgba(255,215,0,0.2)] backdrop-blur-md rounded-lg p-6 shadow-[0_4px_12px_rgba(106,13,173,0.3)] mt-6"
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            exit="exit"
        >
            <h2 className="text-lg font-semibold mb-4">Enter Payment Details</h2>
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    placeholder="Card Number (e.g., 4242424242424242)"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    className="input input-bordered w-full mb-2 bg-white text-[#6A0DAD]"
                />
                <div className="flex gap-2">
                    <input
                        type="text"
                        placeholder="MM"
                        value={expMonth}
                        onChange={(e) => setExpMonth(e.target.value)}
                        className="input input-bordered w-full mb-2 bg-white text-[#6A0DAD]"
                    />
                    <input
                        type="text"
                        placeholder="YYYY"
                        value={expYear}
                        onChange={(e) => setExpYear(e.target.value)}
                        className="input input-bordered w-full mb-2 bg-white text-[#6A0DAD]"
                    />
                    <input
                        type="text"
                        placeholder="CVC"
                        value={cvc}
                        onChange={(e) => setCvc(e.target.value)}
                        className="input input-bordered w-full mb-2 bg-white text-[#6A0DAD]"
                    />
                </div>
                {error && <p className="text-red-500 mt-2">{error}</p>}
                <div className="flex gap-4 mt-4">
                    <button
                        type="submit"
                        disabled={paymentLoading}
                        className="btn bg-[#6A0DAD] text-white hover:bg-[#FFD700] hover:text-[#6A0DAD]"
                    >
                        {paymentLoading ? 'Processing...' : 'Confirm Payment'}
                    </button>
                    <button
                        type="button"
                        onClick={onCancel}
                        className="btn bg-gray-300 text-[#6A0DAD] hover:bg-gray-400"
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </motion.div>
    );
};

const TicketList: React.FC<TicketListProps> = ({ event }) => {
    const params = useParams();
    const eventId = params.eventId as string;
    const [tickets, setTickets] = useState<TicketType[]>([]);
    const [selectedTickets, setSelectedTickets] = useState<SelectedTicket[]>([]);
    const [purchasedTickets, setPurchasedTickets] = useState<SelectedTicket[]>([]);
    const [loading, setLoading] = useState(false);
    const [clientSecret, setClientSecret] = useState<string | null>(null);

    const fetchTicket = async () => {
        try {
            setLoading(true);
            const response = await fetch(`/api/ticket?eventId=${eventId}`);
            if (!response.ok) {
                throw new Error(`Failed to fetch tickets: ${response.status}`);
            }
            const data = await response.json();
            setTickets(data);
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            console.error('Error fetching tickets:', errorMessage);
            toast.error('Failed to load tickets');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (eventId) {
            fetchTicket();
        }
    }, [eventId]);

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

    // Update ticket availability
    const updateTicketAvailability = async (purchasedTickets: SelectedTicket[]) => {
        try {
            const response = await fetch('/api/update-ticket-availability', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    eventId,
                    tickets: purchasedTickets.map((ticket) => ({
                        id: ticket.id,
                        quantity: ticket.quantity,
                    })),
                }),
            });

            if (!response.ok) {
                throw new Error(`Failed to update ticket availability: ${response.status}`);
            }

            // Update local ticket state
            setTickets((prev) =>
                prev.map((ticket) => {
                    const purchased = purchasedTickets.find((t) => t.id === ticket.id);
                    if (purchased) {
                        return { ...ticket, availability: ticket.availability - purchased.quantity };
                    }
                    return ticket;
                })
            );
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            console.error('Error updating ticket availability:', errorMessage);
            toast.error('Failed to update ticket availability');
        }
    };

    // Handle purchase
    const handlePurchase = async () => {
        if (selectedTickets.length === 0) {
            toast.error('No tickets selected');
            return;
        }

        setLoading(true);
        try {
            const response = await fetch('/api/create-payment-intent', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ticketIds: selectedTickets.map((ticket) => ticket.id),
                    amount: total * 100, // Convert to cents
                }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const { clientSecret } = await response.json();
            setClientSecret(clientSecret);
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            toast.error(`Payment initiation failed: ${errorMessage}`);
        } finally {
            setLoading(false);
        }
    };

    // Handle payment success
    const handlePaymentSuccess = async (purchasedTickets: SelectedTicket[]) => {
        await updateTicketAvailability(purchasedTickets); // Update availability
        setPurchasedTickets(purchasedTickets); // Store purchased tickets
        setSelectedTickets([]); // Clear selected tickets
        setClientSecret(null); // Hide payment form
    };

    // Handle payment cancellation
    const handlePaymentCancel = () => {
        setClientSecret(null); // Hide payment form
    };

    // Generate QR code data URL (async)
    const generateQRCodeDataURL = async (ticketId: string): Promise<string> => {
        return new Promise((resolve) => {
            const container = document.createElement('div');
            document.body.appendChild(container);

            import('react-dom/client').then(({ createRoot }) => {
                const root = createRoot(container);
                root.render(<QRCode value={ticketId} size={150} />);

                // Wait for rendering to complete
                setTimeout(() => {
                    const svg = container.querySelector('svg');
                    if (!svg) {
                        document.body.removeChild(container);
                        root.unmount();
                        resolve('');
                        return;
                    }

                    const svgData = new XMLSerializer().serializeToString(svg);
                    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
                    const url = URL.createObjectURL(svgBlob);

                    const canvas = document.createElement('canvas');
                    canvas.width = 150;
                    canvas.height = 150;
                    const ctx = canvas.getContext('2d');
                    const img = new Image();

                    img.onload = () => {
                        ctx?.drawImage(img, 0, 0);
                        const dataURL = canvas.toDataURL('image/png').split(',')[1];
                        URL.revokeObjectURL(url);
                        document.body.removeChild(container);
                        root.unmount();
                        resolve(dataURL);
                    };

                    img.onerror = () => {
                        document.body.removeChild(container);
                        root.unmount();
                        resolve('');
                    };

                    img.src = url;
                }, 0);
            }).catch((error) => {
                console.error('Failed to import react-dom/client:', error);
                document.body.removeChild(container);
                resolve('');
            });
        });
    };

    // Download ticket as HTML
    const downloadTicket = async (ticket: SelectedTicket) => {
        const ticketId = `${eventId}-${ticket.id}-${Date.now()}`; // Unique ticket ID
        const qrCodeData = await generateQRCodeDataURL(ticketId); // Wait for QR code data

        if (!qrCodeData) {
            toast.error('Failed to generate QR code');
            return;
        }

        const htmlContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Ticket for ${event.eventName}</title>
                <style>
                    body { font-family: Arial, sans-serif; text-align: center; padding: 20px; }
                    .ticket { border: 2px solid #6A0DAD; padding: 20px; max-width: 400px; margin: auto; }
                    .qr-code { margin: 20px 0; }
                    h1 { color: #6A0DAD; }
                    p { color: #333; }
                </style>
            </head>
            <body>
                <div class="ticket">
                    <h1>${event.eventName}</h1>
                    <p>Ticket Type: ${ticket.type}</p>
                    <p>Quantity: ${ticket.quantity}</p>
                    <p>Price: KSh ${(ticket.price * ticket.quantity).toFixed(2)}</p>
                    <p>Date: ${event.date}</p>
                    <p>Location: ${event.location}</p>
                    <div class="qr-code">
                        <img src="data:image/png;base64,${qrCodeData}" alt="QR Code" />
                    </div>
                    <p>Ticket ID: ${ticketId}</p>
                    <p>Present this ticket at the gate for check-in.</p>
                </div>
            </body>
            </html>
        `;
        const blob = new Blob([htmlContent], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ticket-${ticketId}.html`;
        a.click();
        URL.revokeObjectURL(url);
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
                {loading ? (
                    <p className="col-span-full text-center text-gray-500">Loading tickets...</p>
                ) : tickets.length === 0 ? (
                    <p className="col-span-full text-center text-gray-500">
                        No tickets available for this event.
                    </p>
                ) : (
                    tickets.map((ticket) => (
                        <motion.div
                            key={ticket.id}
                            className="bg-gradient-to-br from-[#F7E7CE] via-[#FFD700] to-[#E5C07B] text-[#6A0DAD] rounded-lg p-6 shadow-[0_4px_12px_rgba(106,13,173,0.15)]"
                            variants={fadeInUp}
                            whileHover={{ scale: 1.02 }}
                        >
                            <h2 className="text-lg font-semibold">{ticket.type}</h2>
                            <p className="text-lg font-bold mt-2">KSh {ticket.price.toFixed(2)}</p>
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
                            </div>
                        </motion.div>
                    ))
                )}
            </motion.div>

            {/* Checkout Summary or Payment Form */}
            {clientSecret ? (
                <PaymentForm
                    clientSecret={clientSecret}
                    selectedTickets={selectedTickets}
                    onSuccess={handlePaymentSuccess}
                    onCancel={handlePaymentCancel}
                />
            ) : purchasedTickets.length > 0 ? (
                <motion.div
                    className="bg-[rgba(255,215,0,0.2)] backdrop-blur-md rounded-lg p-6 shadow-[0_4px_12px_rgba(106,13,173,0.3)] mt-6 sticky top-4 max-w-md mx-auto md:ml-auto"
                    variants={fadeInUp}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                >
                    <h2 className="text-lg font-semibold mb-4">Your Purchased Tickets</h2>
                    {purchasedTickets.map((ticket) => (
                        <div key={ticket.id} className="mb-4">
                            <div className="flex justify-between mb-2">
                                <span>
                                    {ticket.type} x {ticket.quantity}
                                </span>
                                <span>KSh {(ticket.price * ticket.quantity).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-center" style={{ background: 'white', padding: '16px' }}>
                                <QRCode value={`${eventId}-${ticket.id}-${Date.now()}`} size={150} />
                            </div>
                            <button
                                onClick={() => downloadTicket(ticket)}
                                className="btn bg-[#6A0DAD] text-white hover:bg-[#FFD700] hover:text-[#6A0DAD] w-full mt-2"
                            >
                                Download Ticket
                            </button>
                        </div>
                    ))}
                    <button
                        onClick={() => setPurchasedTickets([])} // Fixed: Changed setPurchasedTickets to onClick
                        className="btn bg-gray-300 text-[#6A0DAD] hover:bg-gray-400 w-full mt-4"
                    >
                        Back to Ticket Selection
                    </button>
                </motion.div>
            ) : selectedTickets.length > 0 ? (
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
                            <span>KSh {(ticket.price * ticket.quantity).toFixed(2)}</span>
                        </div>
                    ))}
                    <div className="flex justify-between font-bold mt-4">
                        <span>Total</span>
                        <span>KSh {total.toFixed(2)}</span>
                    </div>
                    <button
                        onClick={handlePurchase}
                        disabled={total === 0 || loading}
                        className="btn bg-[#6A0DAD] text-white hover:bg-[#FFD700] hover:text-[#6A0DAD] w-full mt-4"
                    >
                        {loading ? 'Processing...' : 'Proceed to Payment'}
                    </button>
                </motion.div>
            ) : null}
        </div>
    );
};

export default TicketList;