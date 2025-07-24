import { db } from "@/lib/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { searchTerm } = await req.json();
    const trimmed = searchTerm.toLowerCase();

    const snapshot = await getDocs(collection(db, "ticket purchases"));
    const purchases = snapshot.docs
      .map(doc => {
        const data = doc.data() as any;
        const purchaseId = doc.id;

        // Try to find a ticket that matches the search
        const matchingTicket = data.tickets?.find((ticket: any) =>
          ticket.buyerDetails &&
          (
            ticket.buyerDetails.name?.toLowerCase().includes(trimmed) ||
            ticket.buyerDetails.phone?.includes(trimmed)
          )
        );

        if (!matchingTicket) return null;

        return {
          ...data,
          purchaseId,
          buyerDetails: matchingTicket.buyerDetails,
        };
      })
      .filter(Boolean);

    console.log("Purchases", purchases);


    return NextResponse.json({ purchases });
  } catch (err) {
    console.error("Search error:", err);
    return new NextResponse("Error Searching Tickets", { status: 500 });
  }
}
