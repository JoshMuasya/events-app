import { auth, db } from "@/lib/firebase";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { collection, doc, getDocs, serverTimestamp, setDoc } from "firebase/firestore";
import { NextResponse } from "next/server";

export async function GET() {
    const snapshot = await getDocs(collection(db, 'users'))
    const users = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    }))

    return NextResponse.json(users)
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name, email, phone, role, password, image } = body;

        if (!name || !email || !phone || !role || !password || !image) {
            return NextResponse.json({ error: "Missing Fields" }, { status: 400 });
        }

        const userCredetial = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredetial.user;

        await updateProfile(user, {
            displayName: name,
            photoURL: image,
        })

        await setDoc(doc(db, "users", user.uid), {
            uid: user.uid,
            name,
            email,
            phone,
            role,
            photoURL: image,
            createdAt: serverTimestamp()
        })

        return NextResponse.json({ message: "User Data received" }, { status: 201 })
    } catch (error: any) {
        console.error("User creation error:", error.message);
        return NextResponse.json({ error: error.message || "Failed to create user" }, { status: 500 });
    }
}