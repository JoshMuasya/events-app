import { db } from "@/lib/firebase";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { purchaseId, ticketId, quantity } = await req.json();

    if (!purchaseId || !ticketId || !quantity || quantity < 1) {
      return new NextResponse("Invalid request parameters", { status: 400 });
    }

    // 1. Get the purchase document
    const purchaseRef = doc(db, "ticket purchases", purchaseId);
    const purchaseSnap = await getDoc(purchaseRef);

    if (!purchaseSnap.exists()) {
      return new NextResponse("Purchase not found", { status: 404 });
    }

    const purchaseData = purchaseSnap.data();
    const tickets = purchaseData.tickets || [];

    // 2. Find the specific ticket to refund
    const targetTicket = tickets.find((t: any) => t.id === ticketId);
    if (!targetTicket) {
      return new NextResponse("Ticket not found in purchase", { status: 404 });
    }

    if (targetTicket.quantity < quantity) {
      return new NextResponse("Requested refund quantity exceeds purchased quantity", { status: 400 });
    }

    // 3. Update ticket availability
    const ticketRef = doc(db, "ticket", ticketId);
    const ticketSnap = await getDoc(ticketRef);

    if (!ticketSnap.exists()) {
      return new NextResponse("Ticket not found", { status: 404 });
    }

    const ticketData = ticketSnap.data();
    const currentAvailability = ticketData.availability || 0;

    await updateDoc(ticketRef, {
      availability: currentAvailability + quantity,
    });

    // 4. Update purchase tickets
    const updatedTickets = tickets
      .map((t: any) => {
        if (t.id === ticketId) {
          const newQuantity = t.quantity - quantity;
          return newQuantity > 0 ? { ...t, quantity: newQuantity } : null;
        }
        return t;
      })
      .filter((t: any) => t !== null);

    // 5. Determine purchase status
    const newStatus = updatedTickets.length === 0 ? "refunded" : purchaseData.status;

    // 6. Update purchase document
    await updateDoc(purchaseRef, {
      tickets: updatedTickets,
      status: newStatus,
    });

    return new NextResponse(
      `Successfully refunded ${quantity} ticket${quantity > 1 ? 's' : ''}`,
      { status: 200 }
    );
  } catch (err) {
    console.error("Refund error:", err);
    return new NextResponse("Refund failed", { status: 500 });
  }
}