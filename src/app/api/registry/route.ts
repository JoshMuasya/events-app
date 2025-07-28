import { db } from "@/lib/firebase";
import { collection, doc, setDoc } from "firebase/firestore";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { eventId,
            name,
            description,
            price,
            image,
            vendor,
            category,
            link,
            received, 
        } = body;

        const registryRef = doc(collection(db, "registry"));
        const registryId = registryRef.id

        if (!eventId || !name || !description || !price || !vendor || !category) {
            return NextResponse.json({ error: "Missing Fields" }, { status: 400 })
        }

        await setDoc(registryRef, {
            registryId,
            eventId,
            name,
            description,
            price,
            image,
            vendor,
            category,
            link,
            received,
            createdAt: new Date().toISOString()
        })

        return NextResponse.json({ message: "Registry Created Successfully", registryId }, { status: 201 })
    } catch (error: any) {
        console.error("Error Adding Registry", error.message);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}