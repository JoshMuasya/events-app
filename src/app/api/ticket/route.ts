import { db } from "@/lib/firebase";
import { collection, doc, setDoc } from "firebase/firestore";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { 
            eventId,  
            type,
            price,
            availability,
            perks,
            status
        } = body;

        const ticketRef = doc(collection(db, "ticket"));
        const ticketId = ticketRef.id;

        if (!type || !price || !availability || !perks || !status) {
            return NextResponse.json({ error: "Missing Fields" }, { status: 400 })
        }

        await setDoc(ticketRef, {
            ticketId,
            eventId,  
            type,
            price,
            availability,
            perks,
            status,
            createdAt: new Date().toISOString()
        })

        return NextResponse.json({ message: "Ticket created successfully", ticketId }, { status: 201 })
    } catch (error: any) {
        console.error("Ticket creation error:", error.message);
        return NextResponse.json({ error: error.message || "Failed to create Ticket" }, { status: 500 })
    }
}