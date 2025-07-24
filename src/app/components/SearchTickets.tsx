"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import toast from "react-hot-toast";
import { CiSearch } from "react-icons/ci";

interface TicketPurchase {
  purchaseId: string;
  eventId: string;
  status: string;
  buyerDetails: {
    name: string;
    phone: string;
    email: string;
  };
  purchaseDate: string;
  tickets: {
    id: string;
    type: string;
    quantity: number;
    price: number;
  }[];
}

const SearchTickets = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState<TicketPurchase[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedRefund, setSelectedRefund] = useState<{
    purchaseId: string | null;
    ticketId: string | null;
    quantity: number;
  }>({ purchaseId: null, ticketId: null, quantity: 1 });

  const buttonVariants = {
    hover: {
      scale: 1.05,
      boxShadow: "0 4px 12px rgba(106, 13, 173, 0.5)",
      transition: { duration: 0.2 },
    },
    tap: { scale: 0.95, transition: { duration: 0.1 } },
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;
    setLoading(true);

    try {
      const res = await fetch("/api/ticket/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ searchTerm }),
      });

      if (!res.ok) throw new Error("Failed to search tickets");

      const data = await res.json();
      setResults(data.purchases);
    } catch (err) {
      console.error("Search error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleRefund = async (purchaseId: string, ticketId: string, quantity: number) => {
    try {
      const res = await fetch("/api/ticket/refunds", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ purchaseId, ticketId, quantity }),
      });

      if (!res.ok) throw new Error("Refund failed");

      toast.success(`Successfully refunded ${quantity} ticket${quantity > 1 ? 's' : ''}!`);
      setResults(results.map(p => {
        if (p.purchaseId === purchaseId) {
          const updatedTickets = p.tickets.map(t => {
            if (t.id === ticketId) {
              const newQuantity = t.quantity - quantity;
              return newQuantity > 0 ? { ...t, quantity: newQuantity } : null;
            }
            return t;
          }).filter((t): t is NonNullable<typeof t> => t !== null);

          return updatedTickets.length > 0
            ? { ...p, tickets: updatedTickets }
            : { ...p, status: "refunded" };
        }
        return p;
      }));
      setSelectedRefund({ purchaseId: null, ticketId: null, quantity: 1 });
    } catch (err) {
      console.error(err);
      toast.error("Failed to refund");
    }
  };

  return (
    <motion.div
      className="bg-[rgba(255,215,0,0.2)] backdrop-blur-md rounded-lg p-6 shadow-[0_4px_12px_rgba(106,13,173,0.3)] text-[#6A0DAD] max-w-3xl mx-auto my-3 md:my-5"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <CardHeader>
        <h2 className="text-xl font-bold mb-4 text-[#6A0DAD]">Search Ticket Purchases</h2>
        <div className="flex gap-4 items-center">
          <Input
            type="text"
            placeholder="Enter buyer name or phone number"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <motion.button
            onClick={handleSearch}
            className="bg-[#6A0DAD] text-[#FFD700] px-4 py-2 rounded-lg flex items-center gap-2"
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
          >
            <CiSearch />
            Search
          </motion.button>
        </div>
      </CardHeader>

      <CardContent className="mt-4 space-y-4">
        {loading && <p className="text-gray-500">Searching...</p>}
        {!loading && results.length === 0 && <p>No results found.</p>}

        {results.map(purchase => (
          <Card key={purchase.purchaseId} className="bg-[rgba(255,215,0,0.2)] backdrop-blur-md rounded-lg p-6 shadow-[0_4px_12px_rgba(106,13,173,0.3)] text-[#6A0DAD] max-w-3xl mx-auto">
            <p><strong>Name:</strong> {purchase.buyerDetails?.name}</p>
            <p><strong>Phone:</strong> {purchase.buyerDetails?.phone}</p>
            <p><strong>Email:</strong> {purchase.buyerDetails?.email}</p>
            <p><strong>Status:</strong> <span className={purchase?.status === "refunded" ? "text-red-600" : "text-green-600"}>{purchase.status}</span></p>
            <p className="mt-2 font-semibold">Tickets:</p>
            <ul className="ml-4 list-disc">
              {purchase.tickets.map((ticket, i) => (
                <li key={i}>
                  {ticket.type} - {ticket.quantity} × ${ticket.price}
                </li>
              ))}
            </ul>

            {purchase.status !== "refunded" && purchase.tickets.length > 0 && (
              <div className="mt-3 space-y-2">
                <Label>Refund Tickets</Label>
                <div className="flex gap-2 items-center">
                  <Select
                    onValueChange={(value) => setSelectedRefund({
                      ...selectedRefund,
                      purchaseId: purchase.purchaseId,
                      ticketId: value,
                    })}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Select ticket type" />
                    </SelectTrigger>
                    <SelectContent>
                      {purchase.tickets.map((ticket) => (
                        <SelectItem key={ticket.id} value={ticket.id}>
                          {ticket.type} (${ticket.price})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    type="number"
                    min="1"
                    max={purchase.tickets.find(t => t.id === selectedRefund.ticketId)?.quantity || 1}
                    value={selectedRefund.quantity}
                    onChange={(e) => setSelectedRefund({
                      ...selectedRefund,
                      quantity: parseInt(e.target.value) || 1,
                    })}
                    className="w-20"
                    disabled={!selectedRefund.ticketId}
                  />
                  <Button
                    className="bg-red-600 hover:bg-red-700 text-white"
                    onClick={() => selectedRefund.ticketId && handleRefund(purchase.purchaseId, selectedRefund.ticketId, selectedRefund.quantity)}
                    disabled={!selectedRefund.ticketId}
                  >
                    Refund
                  </Button>
                </div>
              </div>
            )}
          </Card>
        ))}
      </CardContent>
    </motion.div>
  );
};

export default SearchTickets;