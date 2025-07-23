import { db } from "@/lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { eventId } = await req.json();

    const purchasesQuery = query(
      collection(db, "ticket purchases"),
      where("eventId", "==", eventId),
      where("status", "==", "completed")
    );

    const snapshot = await getDocs(purchasesQuery);
    const purchases = snapshot.docs.map(doc => doc.data() as any);

    const ticketStats: Record<string, { sold: number; revenue: number }> = {};

    purchases.forEach(purchase => {
      if (Array.isArray(purchase.tickets)) {
        purchase.tickets.forEach((ticket: { type: string; quantity: number; price: number; }) => {
          const type = ticket.type || "Unknown";
          const quantity = ticket.quantity || 0;
          const price = ticket.price || 0;

          if (!ticketStats[type]) {
            ticketStats[type] = { sold: 0, revenue: 0 };
          }

          ticketStats[type].sold += quantity;
          ticketStats[type].revenue += price * quantity;
        });
      }
    });

    // Convert to array format for the chart
    const chartData = Object.entries(ticketStats).map(([type, stats]) => ({
      type,
      sold: stats.sold,
      revenue: stats.revenue,
    }));

    return NextResponse.json({ chartData });
  } catch (error) {
    console.error("Analytics API Error:", error);
    return new NextResponse("Failed to fetch analytics", { status: 500 });
  }
}
