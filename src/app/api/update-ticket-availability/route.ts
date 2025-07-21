import { db } from "@/lib/firebase";
import { SelectedTicket, Ticket } from "@/lib/types";
import { doc, increment, updateDoc } from "firebase/firestore";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try{
        const body = await request.json();
        const { eventId, tickets }: { eventId: string; tickets: Ticket[] } = body;

        if(!eventId || !Array.isArray(tickets)) {
            return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
        }

        for (const ticket of tickets) {
            const { id, quantity } = ticket

            const ticketRef = doc(db, 'ticket', id);

            await updateDoc(ticketRef, {
                availability: increment(-quantity)
            })
        }
        
        return NextResponse.json({ success: true });
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : "Failed to confirm payment";
        return NextResponse.json(
            { error: errorMessage },
            { status: 500 }
        )
    }
}