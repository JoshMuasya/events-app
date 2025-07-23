"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { motion } from "framer-motion";

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

  const handleRefund = async (purchaseId: string) => {
    try {
      const res = await fetch("/api/ticket/refund", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ purchaseId }),
      });

      if (!res.ok) throw new Error("Refund failed");

      alert("Refund successful!");
      setResults(results.map(p => p.purchaseId === purchaseId ? { ...p, status: "refunded" } : p));
    } catch (err) {
      console.error(err);
      alert("Failed to refund");
    }
  };

  return (
    <motion.div
      className="max-w-3xl mx-auto bg-white dark:bg-black p-6 rounded-lg shadow-lg my-3 md:my-5"
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
          <Button onClick={handleSearch}>Search</Button>
        </div>
      </CardHeader>

      <CardContent className="mt-4 space-y-4">
        {loading && <p className="text-gray-500">Searching...</p>}
        {!loading && results.length === 0 && <p>No results found.</p>}

        {results.map(purchase => (
          <Card key={purchase.purchaseId} className="bg-[#f8f0ff] dark:bg-[#1e1e2f] p-4">
            <p><strong>Name:</strong> {purchase.buyerDetails.name}</p>
            <p><strong>Phone:</strong> {purchase.buyerDetails.phone}</p>
            <p><strong>Email:</strong> {purchase.buyerDetails.email}</p>
            <p><strong>Status:</strong> <span className={purchase.status === "refunded" ? "text-red-600" : "text-green-600"}>{purchase.status}</span></p>
            <p className="mt-2 font-semibold">Tickets:</p>
            <ul className="ml-4 list-disc">
              {purchase.tickets.map((ticket, i) => (
                <li key={i}>
                  {ticket.type} - {ticket.quantity} × ${ticket.price}
                </li>
              ))}
            </ul>

            {purchase.status !== "refunded" && (
              <Button
                className="mt-3 bg-red-600 hover:bg-red-700 text-white"
                onClick={() => handleRefund(purchase.purchaseId)}
              >
                Refund Purchase
              </Button>
            )}
          </Card>
        ))}
      </CardContent>
    </motion.div>
  );
};

export default SearchTickets;
