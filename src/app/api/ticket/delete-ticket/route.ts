import { db } from "@/lib/firebase";
import { DeleteTicketRequest } from "@/lib/types";
import { deleteDoc, doc, getDoc } from "firebase/firestore";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { ticketId }: DeleteTicketRequest = await request.json();

    // Validate input
    if (!ticketId) {
      console.error('Invalid ticket ID received:', ticketId);
      return NextResponse.json({ error: 'Invalid ticket ID' }, { status: 400 });
    }

    // Reference to the ticket document in Firestore
    const ticketRef = doc(db, 'ticket', ticketId);

    // Check if the document exists
    const ticketSnap = await getDoc(ticketRef);
    if (!ticketSnap.exists()) {
      console.warn(`Ticket with ID ${ticketId} not found`);
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }

    // Delete ticket from Firestore
    await deleteDoc(ticketRef);
    console.log(`Ticket with ID ${ticketId} deleted successfully`);

    return NextResponse.json({ message: 'Ticket deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting ticket:', error);
    return NextResponse.json({ error: 'Failed to delete ticket' }, { status: 500 });
  }
}