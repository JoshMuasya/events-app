import { db } from "@/lib/firebase";
import { collection, doc, getDocs, query, setDoc, where } from "firebase/firestore";
import { NextResponse } from "next/server";

export async function GET(request: { url: string | URL; }) {
    const { searchParams } = new URL(request.url)
    const eventId = searchParams.get('eventId')

    if(!eventId) {
        return NextResponse.json({ error: "eventId is Required" }, { status: 400 })
    }

    const ticketQuery = query(collection(db, 'ticket'), where('eventId', '==', eventId));
    const snapshot = await getDocs(ticketQuery);
    const tickets = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    }))

    return NextResponse.json(tickets)
}

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