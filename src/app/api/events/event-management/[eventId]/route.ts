import { adminAuth, adminFirestore } from "@/lib/admin";
import { auth, db } from "@/lib/firebase";
import { EventDetail, Speakers, User } from "@/lib/types";
import { collection, doc, getDoc, getDocs, query, setDoc, where } from "@firebase/firestore";
import { getAuth } from "firebase/auth";
import { NextResponse } from "next/server";
import { z } from "zod";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    const { eventId } = await params;

    if (!eventId) {
      return NextResponse.json(
        {
          error: {
            message: "Event ID is required",
            source: "API Request",
            details: "No eventId provided in the URL",
          },
        },
        { status: 400 }
      );
    }

    const eventDocRef = doc(db, "events", eventId);
    const eventDoc = await getDoc(eventDocRef);

    if (!eventDoc.exists()) {
      return NextResponse.json(
        {
          error: {
            message: "Event not found",
            source: "Firestore Query",
            details: `No event found with ID: ${eventId}`,
          },
        },
        { status: 404 }
      );
    }

    const eventData = eventDoc.data() as Omit<EventDetail, "id">;
    const event: EventDetail = {
      ...eventData,
      id: eventDoc.id,
      attendies: eventData.attendies || 0,
      sponsors: eventData.sponsors || [{ name: "Sponsor 1", logo: "/sponsor1.png" }],
    };

    return NextResponse.json({ event }, { status: 200 });
  } catch (err) {
    console.error("Error fetching event:", err);
    return NextResponse.json(
      {
        error: {
          message: err instanceof Error ? err.message : "Failed to fetch event",
          source: "Firestore Query",
          details: `Event ID: ${(await params).eventId || "unknown"}`,
        },
      },
      { status: 500 }
    );
  }
}


export async function PUT(
  request: Request,
  { params }: { params: Promise<{ eventId: string }> }
) {
  const authHeader = request.headers.get("Authorization");

  console.log("Token", authHeader);

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return NextResponse.json(
      { error: "Unauthorized: No token provided" },
      { status: 401 }
    );
  }

  const idToken = authHeader.split("Bearer ")[1];
  let user;

  try {
    user = await adminAuth.verifyIdToken(idToken);
  } catch (error) {
    console.error("Error verifying ID token:", error);
    return NextResponse.json(
      { error: "Unauthorized: Invalid token" },
      { status: 401 }
    );
  }

  const body = await request.json();
  const eventRef = adminFirestore.collection("events").doc((await params).eventId);
  const eventSnap = await eventRef.get();

  if (!eventSnap.exists) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }

  const existingEvent = eventSnap.data() as EventDetail;

  // Optional: Reinstate authorization check if needed
  // if (existingEvent.createdBy !== user?.uid && !user?.role) {
  //   return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  // }

  // Update the event with the data from the request body
  try {
    await eventRef.update({
      ...body
    });

    // Fetch the updated event
    const updatedEventSnap = await eventRef.get();
    const updatedEvent = { id: updatedEventSnap.id, ...updatedEventSnap.data() };

    return NextResponse.json(updatedEvent, { status: 200 });
  } catch (error) {
    console.error("Error updating event:", error);
    return NextResponse.json({ error: "Failed to update event" }, { status: 500 });
  }
}