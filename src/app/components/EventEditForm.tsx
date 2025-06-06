"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiChevronDown, FiChevronUp } from "react-icons/fi";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import toast from "react-hot-toast";
import Select from "react-select";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { storage } from "@/lib/firebase";
import { format, isValid } from "date-fns";
import { EventDetail, Speakers, UserEvent } from "@/lib/types";

// Form schema for validation (same as in EventManagement for consistency)
const eventSchema = z
  .object({
    name: z.string().min(1, "Event name is required").max(100, "Event name is too long"),
    dateTime: z.string().min(1, "Date and time are required"),
    location: z.string().min(1, "Location is required").max(200, "Location is too long"),
    isVirtual: z.boolean(),
    googleMapsLink: z.string().url("Invalid Google Maps URL").optional(),
    status: z.enum(["Draft", "Ongoing", "Cancelled", "Published", "Completed"], { errorMap: () => ({ message: "Status is required" }) }),
    image: z.union([z.instanceof(File), z.string().url().optional(), z.string().optional()]).optional().nullable(),
    primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Invalid hex color code").optional(),
    secondaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Invalid hex color code").optional(),
    backgroundColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Invalid hex color code").optional(),
    textColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Invalid hex color code").optional(),
    headingFont: z.enum(["Roboto", "Open Sans", "Montserrat", "Lora"], {
      errorMap: () => ({ message: "Invalid heading font" }),
    }).optional(),
    bodyFont: z.enum(["Roboto", "Open Sans", "Montserrat", "Lora"], {
      errorMap: () => ({ message: "Invalid body font" }),
    }).optional(),
    eventDesc: z.string().max(1000, "Description is too long").optional(),
    agenda: z.string().max(2000, "Agenda is too long").optional(),
    existingSpeakers: z.array(z.string()).optional(),
    ticketEnabled: z.boolean().optional(),
    ticketPrice: z.number().positive("Ticket price must be positive").optional(),
    waitlistEnabled: z.boolean().optional(),
    waitlistLimit: z.number().int().positive("Waitlist limit must be positive").optional(),
    category: z.enum(["Conference", "Workshop", "Concert", "Networking", ""], {
      errorMap: () => ({ message: "Invalid category" }),
    }).optional(),
    tags: z.string().max(200, "Tags are too long").optional(),
    accessibilityInfo: z.string().max(500, "Accessibility information is too long").optional(),
    contactEmail: z.string().email("Invalid email address").optional(),
    contactPhone: z.string().max(20, "Phone number is too long").optional(),
    assignedStaff: z.array(z.string()),
    invitesOnly: z.boolean(),
    maxAttendees: z.number().int().positive().optional(),
  })
  .refine(
    (data) => !data.invitesOnly || (data.maxAttendees && data.maxAttendees > 0),
    {
      message: "Max attendees is required for invites-only events",
      path: ["maxAttendees"],
    }
  )
  .refine(
    (data) => !data.ticketEnabled || (data.ticketPrice && data.ticketPrice > 0),
    {
      message: "Ticket price is required when tickets are enabled",
      path: ["ticketPrice"],
    }
  )
  .refine(
    (data) => !data.waitlistEnabled || (data.waitlistLimit && data.waitlistLimit > 0),
    {
      message: "Waitlist limit is required when waitlist is enabled",
      path: ["waitlistLimit"],
    }
  )
  .refine(
    (data) => data.isVirtual || (data.googleMapsLink && data.googleMapsLink.length > 0),
    {
      message: "Google Maps link is required for non-virtual events",
      path: ["googleMapsLink"],
    }
  );

type FormData = z.infer<typeof eventSchema>;

interface EventEditFormProps {
  event: EventDetail;
  onClose: () => void;
  onUpdate: (updatedEvent: EventDetail) => void;
  staffUsers: UserEvent[];
  speakers: Speakers[];
}

