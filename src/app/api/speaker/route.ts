import { db } from "@/lib/firebase";
import { collection, documentId, getDocs, query, where } from "firebase/firestore";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const idsParam = searchParams.get("ids");

  try {
    if (!idsParam) {
      return NextResponse.json({ error: "Missing 'ids' query parameter" }, { status: 400 });
    }

    const ids = idsParam.split(",").filter(Boolean);

    if (ids.length === 0) {
      return NextResponse.json({ error: "No valid speaker IDs provided" }, { status: 400 });
    }

    const speakerQuery = query(
      collection(db, "speakers"),
      where(documentId(), "in", ids)
    );

    const snapshot = await getDocs(speakerQuery);
    const speakers = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return NextResponse.json(speakers);
  } catch (error: any) {
    console.error("Error fetching speakers:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}