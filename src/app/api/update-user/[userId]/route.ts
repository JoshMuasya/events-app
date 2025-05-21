import { adminAuth, adminFirestore } from "@/lib/admin";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const {
            uid,
            name,
            email,
            phone,
            role,
            password,
            photoURL,
        } = await req.json();

        if (!uid) {
            return NextResponse.json({ error: 'UID is required' }, { status: 400 });
        }

        const authPayload: any = {};
        if (name) authPayload.displayName = name;
        if (email) authPayload.email = email;
        if (password) authPayload.password = password;
        if (photoURL) authPayload.photoURL = photoURL;

        if (Object.keys(authPayload).length > 0) {
            await adminAuth.updateUser(uid, authPayload);
        }

        const firestorePayload = {
            name,
            email,
            phone,
            role,
            photoURL,
        };

        await adminFirestore.collection("users").doc(uid).set(firestorePayload, { merge: true });

        return NextResponse.json({ message: "User updated successfully" });
    } catch (error: any) {
        console.error('Error updating user:', error);
        return NextResponse.json(
            { error: error.message || 'Something went wrong' },
            { status: 500 }
        );
    }
}