import { db } from "@/lib/firebase";
import { UpdateTicketRequest } from "@/lib/types";
import { doc, updateDoc } from "firebase/firestore";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        const { ticketId, updates }: UpdateTicketRequest = await request.json()

        // Validate input
        if (!ticketId) {
            return NextResponse.json({ error: 'Invalid ticket ID' }, { status: 400 });
        }
        if (!updates || typeof updates !== 'object') {
            return NextResponse.json({ error: 'Invalid updates data' }, { status: 400 });
        }

        const ticketRef = doc(db, 'ticket', ticketId);

        await updateDoc(ticketRef, updates);

        return NextResponse.json({ message: 'Ticket updated successfully' }, { status: 200 });

    } catch (error) {
        console.error('Error updating ticket:', error);
        return NextResponse.json({ error: 'Failed to update ticket' }, { status: 500 });
    }
}