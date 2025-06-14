import { db } from "@/lib/firebase"
import { collection, doc, getDocs, serverTimestamp, setDoc } from "firebase/firestore"
import { NextResponse } from "next/server"

export async function GET() {
    const snapshot = await getDocs(collection(db, 'sponsor'))
    const sponsor = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    }))

    return NextResponse.json(sponsor)
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { sponsorName, sponsorLogo } = body;

        const sponsorRef = doc(collection(db, "sponsor"));
        const sponsorId = sponsorRef.id;

        if (!sponsorName || !sponsorLogo) {
            return NextResponse.json({ error: "Missing Fields" }, { status: 400 })
        }

        await setDoc(sponsorRef, {
            sponsorId,
            sponsorName,
            sponsorLogo,
            createdAt: new Date().toISOString()
        })

        return NextResponse.json({ message: "Sponsor created successfully", sponsorId }, { status: 201 });
    } catch (error: any) {
        console.error("Sponsor creation error:", error.message);
        return NextResponse.json({ error: error.message || "Failed to create Sponsor" }, { status: 500 });
    }
}