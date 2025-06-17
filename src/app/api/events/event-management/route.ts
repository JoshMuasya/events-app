import { db } from "@/lib/firebase";
import { collection, doc, getDoc, getDocs, serverTimestamp, setDoc } from "firebase/firestore";
import { NextResponse } from "next/server";

export async function GET() {
    const snapshot = await getDocs(collection(db, 'events'));
    const events = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    }))

    return NextResponse.json(events)
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const {
            eventName,
            image,
            createdBy,
            assignedStaff,
            ticketSales,
            totalRevenue,
            isInvitesOnly,
            maxAttendies,
            status,
            location,
            isVirtual,
            date,
            direction,
            primaryColor,
            secondaryColor,
            backgroundColor,
            textColor,
            headingFont,
            bodyFont,
            eventDesc,
            agenda,
            speakers,
            ticketEnabled,
            ticketPrice,
            waitlistEnabled,
            waitlistLimit,
            category,
            tags,
            accessibilityInfo,
            contactEmail,
            contactPhone,
            coordinates,
            sponsors,
        } = body;

        const validatedSpeakers: string[] = [];
        if (speakers && Array.isArray(speakers) && speakers.length > 0) {
            for (const speakerId of speakers) {
                const speakerRef = doc(db, "speakers", speakerId);
                const speakerSnap = await getDoc(speakerRef);
                if (!speakerSnap.exists()) {
                    return NextResponse.json(
                        { error: `Invalid speaker ID: ${speakerId} does not exist in the speakers collection` },
                        { status: 400 }
                    );
                }
                validatedSpeakers.push(speakerId);
            }
        }

        const validatedSponsors: string[] = [];
        if (sponsors && Array.isArray(sponsors) && sponsors.length > 0) {
            console.log("Received sponsors:", sponsors);
            for (const sponsorId of sponsors) {
                console.log("SponsorId", sponsorId)
                const sponsorRef = doc(db, "sponsor", sponsorId);
                const sponsorSnap = await getDoc(sponsorRef);
                console.log("Snap", sponsorSnap)
                if (!sponsorSnap.exists()) {
                    return NextResponse.json(
                        { error: `Invalid sponsor ID: ${sponsorId} does not exist in the sponsors collection` },
                        { status: 400 }
                    );
                }
                validatedSponsors.push(sponsorId);
            }
        }

        console.log("Validated Sponsors", validatedSponsors)

        const eventId = `${eventName.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}`;

        console.log("Event ID:", eventId);

        if (!eventName || !createdBy || !status || !location || !date) {
            return NextResponse.json({
                error: "Missing Fields"
            }, { status: 400 })
        }

        const eventData = {
            eventId,
            eventName,
            image: image || null,
            createdBy,
            assignedStaff: assignedStaff || [],
            ticketSales: ticketSales || 0,
            totalRevenue: totalRevenue || 0,
            isInvitesOnly: isInvitesOnly || false,
            maxAttendies: isInvitesOnly ? maxAttendies : null,
            status,
            location,
            isVirtual: isVirtual || false,
            date,
            direction: direction || null,
            primaryColor: primaryColor || null,
            secondaryColor: secondaryColor || null,
            backgroundColor: backgroundColor || null,
            textColor: textColor || null,
            headingFont: headingFont || null,
            bodyFont: bodyFont || null,
            eventDesc: eventDesc || null,
            agenda: agenda || null,
            speakers: validatedSpeakers,
            sponsors: validatedSponsors,
            ticketEnabled: ticketEnabled || false,
            ticketPrice: ticketEnabled ? ticketPrice : null,
            waitlistEnabled: waitlistEnabled || false,
            waitlistLimit: waitlistEnabled ? waitlistLimit : null,
            category: category || null,
            tags: tags || "",
            accessibilityInfo: accessibilityInfo || null,
            contactEmail: contactEmail || null,
            contactPhone: contactPhone || null,
            createdAt: serverTimestamp(),
            coordinates: coordinates || null,
        };

        await setDoc(doc(db, "events", eventId), eventData);

        return NextResponse.json({
            message: "Event created successfully", eventId
        }, { status: 201 })
    } catch (error: any) {
        console.error("Event creation error:", error.message);
        return NextResponse.json({ error: error.message || "Failed to create event" }, { status: 500 });
    }
}