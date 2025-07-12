import { db } from "@/lib/firebase";
import { addDoc, collection, doc, setDoc, Timestamp } from "firebase/firestore";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const {
            eventId,
            fullName,
            emailAddress,
            numberofAttendees
        } = body;

        const rsvpData = {
            eventId,
            fullName,
            emailAddress,
            numberofAttendees,
            createdAt: Timestamp.now()
        }

        await addDoc(collection(db, "rsvp"), rsvpData);

        return NextResponse.json({
            message: "RSVP Successful"
        }, { status: 201 })
    } catch (error: any) {
        console.error("RSVP error:", error.message);
        return NextResponse.json({ error: error.message || "Failed to RSVP" }, { status: 500 });
    }
}