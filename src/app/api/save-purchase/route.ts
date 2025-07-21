import { db } from "@/lib/firebase";
import { SelectedTicket, BuyerDetails } from "@/lib/types";
import { collection, doc, setDoc } from "firebase/firestore";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { eventId, tickets, purchaseDate }: { 
            eventId: string; 
            tickets: SelectedTicket[]; 
            purchaseDate: string;
        } = body;

        // Validate request body
        if (!eventId || !Array.isArray(tickets) || !purchaseDate || tickets.length === 0) {
            return NextResponse.json({ error: 'Missing or invalid required fields' }, { status: 400 });
        }

        // Validate buyer details for each ticket
        for (const ticket of tickets) {
            if (!ticket.buyerDetails || !ticket.buyerDetails.name || !ticket.buyerDetails.email || !ticket.buyerDetails.phone) {
                return NextResponse.json({ error: 'Missing buyer details for one or more tickets' }, { status: 400 });
            }
            if (!ticket.id || !ticket.quantity || ticket.quantity <= 0) {
                return NextResponse.json({ error: 'Invalid ticket data' }, { status: 400 });
            }
        }

        // Create a new purchase document
        const purchaseRef = doc(collection(db, "ticket purchases"));
        const purchaseId = purchaseRef.id;

        // Save purchase details
        await setDoc(purchaseRef, {
            purchaseId,
            eventId,
            tickets,
            purchaseDate,
            status: 'completed',
            createdAt: new Date().toISOString(),
        });

        return NextResponse.json({ 
            message: 'Purchase saved successfully', 
            purchaseId 
        }, { status: 200 });

    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : "Failed to record purchase";
        console.error('Error saving purchase:', errorMessage);
        return NextResponse.json(
            { error: errorMessage },
            { status: 500 }
        );
    }
}