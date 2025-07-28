import { db } from "@/lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest, { params }: { params: { eventId: string } }) {
  try {
    const { eventId } = params;
    console.log("Fetching registry for eventId:", eventId); // Debug log

    if (!eventId) {
      return NextResponse.json({ error: "eventId is required" }, { status: 400 });
    }

    const registryQuery = query(
      collection(db, "registry"),
      where("eventId", "==", eventId)
    );
    const querySnapshot = await getDocs(registryQuery);
    console.log("Fetched docs:", querySnapshot.docs.map(doc => doc.data())); // Debug log

    const registryItems = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json(registryItems, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching Registry Items:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}