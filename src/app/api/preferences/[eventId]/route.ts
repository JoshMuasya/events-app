import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export async function GET(req: NextRequest, { params }: { params: { eventId: string } }) {
  try {
    const { eventId } = params;
    if (!eventId) {
      return NextResponse.json({ error: 'Event ID is required' }, { status: 400 });
    }

    const docRef = doc(db, 'event_preferences', eventId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return NextResponse.json({}, { status: 200 }); // Return empty object if no preferences exist
    }

    return NextResponse.json(docSnap.data(), { status: 200 });
  } catch (error: any) {
    console.error('Error fetching preferences:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch preferences' }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: { params: { eventId: string } }) {
  try {
    const { eventId } = params;
    if (!eventId) {
      return NextResponse.json({ error: 'Event ID is required' }, { status: 400 });
    }

    const body = await req.json();
    const { deliveryLocation, customDeliveryAddress, notificationPreferences } = body;

    if (!deliveryLocation || !notificationPreferences) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const preferences = {
      deliveryLocation,
      customDeliveryAddress: deliveryLocation === 'custom' ? customDeliveryAddress : '',
      notificationPreferences,
    };

    await setDoc(doc(db, 'event_preferences', eventId), preferences);

    return NextResponse.json({ message: 'Preferences saved successfully' }, { status: 200 });
  } catch (error: any) {
    console.error('Error saving preferences:', error);
    return NextResponse.json({ error: error.message || 'Failed to save preferences' }, { status: 500 });
  }
}