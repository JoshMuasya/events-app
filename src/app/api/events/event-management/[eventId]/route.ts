import { adminFirestore } from "@/lib/admin";
import { db } from "@/lib/firebase";
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

const updateEventSchema = z
  .object({
    eventName: z.string().min(1, "Event name is required").max(100),
    date: z.string().refine((val) => !isNaN(Date.parse(val)), "Invalid date"),
    status: z.enum(["Draft", "Ongoing", "Cancelled", "Published", "Completed"]),
    location: z.string().min(1, "Location is required").max(200),
    isVirtual: z.boolean(),
    ticketSales: z.number().optional(),
    totalRevenue: z.number().optional(),
    ticketsSoldPercentage: z.number().optional(),
    attendeeDemographics: z
      .array(z.object({ ageGroup: z.string(), count: z.number() }))
      .optional(),
    engagementScore: z.number().optional(),
    image: z.string().url().optional().nullable(),
    createdBy: z.string(),
    createdByName: z.string(),
    assignedStaff: z.array(z.string()),
    assignedStaffNames: z.array(z.string()),
    invitesOnly: z.boolean(),
    maxAttendees: z.number().int().positive().optional().nullable(),
    contactPhone: z.string().max(20).optional(),
    contactEmail: z.string().email().optional(),
    accessibilityInfo: z.string().max(500).optional(),
    tags: z.array(z.string()),
    category: z
      .enum(["Conference", "Workshop", "Concert", "Networking"])
      .optional(),
    waitlistLimit: z.number().int().positive().optional().nullable(),
    waitlistEnabled: z.boolean().optional(),
    ticketPrice: z.number().positive().optional().nullable(),
    ticketEnabled: z.boolean().optional(),
    speakers: z
      .object({
        speakerName: z.string().min(1, "Speaker name is required"),
        description: z.string().optional(),
        profileImage: z.string().url().optional().nullable(),
      })
      .optional(),
    agenda: z.string().max(2000).optional(),
    eventDesc: z.string().max(1000).optional(),
    bodyFont: z.enum(["Roboto", "Open Sans", "Montserrat", "Lora"]).optional(),
    headingFont: z.enum(["Roboto", "Open Sans", "Montserrat", "Lora"]).optional(),
    textColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
    backgroundColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
    secondaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
    primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
    direction: z.string().url().optional().nullable(),
    sponsors: z.any().optional(),
    attendies: z.any().optional(),
  })
  .refine(
    (data) => !data.invitesOnly || (data.maxAttendees && data.maxAttendees > 0),
    { message: "Max attendees is required for invites-only events", path: ["maxAttendees"] }
  )
  .refine(
    (data) => !data.ticketEnabled || (data.ticketPrice && data.ticketPrice > 0),
    { message: "Ticket price is required when tickets are enabled", path: ["ticketPrice"] }
  )
  .refine(
    (data) => !data.waitlistEnabled || (data.waitlistLimit && data.waitlistLimit > 0),
    { message: "Waitlist limit is required when waitlist is enabled", path: ["waitlistLimit"] }
  )
  .refine(
    (data) => data.isVirtual || (data.direction && data.direction.length > 0),
    { message: "Google Maps link is required for non-virtual events", path: ["direction"] }
  );

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ eventId: string }> }
) {
  const auth = getAuth();
  const user = auth.currentUser as User | null;

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await request.json();
  const validatedData = updateEventSchema.parse(body);

  const eventRef = adminFirestore.collection("events").doc((await params).eventId);
  const eventSnap = await eventRef.get()
  if (!eventSnap.exists) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }

  const existingEvent = eventSnap.data() as EventDetail;

  if (existingEvent.createdBy !== user.id && !user.role) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let speakerData = validatedData.speakers;
  if (speakerData) {
    const speakerQuery = adminFirestore
      .collection("speakers")
      .where("speakerName", "==", speakerData.speakerName);
    const speakerSnap = await speakerQuery.get();

    if (!speakerSnap.empty) {
      speakerData = speakerSnap.docs[0].data() as Speakers;
    }
  }


  const updatedEventData = {
    eventName: validatedData.eventName,
    date: validatedData.date,
    status: validatedData.status,
    location: validatedData.location,
    isVirtual: validatedData.isVirtual,
    image: validatedData.image ?? existingEvent.image,
    createdBy: validatedData.createdBy,
    createdByName: validatedData.createdByName,
    assignedStaff: validatedData.assignedStaff,
    assignedStaffNames: validatedData.assignedStaffNames,
    invitesOnly: validatedData.invitesOnly,
    maxAttendees: validatedData.maxAttendees ?? null,
    contactPhone: validatedData.contactPhone ?? null,
    contactEmail: validatedData.contactEmail ?? null,
    accessibilityInfo: validatedData.accessibilityInfo ?? null,
    tags: validatedData.tags,
    category: validatedData.category ?? null,
    waitlistLimit: validatedData.waitlistLimit ?? null,
    waitlistEnabled: validatedData.waitlistEnabled ?? false,
    ticketPrice: validatedData.ticketPrice ?? null,
    ticketEnabled: validatedData.ticketEnabled ?? false,
    speakers: validatedData.speakers,
    agenda: validatedData.agenda ?? null,
    eventDesc: validatedData.eventDesc ?? null,
    bodyFont: validatedData.bodyFont ?? null,
    headingFont: validatedData.headingFont ?? null,
    textColor: validatedData.textColor ?? null,
    backgroundColor: validatedData.backgroundColor ?? null,
    secondaryColor: validatedData.secondaryColor ?? null,
    primaryColor: validatedData.primaryColor ?? null,
    direction: validatedData.direction ?? null,
    sponsors: validatedData.sponsors ?? existingEvent.sponsors,
    attendies: validatedData.attendies ?? existingEvent.attendies,
    // Preserve read-only fields
    ticketSales: existingEvent.ticketSales,
    totalRevenue: existingEvent.totalRevenue,
    ticketsSoldPercentage: existingEvent.ticketsSoldPercentage,
    attendeeDemographics: existingEvent.attendeeDemographics,
    engagementScore: existingEvent.engagementScore,
  };

  await eventRef.set(updateEventSchema, { merge: true });

  const updatedEventSnap = await eventRef.get();
  const updatedEvent = { id: updatedEventSnap.id, ...updatedEventSnap.data() }

  return NextResponse.json(updatedEvent, { status: 200 });
}