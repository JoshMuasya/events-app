import { adminAuth } from "@/lib/admin";
import { db } from "@/lib/firebase";
import { deleteDoc, doc } from "firebase/firestore";
import { NextResponse } from "next/server";

export async function DELETE(_: Request, { params }: { params: { userId: string } }) {
    try {
        const { userId } = params;
        await deleteDoc(doc(db, "users", userId))
        await adminAuth.deleteUser(userId);
        
        return NextResponse.json({ userId })
    } catch (error) {
        console.error("Error deleting user:", error);
        return NextResponse.json(
            { error: "Failed to delete user" },
            { status: 500 }
        );
    }
}