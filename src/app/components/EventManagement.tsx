"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiPlus, FiChevronUp, FiChevronDown, FiSearch, FiShare2 } from "react-icons/fi";
import { FaFacebook, FaTwitter, FaInstagram, FaTiktok, FaWhatsapp } from "react-icons/fa";
import Image from "next/image";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import toast from "react-hot-toast";
import { debounce } from "lodash";
import { useAuth } from "@/lib/AuthContext";

// Define types
interface EventDetail {
  id: string;
  name: string;
  dateTime: string;
  status: "Draft" | "Ongoing" | "Cancelled" | "Published" | "Completed";
  location: string;
  isVirtual: boolean;
  ticketSales: number;
  totalRevenue: number;
  ticketsSoldPercentage: number;
  attendeeDemographics: { ageGroup: string; count: number }[];
  engagementScore: number;
  image?: string;
}

type EventField = "name" | "dateTime" | "status" | "location" | "ticketSales" | "totalRevenue";

// Form schema for validation
const eventSchema = z.object({
  name: z.string().min(1, "Event name is required").max(100, "Event name is too long"),
  dateTime: z.string().min(1, "Date and time are required"),
  location: z.string().min(1, "Location is required").max(200, "Location is too long"),
  isVirtual: z.boolean(),
  status: z.enum(["Draft", "Published"], { errorMap: () => ({ message: "Status is required" }) }),
  image: z.union([z.instanceof(File), z.string().url().optional(), z.string().optional()]).optional().nullable(),
});

type FormData = z.infer<typeof eventSchema>;

