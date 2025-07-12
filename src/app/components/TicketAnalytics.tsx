"use client";

import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { CardHeader, CardContent } from "@/components/ui/card";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { motion } from "framer-motion";

interface TicketAnalyticsProps {
  eventId: string;
}

interface AnalyticsData {
  name: string;
  value: number;
}

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const TicketAnalytics: React.FC<TicketAnalyticsProps> = ({ eventId }) => {
  const [data, setData] = useState<AnalyticsData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const ticketsQuery = query(collection(db, "tickets"), where("eventId", "==", eventId));
        const snapshot = await getDocs(ticketsQuery);
        const tickets = snapshot.docs.map(doc => doc.data() as any);

        const ticketsSold = tickets.reduce((sum, ticket) => {
          const sold = (ticket.availability || 0) - (ticket.remaining ?? (ticket?.availability || 0));
          return sum + sold;
        }, 0);

        const totalRevenue = tickets.reduce((sum, ticket) => {
          const sold = (ticket.availability || 0) - (ticket.remaining ?? (ticket?.availability || 0));
          return sum + (ticket.price || 0) * sold;
        }, 0);

        setData([
          { name: "Tickets Sold", value: ticketsSold },
          { name: "Total Revenue ($)", value: totalRevenue },
        ]);
      } catch (error) {
        console.error("Error loading analytics:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [eventId]);

  return (
    <motion.div
      variants={fadeInUp}
      initial="hidden"
      animate="visible"
      className="bg-[rgba(255,215,0,0.2)] backdrop-blur-md rounded-lg p-6 shadow-[0_4px_12px_rgba(106,13,173,0.3)] text-[#6A0DAD] max-w-3xl mx-auto"
    >
      <CardHeader className="p-0 mb-4">
        <h2 className="text-xl font-bold">Ticket Analytics</h2>
      </CardHeader>
      <CardContent className="p-0">
        {loading ? (
          <p className="text-center text-gray-500">Loading analytics...</p>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data} margin={{ top: 20, right: 30, left: 10, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#6A0DAD" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </motion.div>
  );
};

export default TicketAnalytics;
