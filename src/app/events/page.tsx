"use client";

import { useAuth } from "@/lib/AuthContext";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import toast from "react-hot-toast";
import { doc, setDoc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useState } from "react";
import { useEvent } from "@/lib/hooks/useEvent";
import EventHeader from "../components/EventHeader";
import EventSponsors from "../components/EventSponsors";
import EventDescription from "../components/EventDescription";
import EventMap from "../components/EventMap";
import VirtualEventFeatures from "../components/VirtualEventFeature";
import EventFeedback from "../components/EventFeedback";
import RecommendedEvents from "../components/RecommendedEvents";
import LoadingState from "../components/LoadingState";
import ErrorState from "../components/ErrorState";
import { GuestEventActions } from "../components/GuestEventAction";

// Schemas for form validation
const rsvpSchema = z.object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Invalid email address"),
});

const ticketCheckSchema = z.object({
    email: z.string().email("Invalid email address"),
    code: z.string().min(1, "Confirmation code is required"),
});

const feedbackSchema = z.object({
    rating: z.number().min(1).max(5),
    comments: z.string().max(500).optional(),
});

export default function GuestEventPage() {
    const { user } = useAuth();
    const { event, recommendedEvents, loading, error, liveData } = useEvent();
    const rsvpForm = useForm({ resolver: zodResolver(rsvpSchema) });
    const ticketCheckForm = useForm({ resolver: zodResolver(ticketCheckSchema) });
    const feedbackForm = useForm({ resolver: zodResolver(feedbackSchema) });
    const [rsvpResult, setRsvpResult] = useState<string | null>(null);
    const [ticketInfo, setTicketInfo] = useState<{ code: string; qrCode: string } | null>(null);
    const [waitlistJoined, setWaitlistJoined] = useState(false);
    const [showFeedback, setShowFeedback] = useState(false);

    const handleRsvpSubmit = async (data: { name: string; email: string }) => {
        if (!event) {
            toast.error("No event data available");
            return;
        }
        try {
            if (event?.maxAttendees && liveData.attendees >= event.maxAttendees) {
                await setDoc(doc(db, "events", event.id, "waitlist", data.email), { ...data, timestamp: new Date() });
                setWaitlistJoined(true);
                toast.success("Waitlist joined");
            } else {
                await setDoc(doc(db, "events", event.id, "rsvps", data.email), { ...data, timestamp: new Date() });
                await updateDoc(doc(db, "events", event.id), { currentAttendees: liveData.attendees + 1 });
                toast.success("RSVP successful");
                rsvpForm.reset();
            }
        } catch (err) {
            toast.error("RSVP failed");
        }
    };

    const handleTicketCheckSubmit = async (data: { email: string; code: string }) => {
        if (!event) {
            toast.error("No event data available");
            return;
        }
        try {
            const ticketDoc = await getDoc(doc(db, "events", event.id, "tickets", data.email));
            if (!ticketDoc.exists()) throw new Error("Ticket not found");
            const ticket = ticketDoc.data();
            setTicketInfo({ code: ticket.code, qrCode: `${window.location.origin}/events/${event.id}/ticket/${ticket.code}` });
            setRsvpResult("Ticket found");
        } catch (err) {
            setRsvpResult("Ticket not found");
            toast.error("Ticket check failed");
        }
    };

    const handleFeedbackSubmit = async (data: { rating: number; comments?: string }) => {
        if (!event) {
            toast.error("No event data available");
            return;
        }
        try {
            await setDoc(doc(db, "events", event.id, "feedback", `${user?.uid || "anonymous"}-${Date.now()}`), {
                ...data,
                timestamp: new Date(),
            });
            toast.success("Feedback submitted");
            setShowFeedback(false);
            feedbackForm.reset();
        } catch (err) {
            toast.error("Feedback failed");
        }
    };

    const handlePurchaseTickets = async () => {
        if (!event) {
            toast.error("No event data available");
            return;
        }
        try {
            const ticketCode = `TICKET-${Math.random().toString(36).substr(2, 9)}`;
            await setDoc(doc(db, "events", event.id, "tickets", user?.email || "guest"), {
                email: user?.email,
                code: ticketCode,
                purchasedAt: new Date(),
            });
            await updateDoc(doc(db, "events", event.id), { currentAttendees: liveData.attendees + 1 });
            toast.success("Ticket purchased");
            setTicketInfo({ code: ticketCode, qrCode: `${window.location.origin}/events/${event.id}/ticket/${ticketCode}` });
        } catch (err) {
            toast.error("Purchase failed");
        }
    };

    if (loading) return <LoadingState />;
    if (error || !event) return <ErrorState error={error} />;

    const isEventOver = new Date(event.date) < new Date();

    const handleDelete = async () => {
        // Guests typically shouldn't delete events, so this is a no-op
        toast.error("Guests cannot delete events");
    };

    return (
        <div>
            <EventHeader event={event} liveData={liveData} />
            <EventSponsors sponsors={event.sponsors} />
            <EventDescription description={event.eventDesc} />
            <EventMap isVirtual={event.isVirtual} direction={event.direction} />
            <GuestEventActions
                isStaff={false}
                event={event}
                user={user}
                isEventOver={isEventOver}
                rsvpForm={rsvpForm}
                ticketCheckForm={ticketCheckForm}
                rsvpResult={rsvpResult}
                ticketInfo={ticketInfo}
                waitlistJoined={waitlistJoined}
                handleRsvpSubmit={handleRsvpSubmit}
                handleTicketCheckSubmit={handleTicketCheckSubmit}
                handlePurchaseTickets={handlePurchaseTickets}
                handleEdit={() => { }}
                handleDelete={handleDelete}
                handleManageRsvps={() => { }}
                handleManageTickets={() => { }}
            />
            <VirtualEventFeatures isVirtual={event.isVirtual} />
            <EventFeedback
                isEventOver={isEventOver}
                showFeedback={showFeedback}
                feedbackForm={feedbackForm}
                handleFeedbackSubmit={handleFeedbackSubmit}
                setShowFeedback={setShowFeedback}
                primaryColor={event.primaryColor}
            />
            <RecommendedEvents recommendedEvents={recommendedEvents} primaryColor={event.primaryColor} />
        </div>
    );
}