export default function EventEditForm({ event, onClose, onUpdate, staffUsers, speakers }: EventEditFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Initialize react-hook-form
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    reset,
    watch,
  } = useForm<FormData>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      name: event.eventName,
      dateTime: format(new Date(event.date), "yyyy-MM-dd'T'HH:mm"),
      location: event.location,
      isVirtual: event.isVirtual ?? false,
      googleMapsLink: event.direction ?? "",
      status: event.status,
      image: event.image ?? "",
      primaryColor: event.primaryColor ?? "#000000",
      secondaryColor: event.secondaryColor ?? "#000000",
      backgroundColor: event.backgroundColor ?? "#FFFFFF",
      textColor: event.textColor ?? "#000000",
      headingFont: event.headingFont ?? "Roboto",
      bodyFont: event.bodyFont ?? "Roboto",
      eventDesc: event.eventDesc ?? "",
      agenda: event.agenda ?? "",
      existingSpeakers: event.speakers ?? [],
      ticketEnabled: event.ticketEnabled ?? false,
      ticketPrice: event.ticketPrice ?? 0,
      waitlistEnabled: event.waitlistEnabled ?? false,
      waitlistLimit: event.waitlistLimit ?? 0,
      category: event.category ?? "",
      tags: event.tags?.join(", ") ?? "",
      accessibilityInfo: event.accessibilityInfo ?? "",
      contactEmail: event.contactEmail ?? "",
      contactPhone: event.contactPhone ?? "",
      assignedStaff: event.assignedStaff ?? [],
      invitesOnly: event.invitesOnly ?? false,
      maxAttendees: event.maxAttendees ?? 0,
    },
  });

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
      setIsLoading(true);
      let downloadUrl = event.image || "";
      if (data.image && data.image instanceof File) {
        const imageRef = ref(storage, `events/${Date.now()}_${data.name}`);
        const snapshot = await uploadBytes(imageRef, data.image);
        downloadUrl = await getDownloadURL(snapshot.ref);
      }

      const cleanedData = {
        eventName: data.name,
        image: downloadUrl,
        createdBy: event.createdBy,
        assignedStaff: data.assignedStaff ?? [],
        ticketSales: event.ticketSales,
        totalRevenue: event.totalRevenue,
        isInvitesOnly: data.invitesOnly ?? false,
        maxAttendies: data.invitesOnly ? data.maxAttendees : null,
        status: data.status,
        location: data.location,
        isVirtual: data.isVirtual ?? false,
        date: data.dateTime,
        direction: data.googleMapsLink ?? null,
        primaryColor: data.primaryColor ?? null,
        secondaryColor: data.secondaryColor ?? null,
        backgroundColor: data.backgroundColor ?? null,
        textColor: data.textColor ?? null,
        headingFont: data.headingFont ?? null,
        bodyFont: data.bodyFont ?? null,
        eventDesc: data.eventDesc ?? null,
        agenda: data.agenda ?? null,
        speakers: data.existingSpeakers ?? [],
        ticketEnabled: data.ticketEnabled ?? false,
        ticketPrice: data.ticketPrice ?? null,
        waitlistEnabled: data.waitlistEnabled ?? false,
        waitlistLimit: data.waitlistLimit ?? null,
        category: data.category ?? null,
        tags: data.tags ? data.tags.split(",").map((t) => t.trim()) : [],
        accessibilityInfo: data.accessibilityInfo ?? null,
        contactEmail: data.contactEmail ?? null,
        contactPhone: data.contactPhone ?? null,
      };

      const response = await fetch(`/api/events/event-management/${event.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(cleanedData),
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || "Failed to update event");
      }

      const updatedEvent = await response.json();
      toast.success("Event Updated Successfully");
      onUpdate(updatedEvent);
      onClose();
      reset();
      setError(null);
    } catch (err) {
      toast.error("Failed to Update Event");
      setError(err instanceof Error ? err.message : "Failed to update event");
    } finally {
      setIsLoading(false);
    }
  };

  // Animation variants
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

  return (
    <AnimatePresence>
      <motion.div
        className="bg-[rgba(255,215,0,0.2)] backdrop-blur-md rounded-lg p-6 mb-6 shadow-[0_4px_12px_rgba(106,13,173,0.3)] text-[#6A0DAD]"
        variants={formVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        role="form"
        aria-labelledby="edit-event-form-title"
      >
        <div className="flex justify-between items-center mb-4">
          <h2 id="edit-event-form-title" className="text-xl font-bold">
            Edit Event: {event.eventName}
          </h2>
          <button
            onClick={onClose}
            className="text-[#6A0DAD] hover:text-[#7B17C0]"
            aria-label="Close edit event form"
          >
            <FiChevronDown size={24} aria-hidden="true" />
          </button>
        </div>
        {error && <p className="text-red-500 mb-4" role="alert">{error}</p>}
        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Event Name */}
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

          {/* Date & Time */}
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

          {/* Location */}
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

          {/* Virtual Event */}
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

          {/* Map Coordinates (for non-virtual events) */}
          {!watch("isVirtual") && (
            <div>
              <label htmlFor="googleMapsLink" className="block text-sm font-medium">
                Google Maps Link
              </label>
              <input
                id="googleMapsLink"
                type="url"
                {...register("googleMapsLink")}
                className="input input-bordered w-full bg-white text-[#6A0DAD]"
                placeholder="Enter Google Maps link (e.g., https://www.google.com/maps/...)"
                aria-invalid={errors.googleMapsLink ? "true" : "false"}
              />
              {errors.googleMapsLink && (
                <p className="text-red-500 text-sm" role="alert">
                  {errors.googleMapsLink.message}
                </p>
              )}
            </div>
          )}

          {/* Status */}
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
              <option value="Unpublished">Unpublished</option>
            </select>
            {errors.status && (
              <p className="text-red-500 text-sm" role="alert">
                {errors.status.message}
              </p>
            )}
          </div>

          {/* Event Image */}
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

          {/* Theme Settings */}
          <div className="md:col-span-2">
            <h3 className="text-lg font-medium mb-2">Theme Customization</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="primaryColor" className="block text-sm font-medium">
                  Primary Color
                </label>
                <input
                  id="primaryColor"
                  type="color"
                  {...register("primaryColor")}
                  className="input input-bordered w-full bg-white"
                  aria-invalid={errors.primaryColor ? "true" : "false"}
                />
                {errors.primaryColor && (
                  <p className="text-red-500 text-sm" role="alert">
                    {errors.primaryColor.message}
                  </p>
                )}
              </div>
              <div>
                <label htmlFor="secondaryColor" className="block text-sm font-medium">
                  Secondary Color
                </label>
                <input
                  id="secondaryColor"
                  type="color"
                  {...register("secondaryColor")}
                  className="input input-bordered w-full bg-white"
                  aria-invalid={errors.secondaryColor ? "true" : "false"}
                />
                {errors.secondaryColor && (
                  <p className="text-red-500 text-sm" role="alert">
                    {errors.secondaryColor.message}
                  </p>
                )}
              </div>
              <div>
                <label htmlFor="backgroundColor" className="block text-sm font-medium">
                  Background Color
                </label>
                <input
                  id="backgroundColor"
                  type="color"
                  {...register("backgroundColor")}
                  className="input input-bordered w-full bg-white"
                  aria-invalid={errors.backgroundColor ? "true" : "false"}
                />
                {errors.backgroundColor && (
                  <p className="text-red-500 text-sm" role="alert">
                    {errors.backgroundColor.message}
                  </p>
                )}
              </div>
              <div>
                <label htmlFor="textColor" className="block text-sm font-medium">
                  Text Color
                </label>
                <input
                  id="textColor"
                  type="color"
                  {...register("textColor")}
                  className="input input-bordered w-full bg-white"
                  aria-invalid={errors.textColor ? "true" : "false"}
                />
                {errors.textColor && (
                  <p className="text-red-500 text-sm" role="alert">
                    {errors.textColor.message}
                  </p>
                )}
              </div>
              <div>
                <label htmlFor="headingFont" className="block text-sm font-medium">
                  Heading Font
                </label>
                <select
                  id="headingFont"
                  {...register("headingFont")}
                  className="select select-bordered w-full bg-white text-[#6A0DAD]"
                  aria-invalid={errors.headingFont ? "true" : "false"}
                >
                  <option value="Roboto">Roboto</option>
                  <option value="Open Sans">Open Sans</option>
                  <option value="Montserrat">Montserrat</option>
                  <option value="Lora">Lora</option>
                </select>
                {errors.headingFont && (
                  <p className="text-red-500 text-sm" role="alert">
                    {errors.headingFont.message}
                  </p>
                )}
              </div>
              <div>
                <label htmlFor="bodyFont" className="block text-sm font-medium">
                  Body Font
                </label>
                <select
                  id="bodyFont"
                  {...register("bodyFont")}
                  className="select select-bordered w-full bg-white text-[#6A0DAD]"
                  aria-invalid={errors.bodyFont ? "true" : "false"}
                >
                  <option value="Roboto">Roboto</option>
                  <option value="Open Sans">Open Sans</option>
                  <option value="Montserrat">Montserrat</option>
                  <option value="Lora">Lora</option>
                </select>
                {errors.bodyFont && (
                  <p className="text-red-500 text-sm" role="alert">
                    {errors.bodyFont.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="md:col-span-2">
            <label htmlFor="description" className="block text-sm font-medium">
              Event Description
            </label>
            <textarea
              id="description"
              {...register("eventDesc")}
              className="textarea textarea-bordered w-full bg-white text-[#6A0DAD]"
              placeholder="Enter event description"
              rows={4}
              aria-invalid={errors.eventDesc ? "true" : "false"}
            />
            {errors.eventDesc && (
              <p className="text-red-500 text-sm" role="alert">
                {errors.eventDesc.message}
              </p>
            )}
          </div>

          {/* Agenda */}
          <div className="md:col-span-2">
            <label htmlFor="agenda" className="block text-sm font-medium">
              Agenda (Optional)
            </label>
            <textarea
              id="agenda"
              {...register("agenda")}
              className="textarea textarea-bordered w-full bg-white text-[#6A0DAD]"
              placeholder="Enter agenda or timeline (e.g., 9:00 AM - Welcome, 10:00 AM - Keynote)"
              rows={4}
              aria-invalid={errors.agenda ? "true" : "false"}
            />
            {errors.agenda && (
              <p className="text-red-500 text-sm" role="alert">
                {errors.agenda.message}
              </p>
            )}
          </div>

          {/* Existing Speakers */}
          <div className="md:col-span-2">
            <label htmlFor="existingSpeakers" className="block text-sm font-medium">
              Select Existing Speakers
            </label>
            <Select
              isMulti
              options={(speakers || []).map((speaker) => ({
                label: speaker.speakerName,
                value: speaker.speakerName,
              }))}
              defaultValue={event.speakers?.map((s) => ({ label: s, value: s }))}
              onChange={(selected) =>
                setValue("existingSpeakers", selected ? selected.map((s) => s.value) : [])
              }
              className="basic-multi-select"
              classNamePrefix="select"
              placeholder="Select speakers..."
            />
            {errors.existingSpeakers && (
              <p className="text-red-500 text-sm" role="alert">
                {errors.existingSpeakers.message}
              </p>
            )}
          </div>

          {/* Ticket Settings */}
          <div className="md:col-span-2">
            <h3 className="text-lg font-medium mb-2">Ticket Settings</h3>
            <div>
              <label htmlFor="ticketEnabled" className="block text-sm font-medium">
                Enable Tickets
              </label>
              <input
                id="ticketEnabled"
                type="checkbox"
                {...register("ticketEnabled")}
                className="checkbox checkbox-bordered bg-white text-[#6A0DAD]"
                aria-invalid={errors.ticketEnabled ? "true" : "false"}
              />
              {errors.ticketEnabled && (
                <p className="text-red-500 text-sm" role="alert">
                  {errors.ticketEnabled.message}
                </p>
              )}
            </div>
            {watch("ticketEnabled") && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                <div>
                  <label htmlFor="ticketPrice" className="block text-sm font-medium">
                    Ticket Price
                  </label>
                  <input
                    id="ticketPrice"
                    type="number"
                    step="0.01"
                    {...register("ticketPrice", { valueAsNumber: true })}
                    className="input input-bordered w-full bg-white text-[#6A0DAD]"
                    placeholder="Enter ticket price"
                    aria-invalid={errors.ticketPrice ? "true" : "false"}
                  />
                  {errors.ticketPrice && (
                    <p className="text-red-500 text-sm" role="alert">
                      {errors.ticketPrice.message}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Waitlist Settings */}
          <div>
            <label htmlFor="waitlistEnabled" className="block text-sm font-medium">
              Enable Waitlist
            </label>
            <input
              id="waitlistEnabled"
              type="checkbox"
              {...register("waitlistEnabled")}
              className="checkbox checkbox-bordered bg-white text-[#6A0DAD]"
              aria-invalid={errors.waitlistEnabled ? "true" : "false"}
            />
            {errors.waitlistEnabled && (
              <p className="text-red-500 text-sm" role="alert">
                {errors.waitlistEnabled.message}
              </p>
            )}
          </div>
          {watch("waitlistEnabled") && (
            <div>
              <label htmlFor="waitlistLimit" className="block text-sm font-medium">
                Waitlist Limit
              </label>
              <input
                id="waitlistLimit"
                type="number"
                {...register("waitlistLimit", { valueAsNumber: true })}
                className="input input-bordered w-full bg-white text-[#6A0DAD]"
                placeholder="Enter waitlist limit"
                aria-invalid={errors.waitlistLimit ? "true" : "false"}
              />
              {errors.waitlistLimit && (
                <p className="text-red-500 text-sm" role="alert">
                  {errors.waitlistLimit.message}
                </p>
              )}
            </div>
          )}

          {/* Category */}
          <div>
            <label htmlFor="category" className="block text-sm font-medium">
              Category
            </label>
            <select
              id="category"
              {...register("category")}
              className="select select-bordered w-full bg-white text-[#6A0DAD]"
              aria-invalid={errors.category ? "true" : "false"}
            >
              <option value="">Select a category</option>
              <option value="Conference">Conference</option>
              <option value="Workshop">Workshop</option>
              <option value="Concert">Concert</option>
              <option value="Networking">Networking</option>
            </select>
            {errors.category && (
              <p className="text-red-500 text-sm" role="alert">
                {errors.category.message}
              </p>
            )}
          </div>

          {/* Tags */}
          <div>
            <label htmlFor="tags" className="block text-sm font-medium">
              Tags
            </label>
            <input
              id="tags"
              {...register("tags")}
              className="input input-bordered w-full bg-white text-[#6A0DAD]"
              placeholder="Enter tags (e.g., tech, free, networking)"
              aria-invalid={errors.tags ? "true" : "false"}
            />
            {errors.tags && (
              <p className="text-red-500 text-sm" role="alert">
                {errors.tags.message}
              </p>
            )}
          </div>

          {/* Accessibility Information */}
          <div className="md:col-span-2">
            <label htmlFor="accessibilityInfo" className="block text-sm font-medium">
              Accessibility Information (Optional)
            </label>
            <textarea
              id="accessibilityInfo"
              {...register("accessibilityInfo")}
              className="textarea textarea-bordered w-full bg-white text-[#6A0DAD]"
              placeholder="e.g., Wheelchair accessible, sign language interpreter available"
              rows={3}
              aria-invalid={errors.accessibilityInfo ? "true" : "false"}
            />
            {errors.accessibilityInfo && (
              <p className="text-red-500 text-sm" role="alert">
                {errors.accessibilityInfo.message}
              </p>
            )}
          </div>

          {/* Contact Information */}
          <div>
            <label htmlFor="contactEmail" className="block text-sm font-medium">
              Organizer Email
            </label>
            <input
              id="contactEmail"
              type="email"
              {...register("contactEmail")}
              className="input input-bordered w-full bg-white text-[#6A0DAD]"
              placeholder="Enter organizer email"
              aria-invalid={errors.contactEmail ? "true" : "false"}
            />
            {errors.contactEmail && (
              <p className="text-red-500 text-sm" role="alert">
                {errors.contactEmail.message}
              </p>
            )}
          </div>
          <div>
            <label htmlFor="contactPhone" className="block text-sm font-medium">
              Organizer Phone (Optional)
            </label>
            <input
              id="contactPhone"
              type="tel"
              {...register("contactPhone")}
              className="input input-bordered w-full bg-white text-[#6A0DAD]"
              placeholder="Enter organizer phone"
              aria-invalid={errors.contactPhone ? "true" : "false"}
            />
            {errors.contactPhone && (
              <p className="text-red-500 text-sm" role="alert">
                {errors.contactPhone.message}
              </p>
            )}
          </div>

          {/* Assigned Staff */}
          <div>
            <label htmlFor="assignedStaff" className="block text-sm font-medium">
              Assigned Staff
            </label>
            <Select
              isMulti
              options={(staffUsers || []).map((user) => ({ value: user.id, label: user.name }))}
              defaultValue={event.assignedStaff?.map((id) => {
                const user = staffUsers.find((u) => u.id === id);
                return { value: id, label: user?.name || "Unknown" };
              })}
              onChange={(selected) =>
                setValue("assignedStaff", selected ? selected.map((s) => s.value) : [])
              }
              className="basic-multi-select"
              classNamePrefix="select"
            />
          </div>

          {/* Invites Only */}
          <div>
            <label htmlFor="invitesOnly" className="block text-sm font-medium">
              Invites Only
            </label>
            <input
              id="invitesOnly"
              type="checkbox"
              {...register("invitesOnly")}
              className="checkbox checkbox-bordered bg-white text-[#6A0DAD]"
            />
          </div>

          {/* Max Attendees */}
          {watch("invitesOnly") && (
            <div>
              <label htmlFor="maxAttendees" className="block text-sm font-medium">
                Max Attendees
              </label>
              <input
                id="maxAttendees"
                type="number"
                {...register("maxAttendees", { valueAsNumber: true })}
                className="input input-bordered w-full bg-white text-[#6A0DAD]"
                placeholder="Enter max attendees"
              />
              {errors.maxAttendees && (
                <p className="text-red-500 text-sm" role="alert">
                  {errors.maxAttendees.message}
                </p>
              )}
            </div>
          )}

          {/* Submit and Cancel Buttons */}
          <div className="md:col-span-2 flex gap-4">
            <button
              type="submit"
              disabled={isSubmitting || isLoading}
              className="btn bg-[#6A0DAD] text-white hover:bg-[#FFD700] hover:text-[#6A0DAD] disabled:opacity-50"
              aria-label={isSubmitting || isLoading ? "Saving event" : "Save event"}
            >
              {isSubmitting || isLoading ? "Saving..." : "Save Changes"}
            </button>
            <button
              type="button"
              onClick={() => {
                onClose();
                reset();
                setError(null);
              }}
              className="btn bg-gray-500 text-white hover:bg-gray-600"
              aria-label="Cancel editing event"
            >
              Cancel
            </button>
          </div>
        </form>
      </motion.div>
    </AnimatePresence>
  );
}