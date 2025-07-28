import { db, storage } from "@/lib/firebase";
import { doc, updateDoc, getDoc, deleteDoc } from "firebase/firestore";
import { deleteObject, ref } from "firebase/storage";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(req: NextRequest, { params }: { params: { itemId: string } }) {
  try {
    const { itemId } = params;
    const body = await req.json(); // Read body once
    console.log("PATCH request for itemId:", itemId, "Body:", body); // Log the parsed body

    if (!itemId) {
      return NextResponse.json({ error: "itemId is required" }, { status: 400 });
    }

    const {
      eventId,
      name,
      description,
      price,
      image,
      vendor,
      category,
      link,
      received,
    } = body;

    if (!eventId || !name || !description || !price || !vendor || !category) {
      return NextResponse.json(
        { error: "Missing required fields: eventId, name, description, price, vendor, and category are required" },
        { status: 400 }
      );
    }

    const registryRef = doc(db, "registry", itemId);
    const registryDoc = await getDoc(registryRef);

    if (!registryDoc.exists()) {
      return NextResponse.json({ error: "Registry item not found" }, { status: 404 });
    }

    const updatedData = {
      eventId,
      name,
      description,
      price: parseFloat(price),
      image: image || registryDoc.data().image,
      vendor,
      category,
      link: link || "",
      received: received || false,
      updatedAt: new Date().toISOString(),
    };

    await updateDoc(registryRef, updatedData);

    return NextResponse.json({
      message: "Registry item updated successfully",
      id: itemId,
      ...updatedData,
    }, { status: 200 });
  } catch (error: any) {
    console.error("Error updating registry item:", error.message);
    return NextResponse.json(
      { error: "Failed to update registry item: " + error.message },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest, { params }: { params: { itemId: string } }) {
  try {
    const { itemId } = params;
    console.log("Fetching registry item with itemId:", itemId); // Debug log

    if (!itemId) {
      return NextResponse.json({ error: "itemId is required" }, { status: 400 });
    }

    const registryDoc = await getDoc(doc(db, "registry", itemId));

    if (!registryDoc.exists()) {
      return NextResponse.json({ error: "Registry item not found" }, { status: 404 });
    }

    const registryItem = {
      id: registryDoc.id,
      ...registryDoc.data(),
    };

    return NextResponse.json(registryItem, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching registry item:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { itemId: string } }) {
  try {
    const { itemId } = params;
    console.log("DELETE request for itemId:", itemId); // Debug log

    if (!itemId) {
      return NextResponse.json({ error: "itemId is required" }, { status: 400 });
    }

    const registryRef = doc(db, "registry", itemId);
    const registryDoc = await getDoc(registryRef);

    if (!registryDoc.exists()) {
      return NextResponse.json({ error: "Registry item not found" }, { status: 404 });
    }

    // Delete associated image from Firebase Storage if it's not the default Unsplash image
    const imageUrl = registryDoc.data().image;
    if (imageUrl && !imageUrl.includes("unsplash")) {
      try {
        const imageRef = ref(storage, imageUrl);
        await deleteObject(imageRef);
        console.log("Deleted image from storage:", imageUrl);
      } catch (error) {
        console.warn("Failed to delete image from storage:", error);
      }
    }

    // Delete the Firestore document
    await deleteDoc(registryRef);

    return NextResponse.json(
      { message: "Registry item deleted successfully", id: itemId },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error deleting registry item:", error.message);
    return NextResponse.json(
      { error: "Failed to delete registry item: " + error.message },
      { status: 500 }
    );
  }
}