import { db } from "@/lib/firebase";
import { addDoc, collection, doc, getDoc, Timestamp, updateDoc } from "firebase/firestore";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { documentNumber, checkedInCount } = body;

    console.log('Received body:', body);

    if (!documentNumber || !checkedInCount || checkedInCount <= 0) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }

    const rsvpDocRef = doc(db, 'rsvp', documentNumber);
    const rsvpSnap = await getDoc(rsvpDocRef);

    if (!rsvpSnap.exists()) {
      return NextResponse.json({ error: 'RSVP not found' }, { status: 404 });
    }

    const rsvpData = rsvpSnap.data();
    const totalAttendees = rsvpData.numberofAttendees || 0;
    const currentCheckedIn = rsvpData.checkedInCount || 0;
    const remaining = totalAttendees - currentCheckedIn;

    if (checkedInCount > remaining) {
      return NextResponse.json(
        { error: `Cannot check in more than remaining ${remaining} guests.` },
        { status: 400 }
      );
    }

    // Add new check-in record
    const checkinColRef = collection(db, 'checkin');
    await addDoc(checkinColRef, {
      documentNumber,
      eventId: rsvpData.eventId,
      checkedInCount,
      checkedInAt: Timestamp.now(),
      guestName: rsvpData.fullName,
      emailAddress: rsvpData.emailAddress,
    });

    // Update RSVP doc with new checkedInCount
    await updateDoc(rsvpDocRef, {
      checkedInCount: currentCheckedIn + checkedInCount,
      lastCheckedInAt: Timestamp.now(),
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    console.error('Check-in error:', err);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}