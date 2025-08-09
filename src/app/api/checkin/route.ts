import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { documentNumber } = body;

        console.log("Doc Number" ,documentNumber);

        if (!documentNumber) {
            return NextResponse.json(
                { success: false, error: 'Document number is required' },
                { status: 400 }
            );
        }

        const docRef = doc(db, "rsvp", documentNumber)

        const docSnap = await getDoc(docRef)

        if (!docSnap.exists()) {
            return NextResponse.json(
                { success: false, error: 'No RSVP found for this QR code' },
                { status: 404 }
            )
        }

        console.log("RSVP", docSnap.id)

        return NextResponse.json({
            success: true,
            rsvp: { id: docSnap.id, ...docSnap.data() }
        });

    } catch (error: any) {
        console.error("Error Adding Registry", error.message);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}