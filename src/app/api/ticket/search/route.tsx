import { db } from "@/lib/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { searchTerm } = await req.json();
    const trimmed = searchTerm.toLowerCase();

    const snapshot = await getDocs(collection(db, "ticketPurchases"));
    const purchases = snapshot.docs
      .map(doc => doc.data() as any)
      .filter(p =>
        p.buyerDetails &&
        (
          p.buyerDetails.name?.toLowerCase().includes(trimmed) ||
          p.buyerDetails.phone?.includes(trimmed)
        )
      );

    return NextResponse.json({ purchases });
  } catch (err) {
    console.error("Search error:", err);
    return new NextResponse("Error searching tickets", { status: 500 });
  }
}
