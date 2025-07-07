"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import toast from "react-hot-toast";
import { EventDetail } from "@/lib/types";
import EventHeader from "./EventHeader";
import EventSponsors from "./EventSponsors";
import EventDescription from "./EventDescription";
import EventMap from "./EventMap";
import EventSidebar from "./EventSideBar";
import EventSpeakers from "./EventSpeakers";
import ErrorState from "./ErrorState";
import GuestActions from "./GuestActions";

export default function EventPage() {
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

    const fetchEvents = async () => {
        try {
            setLoading(true);
            const response = await fetch(`/api/events/event-management/${eventId}`);
            if (!response.ok) {
                throw new Error("Failed to fetch events");
            }
            const data = await response.json();
            setEvent(data.event);
        } catch (error) {
            console.error("Error fetching Events:", error);
            toast.error("Failed to load Events");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEvents();
    }, [eventId]);

    const handleManageRsvps = () => router.push(`/event-management/${eventId}/rsvps`);
    const handleManageTickets = () => router.push(`/event-management/${eventId}/tickets`);

    const handleAddToCalendar = () => {
        if (!event) return;

        const formatDate = (date: Date) => {
            return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
        };

        const startDate = new Date(event.date);
        const endDate = new Date(startDate.getTime() + 2 * 60 * 60 * 1000);

        const googleCalendarUrl = `https://www.google.com/calendar/render?action=TEMPLATE` +
            `&text=${encodeURIComponent(event.eventName)}` +
            `&dates=${formatDate(startDate)}/${formatDate(endDate)}` +
            `&details=${encodeURIComponent(event.eventDesc)}` +
            `&location=${encodeURIComponent(event.location)}` +
            `&sprop=website:${encodeURIComponent(window.location.href)}`;

        window.open(googleCalendarUrl, '_blank');
        toast.success("Opening Google Calendar");
    };

    const shareEvent = (platform: string) => {
        if (!event) return;

        const eventUrl = encodeURIComponent(window.location.href);
        const eventName = encodeURIComponent(event.eventName);
        const eventDesc = encodeURIComponent(event.eventDesc.substring(0, 200)); // Limit description length
        const posterUrl = event.image ? encodeURIComponent(event.image) : '';
        const shareText = `${eventName}: ${eventDesc} Join us! ${eventUrl}`;

        // Try Web Share API first
        if (navigator.share && (platform === 'whatsapp' || platform === 'telegram')) {
            navigator.share({
                title: event.eventName,
                text: shareText,
                url: window.location.href,
            }).then(() => {
                toast.success(`Shared to ${platform}`);
            }).catch((err) => {
                console.error("Web Share API failed:", err);
                fallbackShare(platform);
            });
        } else {
            fallbackShare(platform);
        }

        function fallbackShare(platform: string) {
            let shareUrl = '';
            switch (platform.toLowerCase()) {
                case 'whatsapp':
                    shareUrl = `https://api.whatsapp.com/send?text=${shareText}`;
                    break;
                case 'facebook':
                    shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${eventUrl}&quote=${eventDesc}`;
                    break;
                case 'telegram':
                    shareUrl = `https://t.me/share/url?url=${eventUrl}&text=${shareText}`;
                    break;
                case 'x':
                    shareUrl = `https://x.com/intent/tweet?url=${eventUrl}&text=${shareText}`;
                    break;
                default:
                    toast.error("Unsupported platform");
                    return;
            }

            window.open(shareUrl, '_blank');
            toast.success(`Shared to ${platform}`);
        }
    };

    if ( loading) {
        return (
            <div className="max-w-4xl mx-auto p-6 mt-20">
                <div className="bg-white/5 backdrop-blur-sm p-6 rounded-xl shadow-lg animate-pulse border border-white/10">
                    <div className="h-10 bg-gray-300/30 rounded w-1/2 mb-4"></div>
                    <div className="h-5 bg-gray-400/30 rounded w-1/3 mb-6"></div>
                    <div className="h-64 bg-gray-300/30 rounded-lg mb-6"></div>
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
                    <div className="h-5 bg-gray-400/50 rounded w-1/3 mb-2"></div>
                    <div className="h-4 bg-gray-400/30 rounded w-full mb-2"></div>
                    <div className="h-4 bg-gray-400/30 rounded w-5/6 mb-2"></div>
                    <div className="h-4 bg-gray-400/30 rounded w-3/4 mb-6"></div>
                    <div className="flex space-x-4">
                        <div className="h-10 w-32 bg-gray-300/30 rounded"></div>
                        <div className="h-10 w-32 bg-gray-300/30 rounded"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !event) {
        return <ErrorState error={error} />;
    }

    const handleRsvp = () => router.push(`/event-management/${eventId}/guest-event/guest-rsvp`);

    const handleTickets = () => {
        
    }

    return (
        <div
            className="container mx-auto p-6 m-6 flex flex-col justify-center align-middle items-center rounded-xl"
            style={{ color: event.textColor, fontFamily: event.bodyFont, backgroundColor: event.backgroundColor }}
        >
            <EventHeader event={event} liveData={liveData} />
            <EventSpeakers speakers={event.speakers} />
            <EventSponsors sponsors={event.sponsors} secondaryColor={event.secondaryColor} />
            <EventDescription description={event.eventDesc} />
            <EventMap isVirtual={event.isVirtual} coordinates={event.coordinates} />
            <EventSidebar
                event={event}
                handleAddToCalendar={handleAddToCalendar}
                shareEvent={shareEvent}
            />
            <GuestActions 
            event={event} 
            handleGuestRsvp={handleRsvp} 
            handleBuyTickets={handleTickets} />
        </div>
    );
}