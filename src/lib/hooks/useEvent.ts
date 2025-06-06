import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { EventDetail, RecommendedEventHook } from "../types";
import { useParams } from "next/navigation";

export function useEvent() {
  const params = useParams();
  const eventId = params.eventId as string;
  const [event, setEvent] = useState<EventDetail | null>(null);
  const [recommendedEvents, setRecommendedEvents] = useState<RecommendedEventHook[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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
      setLiveData({
        attendees: data.event.currentAttendees || 0,
        ticketsRemaining: data.event.maxAttendees ? data.event.maxAttendees - (data.event.currentAttendees || 0) : 0,
      });
      // Note: Recommended events fetch is commented out as in original
      // const recResponse = await fetch(`/api/events/recommended?category=${data.event.category}`);
      // const recData = await recResponse.json();
      // setRecommendedEvents(recData);
    } catch (error) {
      console.error("Error fetching Events:", error);
      setError("Failed to load event");
      toast.error("Failed to load event");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [eventId]);

  return { event, recommendedEvents, loading, error, liveData, fetchEvents };
}