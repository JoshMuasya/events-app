"use client";

import { BuyerDetails, SelectedTicket } from "@/lib/types";
import { motion } from "framer-motion";
import { useParams } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";

const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
    exit: { opacity: 0, y: -30, transition: { duration: 0.2 } },
};

// Payment Form Component
const PaymentForm: React.FC<{
    clientSecret: string;
    selectedTickets: SelectedTicket[];
    eventId: string;
    onSuccess: (purchasedTickets: SelectedTicket[], buyerDetails: BuyerDetails) => void;
    onCancel: () => void;
}> = ({ clientSecret, selectedTickets, onSuccess, onCancel }) => {
    const [paymentLoading, setPaymentLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [cardNumber, setCardNumber] = useState('');
    const [expMonth, setExpMonth] = useState('');
    const [expYear, setExpYear] = useState('');
    const [cvc, setCvc] = useState('');
    const [buyerDetails, setBuyerDetails] = useState({
        name: '',
        email: '',
        phone: '',
    });

    // Call useParams at the top level of the component
    const { eventId } = useParams();

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        if (!buyerDetails.name || !buyerDetails.email || !buyerDetails.phone) {
            setError('Please fill in all buyer details');
            toast.error('Please fill in all buyer details');
            return;
        }
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
                    buyerDetails,
                    tickets: selectedTickets,
                    eventId, // Use the eventId from useParams
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
                onSuccess(selectedTickets, buyerDetails);
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
            <h2 className="text-lg font-semibold mb-4">Enter Buyer and Payment Details</h2>
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    placeholder="Full Name"
                    value={buyerDetails.name}
                    onChange={(e) => setBuyerDetails({ ...buyerDetails, name: e.target.value })}
                    className="input input-bordered w-full mb-2 bg-white text-[#6A0DAD]"
                />
                <input
                    type="email"
                    placeholder="Email Address"
                    value={buyerDetails.email}
                    onChange={(e) => setBuyerDetails({ ...buyerDetails, email: e.target.value })}
                    className="input input-bordered w-full mb-2 bg-white text-[#6A0DAD]"
                />
                <input
                    type="tel"
                    placeholder="Phone Number"
                    value={buyerDetails.phone}
                    onChange={(e) => setBuyerDetails({ ...buyerDetails, phone: e.target.value })}
                    className="input input-bordered w-full mb-2 bg-white text-[#6A0DAD]"
                />
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

export default PaymentForm;