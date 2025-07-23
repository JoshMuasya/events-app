import { db } from "@/lib/firebase";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { purchaseId } = await req.json();

    // 1. Get the purchase document
    const purchaseRef = doc(db, "ticket purchases", purchaseId);
    const purchaseSnap = await getDoc(purchaseRef);

    if (!purchaseSnap.exists()) {
      return new NextResponse("Purchase not found", { status: 404 });
    }

    const purchaseData = purchaseSnap.data();
    const tickets = purchaseData.tickets || [];

    // 2. Update the availability in ticket collection
    const updatePromises = tickets.map(async (ticket: any) => {
      const ticketRef = doc(db, "ticket", ticket.id);
      const ticketSnap = await getDoc(ticketRef);

      if (!ticketSnap.exists()) return;

      const ticketData = ticketSnap.data();
      const currentAvailability = ticketData.availability || 0;

      await updateDoc(ticketRef, {
        availability: currentAvailability + (ticket.quantity || 0),
      });
    });

    // 3. Update the status of the ticketPurchase
    await Promise.all(updatePromises);
    await updateDoc(purchaseRef, { status: "refunded" });

    return new NextResponse("Refund successful", { status: 200 });
  } catch (err) {
    console.error("Refund error:", err);
    return new NextResponse("Refund failed", { status: 500 });
  }
}
