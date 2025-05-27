import { db } from "@/lib/firebase"
import { collection, doc, getDocs, serverTimestamp, setDoc } from "firebase/firestore"
import { NextResponse } from "next/server"

export async function GET() {
    const snapshot = await getDocs(collection(db, 'speakers'))
    const speakers = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    }))

    return NextResponse.json(speakers)
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { speakerName, description, profileImage } = body;

        const speakerRef = doc(collection(db, "speakers"));
        const speakerId = speakerRef.id;

        if (!speakerName || !description || !profileImage) {
            return NextResponse.json({ error: "Missing Fields" }, { status: 400 })
        }

        await setDoc(speakerRef, {
            speakerId,
            speakerName,
            description,
            profileImage,
            createdAt: new Date().toISOString()
        })

        return NextResponse.json({ message: "Speaker created successfully", speakerId }, { status: 201 });
    } catch (error: any) {
        console.error("Speaker creation error:", error.message);
        return NextResponse.json({ error: error.message || "Failed to create speaker" }, { status: 500 });
    }
}