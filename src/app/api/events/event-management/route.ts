import { db } from "@/lib/firebase";
import { collection, doc, getDocs, serverTimestamp, setDoc } from "firebase/firestore";
import { NextResponse } from "next/server";

export async function GET() {
    const snapshot = await getDocs(collection(db, 'events'));
    const events = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    }))

    return NextResponse.json(events)
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { eventName, image, createdBy, assignedStaff, ticketSales, totalRevenue, isInvitesOnly, maxAttendies, status, location, isVirtual, date } = body;

        const eventId = `${eventName.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}`;

        console.log("Event ID:", eventId);

        if (!eventName || !createdBy || !status || !location || !date) {
            return NextResponse.json({
                error: "Missing Fields"
            }, { status: 400 })
        }

        await setDoc(doc(db, "events", eventId), {
            eventId: eventId,
            eventName,
            image,
            createdBy,
            assignedStaff,
            ticketSales,
            totalRevenue,
            isInvitesOnly,
            maxAttendies,
            status,
            location,
            isVirtual,
            date,
            createdAt: serverTimestamp()
        })

        return NextResponse.json({
            message: "Event Data received"
        }, { status: 201 })
    } catch (error: any) {
        console.error("Event creation error:", error.message);
        return NextResponse.json({ error: error.message || "Failed to create event" }, { status: 500 });
    }
}