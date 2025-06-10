"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import toast from "react-hot-toast";
import { useAuth } from "@/lib/AuthContext";
import { deleteDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { EventDetail } from "@/lib/types";
import EventHeader from "./EventHeader";
import EventSponsors from "./EventSponsors";
import EventDescription from "./EventDescription";
import EventMap from "./EventMap";
import LoadingState from "./LoadingState";
import ErrorState from "./ErrorState";
import VirtualEventFeatures from "./VirtualEventFeature";
import { StaffEventActions } from "./StaffEventAction";

export default function EventPage() {
    const { user, role, loading: authLoading } = useAuth();
    const router = useRouter();
    const params = useParams();
    const eventId = params.eventId as string;

    const [event, setEvent] = useState<EventDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [rsvpResult, setRsvpResult] = useState<string | null>(null);
    const [ticketInfo, setTicketInfo] = useState<{ code: string; qrCode: string } | null>(null);
    const [waitlistJoined, setWaitlistJoined] = useState(false);
    const [liveData, setLiveData] = useState({ attendees: 0, ticketsRemaining: 0 });

    const isStaff = role === "Admin" || (role === "Staff" && "Organizer" && user?.uid && event?.createdBy && event?.assignedStaff && (user.uid === event.createdBy || event.assignedStaff.includes(user.uid)));

    // Authorization Check
    useEffect(() => {
        if (!authLoading && !isStaff) {
            router.push(`/events/${eventId}`)
            toast.error("Access restricted to organizers only");
        } else if (!authLoading && user && role !== "Admin" &&
            ((role === "Organizer" && user.uid !== event?.createdBy && (!event?.assignedStaff || !event.assignedStaff.includes(user.uid))) ||
                (role === "Staff" && (!event?.assignedStaff || !event.assignedStaff.includes(user.uid))))) {
            router.push("/event-management");
            toast.error("You are not authorized to manage this event");
        }
    }, [authLoading, user, role, eventId, router]);

    const fetchEvents = async () => {
        try {
            setLoading(true);

            const response = await fetch(`/api/events/event-management/${eventId}`);
            if (!response.ok) {
                throw new Error("Failed to fetch events")
            }

            const data = await response.json();
            setEvent(data.event);

            // const recResponse = await fetch(`/api/events/recommended?category=${data.event.category}`);
            // const recData = await recResponse.json();
            // setRecommendedEvents(recData);

        } catch (error) {
            console.error("Error fetching Events:", error);
            toast.error("Failed to load Events");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchEvents()
    }, [eventId]);

    const handleEdit = () => router.push(`/event-management/${eventId}/edit`);
    const handleDelete = async () => {
        if (confirm("Are you sure you want to delete this event?")) {
            try {
                await deleteDoc(doc(db, "events", eventId));
                toast.success("Event deleted");
                router.push("/events");
            } catch (err) {
                toast.error("Delete failed");
            }
        }
    };

    const handleManageRsvps = () => router.push(`/event-management/${eventId}/rsvps`);
    const handleManageTickets = () => router.push(`/event-management/${eventId}/tickets`);
    // const handleAddToCalendar = () => {
    //     addToCalendar(event!);
    //     toast.success("Added to calendar");
    // };

    // const shareEvent = (platform: string) => {
    //     const url = `${window.location.origin}/events/${eventId}`;
    //     const text = `Check out ${event?.eventName} on ${format(new Date(event!.date), "PPp")}`;
    //     let shareUrl = "";
    //     switch (platform) {
    //         case "twitter":
    //             shareUrl = `https://x.com/share?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`;
    //             break;
    //         case "facebook":
    //             shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
    //             break;
    //         case "instagram":
    //             navigator.clipboard.writeText(url);
    //             toast.success("Copied link to clipboard");
    //             return;
    //     }
    //     window.open(shareUrl, "_blank");
    // };

    if (authLoading || loading) {
        return (
            <div className="max-w-4xl mx-auto p-6">
                <div className="bg-white/5 backdrop-blur-sm p-6 rounded-xl shadow-lg animate-pulse border border-white/10">
                    {/* Event Header Section */}
                    <div className="h-10 bg-gray-300/30 rounded w-1/2 mb-4"></div>
                    <div className="h-5 bg-gray-400/30 rounded w-1/3 mb-6"></div>

                    {/* Event Image Placeholder */}
                    <div className="h-64 bg-gray-300/30 rounded-lg mb-6"></div>

                    {/* Event Details Section */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div>
                            <div className="h-5 bg-gray-400/50 rounded w-1/4 mb-2"></div>
                            <div className="h-4 bg-gray-400/30 rounded w-3/4 mb-4"></div>
                            <div className="h-5 bg-gray-400/50 rounded w-1/4 mb-2"></div>
                            <div className="h-4 bg-gray-400/30 rounded w-2/3 mb-4"></div>
                        </div>
                        <div>
                            <div className="h-5 bg-gray-400/50 rounded w-1/4 mb-2"></div>
                            <div className="h-4 bg-gray-400/30 rounded w-3/4 mb-4"></div>
                            <div className="h-5 bg-gray-400/50 rounded w-1/4 mb-2"></div>
                            <div className="h-4 bg-gray-400/30 rounded w-2/3 mb-4"></div>
                        </div>
                    </div>

                    {/* Description Section */}
                    <div className="h-5 bg-gray-400/50 rounded w-1/3 mb-2"></div>
                    <div className="h-4 bg-gray-400/30 rounded w-full mb-2"></div>
                    <div className="h-4 bg-gray-400/30 rounded w-5/6 mb-2"></div>
                    <div className="h-4 bg-gray-400/30 rounded w-3/4 mb-6"></div>

                    {/* Action Buttons */}
                    <div className="flex space-x-4">
                        <div className="h-10 w-32 bg-gray-300/30 rounded"></div>
                        <div className="h-10 w-32 bg-gray-300/30 rounded"></div>
                    </div>
                </div>
            </div>
        )
    }

    if (error || !event) {
        return <ErrorState error={error} />;
    }

    const isEventOver = new Date(event.date) < new Date();

    return (
        <div
            className="container mx-auto p-6 m-6 flex flex-col justify-center align-middle items-center"
            style={{ color: event.textColor, fontFamily: event.bodyFont, backgroundColor: event.backgroundColor }}
        >
            <EventHeader event={event} liveData={liveData} />
            <EventSponsors sponsors={event.sponsors} />
            <EventDescription description={event.eventDesc} />
            <EventMap isVirtual={event.isVirtual} direction={event.direction} />
            <VirtualEventFeatures isVirtual={event.isVirtual} />
            <StaffEventActions
                isStaff={isStaff}
                event={event}
                handleEdit={handleEdit}
                handleDelete={handleDelete}
                handleManageRsvps={handleManageRsvps}
                handleManageTickets={handleManageTickets}
            />

            {/* <EventAnalytics isStaff={isStaff} eventId={eventId} /> */}
            {/* <EventSidebar event={event} handleAddToCalendar={handleAddToCalendar} shareEvent={shareEvent} /> */}
        </div>
    );
}