export default function EventManagement() {
  const [events, setEvents] = useState<EventDetail[]>([]);
  const [isAddingEvent, setIsAddingEvent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("All");
  const storage = getStorage();
  const { user: authUser, loading: authLoading } = useAuth();

  // Initialize react-hook-form
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    reset,
    setFocus,
  } = useForm<FormData>({
    resolver: zodResolver(eventSchema),
  });

  // Debounced search handler
  const debouncedSetSearchQuery = useMemo(() => debounce(setSearchQuery, 300), []);

  // Fetch events
  const fetchEvents = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/events");
      if (!response.ok) {
        throw new Error("Failed to fetch events");
      }
      const data = await response.json();
      setEvents(data);
    } catch (error) {
      console.error("Error fetching events:", error);
      toast.error("Failed to load events");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  // Filter logic
  const filteredEvents = useMemo(() => {
    return events.filter((event) =>
      (searchQuery
        ? Object.values(event)
            .join(" ")
            .toLowerCase()
            .includes(searchQuery.toLowerCase())
        : true) &&
      (filterStatus !== "All" ? event.status === filterStatus : true)
    );
  }, [events, searchQuery, filterStatus]);

  // Animation variants
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } },
    hover: {
      scale: 1.02,
      boxShadow: "0 4px 12px rgba(106, 13, 173, 0.5)",
      transition: { duration: 0.2 },
    },
  };

  const buttonVariants = {
    hover: {
      scale: 1.05,
      boxShadow: "0 4px 12px rgba(106, 13, 173, 0.5)",
      transition: { duration: 0.2 },
    },
    tap: { scale: 0.95, transition: { duration: 0.1 } },
  };

  const formVariants = {
    hidden: { opacity: 0, height: 0 },
    visible: {
      opacity: 1,
      height: "auto",
      transition: {
        opacity: { duration: 0.3 },
        height: { duration: 0.4, ease: "easeOut" },
      },
    },
    exit: {
      opacity: 0,
      height: 0,
      transition: {
        opacity: { duration: 0.2 },
        height: { duration: 0.3, ease: "easeIn" },
      },
    },
  };

  // Handle image upload
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        setValue("image", file);
      } catch (err) {
        setError("Failed to process image");
      }
    }
  };

  // Handle form submission
  const onSubmit = async (data: FormData) => {
    try {
      let downloadUrl = "";
      if (data.image && data.image instanceof File) {
        const imageRef = ref(storage, `events/${Date.now()}_${data.image.name}`);
        const snapshot = await uploadBytes(imageRef, data.image);
        downloadUrl = await getDownloadURL(snapshot.ref);
      }

      const response = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.name,
          dateTime: data.dateTime,
          location: data.location,
          isVirtual: data.isVirtual,
          status: data.status,
          image: downloadUrl,
        }),
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || "Failed to create event");
      }

      toast.success("Event Added Successfully");
      setIsAddingEvent(false);
      reset();
      setError(null);
      await fetchEvents();
    } catch (err) {
      toast.error("Failed to Add Event");
      setError(err instanceof Error ? err.message : "Failed to create event");
    }
  };

  // Toggle add event form
  const toggleAddEventForm = () => {
    setIsAddingEvent(!isAddingEvent);
    if (isAddingEvent) {
      reset();
      setError(null);
    } else {
      setTimeout(() => setFocus("name"), 0);
    }
  };

  // Share event on social media
  const shareEvent = (platform: string, event: EventDetail) => {
    const url = `${window.location.origin}/events/${event.id}`;
    const text = `Check out ${event.name} on ${new Date(event.dateTime).toLocaleString()} at ${event.location}!`;
    let shareUrl = "";
    switch (platform) {
      case "x":
        shareUrl = `https://x.com/share?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`;
        break;
      case "facebook":
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
        break;
      case "instagram":
        toast.success("Copy the link to share on Instagram: " + url);
        return;
      case "tiktok":
        toast.success("Copy the link to share on TikTok: " + url);
        return;
      case "whatsapp":
        shareUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(text + " " + url)}`;
        break;
    }
    window.open(shareUrl, "_blank");
  };

  // Stats
  const totalEvents = filteredEvents.length;
  const totalOngoing = filteredEvents.filter((e) => e.status === "Ongoing").length;
  const totalPublished = filteredEvents.filter((e) => e.status === "Published").length;
  const totalRevenue = filteredEvents.reduce((sum, e) => sum + e.totalRevenue, 0);

  if (authLoading || isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div
          className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#6A0DAD]"
          role="status"
          aria-label="Loading events"
        ></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[#6A0DAD] flex items-center gap-2">
          <FiSearch aria-hidden="true" /> Manage Events
        </h1>
        <motion.button
          className="bg-[#6A0DAD] text-[#FFD700] px-4 py-2 rounded-lg flex items-center gap-2"
          variants={buttonVariants}
          whileHover="hover"
          whileTap="tap"
          onClick={toggleAddEventForm}
          aria-label={isAddingEvent ? "Hide add event form" : "Add new event"}
        >
          {isAddingEvent ? (
            <>
              <FiChevronUp aria-hidden="true" /> Hide Form
            </>
          ) : (
            <>
              <FiPlus aria-hidden="true" /> Add New Event
            </>
          )}
        </motion.button>
      </div>

      {/* Add Event Form */}
      <AnimatePresence>
        {isAddingEvent && (
          <motion.div
            className="bg-[rgba(255,215,0,0.2)] backdrop-blur-md rounded-lg p-6 mb-6 shadow-[0_4px_12px_rgba(106,13,173,0.3)] text-[#6A0DAD]"
            variants={formVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            role="form"
            aria-labelledby="add-event-form-title"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 id="add-event-form-title" className="text-xl font-bold">
                Add New Event
              </h2>
              <button
                onClick={toggleAddEventForm}
                className="text-[#6A0DAD] hover:text-[#7B17C0]"
                aria-label="Close add event form"
              >
                <FiChevronDown size={24} aria-hidden="true" />
              </button>
            </div>
            {error && <p className="text-red-500 mb-4" role="alert">{error}</p>}
            <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium">
                  Event Name
                </label>
                <input
                  id="name"
                  {...register("name")}
                  className="input input-bordered w-full bg-white text-[#6A0DAD]"
                  placeholder="Enter event name"
                  aria-invalid={errors.name ? "true" : "false"}
                />
                {errors.name && (
                  <p className="text-red-500 text-sm" role="alert">
                    {errors.name.message}
                  </p>
                )}
              </div>
              <div>
                <label htmlFor="dateTime" className="block text-sm font-medium">
                  Date & Time
                </label>
                <input
                  id="dateTime"
                  type="datetime-local"
                  {...register("dateTime")}
                  className="input input-bordered w-full bg-white text-[#6A0DAD]"
                  aria-invalid={errors.dateTime ? "true" : "false"}
                />
                {errors.dateTime && (
                  <p className="text-red-500 text-sm" role="alert">
                    {errors.dateTime.message}
                  </p>
                )}
              </div>
              <div>
                <label htmlFor="location" className="block text-sm font-medium">
                  Location
                </label>
                <input
                  id="location"
                  {...register("location")}
                  className="input input-bordered w-full bg-white text-[#6A0DAD]"
                  placeholder="Enter location or virtual link"
                  aria-invalid={errors.location ? "true" : "false"}
                />
                {errors.location && (
                  <p className="text-red-500 text-sm" role="alert">
                    {errors.location.message}
                  </p>
                )}
              </div>
              <div>
                <label htmlFor="isVirtual" className="block text-sm font-medium">
                  Virtual Event
                </label>
                <input
                  id="isVirtual"
                  type="checkbox"
                  {...register("isVirtual")}
                  className="checkbox checkbox-bordered bg-white text-[#6A0DAD]"
                  aria-invalid={errors.isVirtual ? "true" : "false"}
                />
                {errors.isVirtual && (
                  <p className="text-red-500 text-sm" role="alert">
                    {errors.isVirtual.message}
                  </p>
                )}
              </div>
              <div>
                <label htmlFor="status" className="block text-sm font-medium">
                  Status
                </label>
                <select
                  id="status"
                  {...register("status")}
                  className="select select-bordered w-full bg-white text-[#6A0DAD]"
                  aria-invalid={errors.status ? "true" : "false"}
                >
                  <option value="Draft">Draft</option>
                  <option value="Published">Published</option>
                </select>
                {errors.status && (
                  <p className="text-red-500 text-sm" role="alert">
                    {errors.status.message}
                  </p>
                )}
              </div>
              <div>
                <label htmlFor="image" className="block text-sm font-medium">
                  Event Image
                </label>
                <input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="file-input file-input-bordered w-full bg-white text-[#6A0DAD]"
                  aria-invalid={errors.image ? "true" : "false"}
                />
                {errors.image && (
                  <p className="text-red-500 text-sm" role="alert">
                    {errors.image.message}
                  </p>
                )}
              </div>
              <div className="md:col-span-2 flex gap-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn bg-[#6A0DAD] text-white hover:bg-[#FFD700] hover:text-[#6A0DAD] disabled:opacity-50"
                  aria-label={isSubmitting ? "Saving event" : "Save event"}
                >
                  {isSubmitting ? "Saving..." : "Save Event"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    toggleAddEventForm();
                    reset();
                    setError(null);
                  }}
                  className="btn bg-gray-500 text-white hover:bg-gray-600"
                  aria-label="Cancel adding event"
                >
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search events..."
            className="input input-bordered w-full bg-[rgba(255,255,255,0.2)] placeholder-gray-700 text-[#6A0DAD] border-[rgba(255,215,0,0.4)] backdrop-blur-sm shadow-sm"
            onChange={(e) => debouncedSetSearchQuery(e.target.value)}
            aria-label="Search events"
          />
        </div>
        <div>
          <select
            className="select select-bordered w-full bg-white text-[#6A0DAD]"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            aria-label="Filter events by status"
          >
            <option value="All">All Statuses</option>
            <option value="Draft">Draft</option>
            <option value="Ongoing">Ongoing</option>
            <option value="Cancelled">Cancelled</option>
            <option value="Published">Published</option>
            <option value="Completed">Completed</option>
          </select>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {[
          { value: totalEvents, label: "Total Events" },
          { value: totalOngoing, label: "Ongoing Events" },
          { value: totalPublished, label: "Published Events" },
          { value: `$${totalRevenue.toLocaleString()}`, label: "Total Revenue" },
        ].map((stat, index) => (
          <motion.div
            key={index}
            className="bg-[rgba(255,215,0,0.2)] backdrop-blur-md rounded-lg p-4 shadow-[0_4px_12px_rgba(106,13,173,0.3)]"
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: index * 0.1 }}
          >
            <p className="text-lg font-bold text-[#6A0DAD]">{stat.value}</p>
            <p className="text-sm text-[#6A0DAD] opacity-80">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Loading State */}
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div
            className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#6A0DAD]"
            role="status"
            aria-label="Loading events"
          ></div>
        </div>
      ) : (
        <>
          {/* Empty State */}
          {filteredEvents.length === 0 && (
            <div className="text-center py-10 text-[#6A0DAD]" role="alert">
              <p>No events found.</p>
            </div>
          )}

          {/* Event Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((event) => (
              <motion.div
                key={event.id}
                className="bg-[rgba(255,215,0,0.2)] backdrop-blur-md rounded-lg p-6 shadow-[0_4px_12px_rgba(106,13,173,0.3)] text-[#6A0DAD]"
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                whileHover="hover"
                role="article"
              >
                <div className="flex items-center gap-4 mb-4">
                  <Image
                    src={event.image || "/event-placeholder.png"}
                    alt={`${event.name} image`}
                    width={80}
                    height={80}
                    className="rounded-lg object-cover"
                  />
                  <div>
                    <Link href={`/events/${event.id}`} className="text-lg font-semibold hover:underline">
                      {event.name}
                    </Link>
                    <p className="text-sm opacity-80">
                      {new Date(event.dateTime).toLocaleString()}
                    </p>
                    <p className="text-sm opacity-80">
                      {event.isVirtual ? (
                        <span className="badge badge-primary">Virtual</span>
                      ) : (
                        event.location
                      )}
                    </p>
                    <p className="text-sm opacity-80">Status: {event.status}</p>
                  </div>
                </div>
                <div className="space-y-2 mb-4">
                  <p className="text-sm">Ticket Sales: {event.ticketSales}</p>
                  <p className="text-sm">Revenue: ${event.totalRevenue.toLocaleString()}</p>
                  <p className="text-sm">Tickets Sold: {event.ticketsSoldPercentage}%</p>
                  <p className="text-sm">Engagement Score: {event.engagementScore}</p>
                  <p className="text-sm">
                    Demographics:{" "}
                    {event.attendeeDemographics
                      .map((demo) => `${demo.ageGroup}: ${demo.count}`)
                      .join(", ")}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 mb-4">
                  <Link
                    href={`/events/${event.id}`}
                    className="btn btn-sm bg-[#6A0DAD] text-white hover:bg-[#FFD700] hover:text-[#6A0DAD]"
                    aria-label={`View ${event.name}`}
                  >
                    View
                  </Link>
                  <Link
                    href={`/events/${event.id}/analytics`}
                    className="btn btn-sm bg-[#6A0DAD] text-white hover:bg-[#FFD700] hover:text-[#6A0DAD]"
                    aria-label={`View analytics for ${event.name}`}
                  >
                    Analytics
                  </Link>
                  <button
                    className="btn btn-sm bg-[#6A0DAD] text-white hover:bg-[#FFD700] hover:text-[#6A0DAD]"
                    onClick={() => toast.success("Promote functionality coming soon!")}
                    aria-label={`Promote ${event.name}`}
                  >
                    Promote
                  </button>
                </div>
                <div className="flex gap-2">
                  <button
                    className="btn btn-sm btn-circle bg-[#6A0DAD] text-white hover:bg-[#FFD700] hover:text-[#6A0DAD]"
                    onClick={() => shareEvent("x", event)}
                    aria-label={`Share ${event.name} on X`}
                  >
                    <FaTwitter aria-hidden="true" />
                  </button>
                  <button
                    className="btn btn-sm btn-circle bg-[#6A0DAD] text-white hover:bg-[#FFD700] hover:text-[#6A0DAD]"
                    onClick={() => shareEvent("facebook", event)}
                    aria-label={`Share ${event.name} on Facebook`}
                  >
                    <FaFacebook aria-hidden="true" />
                  </button>
                  <button
                    className="btn btn-sm btn-circle bg-[#6A0DAD] text-white hover:bg-[#FFD700] hover:text-[#6A0DAD]"
                    onClick={() => shareEvent("instagram", event)}
                    aria-label={`Share ${event.name} on Instagram`}
                  >
                    <FaInstagram aria-hidden="true" />
                  </button>
                  <button
                    className="btn btn-sm btn-circle bg-[#6A0DAD] text-white hover:bg-[#FFD700] hover:text-[#6A0DAD]"
                    onClick={() => shareEvent("tiktok", event)}
                    aria-label={`Share ${event.name} on TikTok`}
                  >
                    <FaTiktok aria-hidden="true" />
                  </button>
                  <button
                    className="btn btn-sm btn-circle bg-[#6A0DAD] text-white hover:bg-[#FFD700] hover:text-[#6A0DAD]"
                    onClick={() => shareEvent("whatsapp", event)}
                    aria-label={`Share ${event.name} on WhatsApp`}
                  >
                    <FaWhatsapp aria-hidden="true" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}