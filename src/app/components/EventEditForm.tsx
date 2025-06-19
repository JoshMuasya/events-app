"use client";

import { EventEditData, SpeakerOption, Speakers, SponsorOption, Sponsors, StaffOption, User } from '@/lib/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { z } from 'zod';
import Select from "react-select";
import { useAuth } from '@/lib/AuthContext';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select as ShadcnSelect, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Settings } from 'lucide-react';
import { auth } from '@/lib/firebase';

const eventEditSchema = z
  .object({
    eventName: z.string().min(1, "Event name is required").max(100, "Event name is too long"),
    date: z.string().min(1, "Date and time are required"),
    location: z.string().min(1, "Location is required").max(200, "Location is too long"),
    isVirtual: z.boolean(),
    status: z.enum(["Draft", "Published", "Unpublished", "Ongoing", "Cancelled", "Completed"], {
      errorMap: () => ({ message: "Status is required" }),
    }),
    image: z.union([z.instanceof(File), z.string().url(), z.string()]).optional().nullable(),
    primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Invalid hex color code"),
    secondaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Invalid hex color code"),
    backgroundColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Invalid hex color code"),
    textColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Invalid hex color code"),
    headingFont: z.enum(["Roboto", "Open Sans", "Montserrat", "Lora"], {
      errorMap: () => ({ message: "Invalid heading font" }),
    }),
    bodyFont: z.enum(["Roboto", "Open Sans", "Montserrat", "Lora"], {
      errorMap: () => ({ message: "Invalid body font" }),
    }),
    eventDesc: z.string().max(1000, "Description is too long"),
    agenda: z.string().max(2000, "Agenda is too long"),
    speakers: z.array(
      z.object({
        id: z.string(),
        speakerName: z.string().min(1, "Speaker name is required"),
        description: z.string().max(1000, "Description is too long"),
        profileImage: z.string().url("Invalid image URL").nullable(),
      })
    ),
    sponsors: z.array(
      z.object({
        sponsorId: z.string(),
        sponsorName: z.string().min(1, "Sponsor name is required"),
        sponsorLogo: z.string().url("Invalid image URL").nullable(),
      })
    ),
    ticketEnabled: z.boolean(),
    ticketPrice: z.number().nullable(),
    waitlistEnabled: z.boolean(),
    waitlistLimit: z.number().int().nullable(),
    category: z.enum(["Conference", "Workshop", "Concert", "Networking"], {
      errorMap: () => ({ message: "Invalid category" }),
    }),
    tags: z.string().max(200, "Tags are too long"),
    accessibilityInfo: z.string().max(500, "Accessibility information is too long"),
    contactEmail: z.string().email("Invalid email address"),
    contactPhone: z.string().max(20, "Phone number is too long"),
    assignedStaff: z.array(z.string()).optional(),
    isInvitesOnly: z.boolean(),
    maxAttendees: z.number().int().nullable(),
    createdAt: z.any().optional(),
    createdBy: z.string().optional(),
    eventId: z.string(),
  })
  .refine(
    (data) => !data.ticketEnabled || (data.ticketPrice !== null && data.ticketPrice > 0),
    {
      message: "Ticket price is required when tickets are enabled",
      path: ["ticketPrice"],
    }
  )
  .refine(
    (data) => !data.waitlistEnabled || (data.waitlistLimit !== null && data.waitlistLimit > 0),
    {
      message: "Waitlist limit is required when waitlist is enabled",
      path: ["waitlistLimit"],
    }
  )
  .refine(
    (data) => !data.isInvitesOnly || (data.maxAttendees !== null && data.maxAttendees > 0),
    {
      message: "Max attendees is required for invites-only events",
      path: ["maxAttendees"],
    }
  );

type FormData = z.infer<typeof eventEditSchema>;

const EventEditForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const params = useParams();
  const eventId = params.eventId as string;
  const [event, setEvent] = useState<EventEditData | undefined>();
  const { user: authUser, loading: authLoading, role: Role } = useAuth();
  const [eventUsers, setEventUsers] = useState<User[]>([]);
  const [eventSpeakers, setEventSpeakers] = useState<Speakers[]>([]);
  const [eventSponsors, setEventSponsors] = useState<Sponsors[]>([]);

  const fetchEvents = async () => {
    try {
      setIsLoading(true);
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
      setIsLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/users");
      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }
      const data = await response.json();
      setEventUsers(data);
    } catch (error) {
      console.error("Error fetching Users:", error);
      toast.error("Failed to load Users");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSpeakers = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/speakers");
      if (!response.ok) {
        throw new Error("Failed to fetch Speakers");
      }
      const data = await response.json();
      setEventSpeakers(data);
    } catch (error) {
      console.error("Error fetching Speakers:", error);
      toast.error("Failed to load Speakers");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSponsors = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/sponsors");
      if (!response.ok) {
        throw new Error("Failed to fetch Sponsors");
      }
      const data = await response.json();
      setEventSponsors(data);
    } catch (error) {
      console.error("Error fetching Sponsors:", error);
      toast.error("Failed to load Sponsors");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
    fetchUsers();
    fetchSpeakers();
    fetchSponsors();
  }, [eventId]);

  const form = useForm<FormData>({
    resolver: zodResolver(eventEditSchema),
    defaultValues: {
      eventName: "",
      date: "",
      location: "",
      isVirtual: false,
      status: "Draft",
      image: null,
      primaryColor: "#000000",
      secondaryColor: "#000000",
      backgroundColor: "#ffffff",
      textColor: "#000000",
      headingFont: "Roboto",
      bodyFont: "Roboto",
      eventDesc: "",
      agenda: "",
      speakers: [],
      ticketEnabled: false,
      ticketPrice: null,
      waitlistEnabled: false,
      waitlistLimit: null,
      category: undefined,
      tags: "",
      accessibilityInfo: "",
      contactEmail: "",
      contactPhone: "",
      assignedStaff: [],
      isInvitesOnly: false,
      maxAttendees: null,
    },
  });

  useEffect(() => {
    if (event && eventSpeakers.length > 0) {
      // Debug: Log data to identify mismatches
      console.log("Event Speakers IDs:", event.speakers);
      console.log("Available Speakers:", eventSpeakers);

      const mappedSpeakers = event.speakers
        ?.map(id => {
          const speaker = eventSpeakers.find(s => s.id === String(id)); // Normalize ID to string
          if (!speaker) {
            console.warn(`Speaker with ID ${id} not found in eventSpeakers`);
          }
          return speaker;
        })
        .filter((s): s is Speakers => s !== undefined && s !== null) || [];

      console.log("Mapped Speakers:", mappedSpeakers);

      const mappedSponsors = event.sponsors
        ?.map(id => {
          const sponsors = eventSponsors.find(spo => spo.sponsorId === String(id)); // Normalize ID to string
          if (!sponsors) {
            console.warn(`Sponsorswith ID ${id} not found in eventSponsors`);
          }
          return sponsors
        })
        .filter((spo): spo is Sponsors => spo !== undefined && spo !== null) || [];

      console.log("Mapped Sponsors:", mappedSponsors);

      form.reset({
        eventName: event.eventName || "",
        date: event.date || "",
        location: event.location || "",
        isVirtual: event.isVirtual || false,
        status: event.status || "Draft",
        image: event.image || null,
        primaryColor: event.primaryColor || "#000000",
        secondaryColor: event.secondaryColor || "#000000",
        backgroundColor: event.backgroundColor || "#ffffff",
        textColor: event.textColor || "#000000",
        headingFont: event.headingFont || "Roboto",
        bodyFont: event.bodyFont || "Roboto",
        eventDesc: event.eventDesc || "",
        agenda: event.agenda || "",
        speakers: mappedSpeakers,
        sponsors: mappedSponsors,
        ticketEnabled: event.ticketEnabled || false,
        ticketPrice: event.ticketPrice || null,
        waitlistEnabled: event.waitlistEnabled || false,
        waitlistLimit: event.waitlistLimit || null,
        category: event.category || undefined,
        tags: event.tags || "",
        accessibilityInfo: event.accessibilityInfo || "",
        contactEmail: event.contactEmail || "",
        contactPhone: event.contactPhone || "",
        assignedStaff: event.assignedStaff || [],
        isInvitesOnly: event.isInvitesOnly || false,
        maxAttendees: event.maxAttendees ?? null,
        createdAt: event.createdAt || undefined,
        createdBy: event.createdBy || "",
        eventId: event.eventId || eventId,
      });
    }
  }, [event, eventSpeakers, eventSponsors, form, eventId]);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        form.setValue("image", file);
      } catch (err) {
        toast.error("Failed to process image");
      }
    }
  };

  const getFirebaseToken = async () => {
    const user = await auth.currentUser

    if (!user) {
      return null
    }

    try {
      const idToken = await user.getIdToken(true);
      return idToken
    } catch (error) {
      console.error("Error getting ID token:", error);
      return null;
    }
  }

  const onSubmit = async (data: FormData) => {
    try {
      const idToken = await getFirebaseToken();
      if (!idToken) throw new Error("User not authenticated")

      const response = await fetch(`/api/events/event-management/${eventId}`, {
        method: 'PUT',
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`
        },
        body: JSON.stringify(data)
      });

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Failed to update event")
      }

      console.log("Event updated successfully:", result);
    } catch (error) {
      console.error("Error updating event:", error);
      throw error;
    }
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

  const buttonVariants = {
    hover: {
      scale: 1.05,
      boxShadow: "0 4px 12px rgba(106, 13, 173, 0.5)",
      transition: { duration: 0.2 },
    },
    tap: { scale: 0.95, transition: { duration: 0.1 } },
  };

  if (authLoading || isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-6 mt-20">
        <div className="bg-white/5 backdrop-blur-sm p-6 rounded-xl shadow-lg animate-pulse border border-white/10">

          {/* Icon and Page Title Placeholder */}
          <div className="flex items-center space-x-3 mb-8">
            <Settings className="h-6 w-6 text-gray-400 animate-spin" />
            <div className="h-6 bg-gray-300/30 rounded w-1/4" />
          </div>

          {/* Event Edit Form Skeleton */}
          <div className="space-y-6">
            {/* Event Title Input */}
            <div>
              <div className="h-4 bg-gray-400/50 rounded w-1/4 mb-2"></div>
              <div className="h-10 bg-gray-300/30 rounded w-full"></div>
            </div>

            {/* Event Date and Time Inputs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="h-4 bg-gray-400/50 rounded w-1/4 mb-2"></div>
                <div className="h-10 bg-gray-300/30 rounded w-full"></div>
              </div>
              <div>
                <div className="h-4 bg-gray-400/50 rounded w-1/4 mb-2"></div>
                <div className="h-10 bg-gray-300/30 rounded w-full"></div>
              </div>
            </div>

            {/* Event Location Input */}
            <div>
              <div className="h-4 bg-gray-400/50 rounded w-1/4 mb-2"></div>
              <div className="h-10 bg-gray-300/30 rounded w-full"></div>
            </div>

            {/* Image Upload Preview */}
            <div>
              <div className="h-4 bg-gray-400/50 rounded w-1/4 mb-2"></div>
              <div className="h-48 bg-gray-300/30 rounded-lg"></div>
            </div>

            {/* Description Textarea */}
            <div>
              <div className="h-4 bg-gray-400/50 rounded w-1/4 mb-2"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-300/30 rounded w-full"></div>
                <div className="h-4 bg-gray-300/30 rounded w-5/6"></div>
                <div className="h-4 bg-gray-300/30 rounded w-3/4"></div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-4 pt-4">
              <div className="h-10 w-32 bg-gray-300/30 rounded"></div>
              <div className="h-10 w-32 bg-gray-300/30 rounded"></div>
            </div>
          </div>
        </div>
      </div>

    );
  }

  return (
    <div className="container mx-auto p-6 mt-20">
      <AnimatePresence>
        <motion.div
          className="bg-[rgba(255,215,0,0.2)] backdrop-blur-md rounded-lg p-6 mb-6 shadow-[0_4px_12px_rgba(106,13,173,0.3)] text-[#6A0DAD]"
          variants={formVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          role="form"
          aria-labelledby="add-event-form-title"
        >
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="flex items-center space-x-3 mb-8"
          >
            <Settings className="h-6 w-6 text-[#6A0DAD]" />
            <h1 className="text-2xl font-bold text-[#6A0DAD]">
              Edit {event?.eventName}
            </h1>
          </motion.div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Event Name */}
              <FormField
                control={form.control}
                name="eventName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Event Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter event name"
                        className="bg-white text-[#6A0DAD]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Date & Time */}
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date & Time</FormLabel>
                    <FormControl>
                      <Input
                        type="datetime-local"
                        className="bg-white text-[#6A0DAD]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Location */}
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter location or virtual link"
                        className="bg-white text-[#6A0DAD]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Virtual Event */}
              <FormField
                control={form.control}
                name="isVirtual"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className="bg-white text-[#6A0DAD]"
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Virtual Event</FormLabel>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Status */}
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <FormControl>
                      <ShadcnSelect
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <SelectTrigger className="bg-white text-[#6A0DAD]">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Draft">Draft</SelectItem>
                          <SelectItem value="Published">Published</SelectItem>
                          <SelectItem value="Unpublished">Unpublished</SelectItem>
                          <SelectItem value="Ongoing">Ongoing</SelectItem>
                          <SelectItem value="Cancelled">Cancelled</SelectItem>
                          <SelectItem value="Completed">Completed</SelectItem>
                        </SelectContent>
                      </ShadcnSelect>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Event Image */}
              <FormField
                control={form.control}
                name="image"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Event Image</FormLabel>
                    <FormControl>
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="bg-white text-[#6A0DAD]"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Theme Settings */}
              <div className="md:col-span-2">
                <h3 className="text-lg font-medium mb-2">Theme Customization</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="primaryColor"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Primary Color</FormLabel>
                        <FormControl>
                          <Input
                            type="color"
                            className="bg-white"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="secondaryColor"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Secondary Color</FormLabel>
                        <FormControl>
                          <Input
                            type="color"
                            className="bg-white"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="backgroundColor"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Background Color</FormLabel>
                        <FormControl>
                          <Input
                            type="color"
                            className="bg-white"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="textColor"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Text Color</FormLabel>
                        <FormControl>
                          <Input
                            type="color"
                            className="bg-white"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="headingFont"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Heading Font</FormLabel>
                        <FormControl>
                          <ShadcnSelect
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <SelectTrigger className="bg-white text-[#6A0DAD]">
                              <SelectValue placeholder="Select heading font" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Roboto">Roboto</SelectItem>
                              <SelectItem value="Open Sans">Open Sans</SelectItem>
                              <SelectItem value="Montserrat">Montserrat</SelectItem>
                              <SelectItem value="Lora">Lora</SelectItem>
                            </SelectContent>
                          </ShadcnSelect>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="bodyFont"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Body Font</FormLabel>
                        <FormControl>
                          <ShadcnSelect
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <SelectTrigger className="bg-white text-[#6A0DAD]">
                              <SelectValue placeholder="Select body font" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Roboto">Roboto</SelectItem>
                              <SelectItem value="Open Sans">Open Sans</SelectItem>
                              <SelectItem value="Montserrat">Montserrat</SelectItem>
                              <SelectItem value="Lora">Lora</SelectItem>
                            </SelectContent>
                          </ShadcnSelect>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Description */}
              <FormField
                control={form.control}
                name="eventDesc"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Event Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter event description"
                        className="bg-white text-[#6A0DAD]"
                        rows={4}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Agenda */}
              <FormField
                control={form.control}
                name="agenda"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Agenda (Optional, can be detailed later)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter agenda or timeline (e.g., 9:00 AM - Welcome, 10:00 AM - Keynote)"
                        className="bg-white text-[#6A0DAD]"
                        rows={4}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Speakers */}
              <FormField
                control={form.control}
                name="speakers"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Speakers</FormLabel>
                    <div className="mb-2">
                      {field?.value?.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {field?.value.map((speaker, index) => (
                            <div
                              key={speaker.id}
                              className="bg-white text-[#6A0DAD] px-3 py-1 rounded-full border border-[#6A0DAD] flex items-center"
                            >
                              <span>{speaker.speakerName}</span>
                              <button
                                type="button"
                                onClick={() => {
                                  const updatedSpeakers = field?.value.filter((_, i) => i !== index);
                                  form.setValue("speakers", updatedSpeakers, { shouldValidate: true });
                                }}
                                className="ml-2 text-red-500 hover:text-red-700"
                                aria-label={`Remove ${speaker.speakerName} from speakers`}
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500">No speakers currently assigned</p>
                      )}
                    </div>
                    <FormControl>
                      <Select<SpeakerOption, true>
                        isMulti
                        options={eventSpeakers.map(speaker => ({
                          value: speaker.id,
                          label: speaker.speakerName,
                        }))}
                        value={[]}
                        onChange={(selected) => {
                          const selectedSpeakers = selected
                            ?.filter((s): s is SpeakerOption => s !== null)
                            .map(s => {
                              const speaker = eventSpeakers.find(sp => sp.id === s.value);
                              return {
                                id: s.value,
                                speakerName: speaker?.speakerName || "",
                                description: speaker?.description || "",
                                profileImage: speaker?.profileImage || null,
                              };
                            }) || [];
                          const updatedSpeakers = [...(field.value || []), ...selectedSpeakers];
                          form.setValue("speakers", updatedSpeakers, { shouldValidate: true });
                        }}
                        className="basic-multi-select"
                        classNamePrefix="select"
                        placeholder="Add more speakers..."
                        noOptionsMessage={() => "No additional speakers available"}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Sponsors */}
              <FormField
                control={form.control}
                name="sponsors"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Sponsors</FormLabel>
                    <div className="mb-2">
                      {field?.value?.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {field?.value.map((sponsor, index) => (
                            <div
                              key={sponsor.sponsorId}
                              className="bg-white text-[#6A0DAD] px-3 py-1 rounded-full border border-[#6A0DAD] flex items-center"
                            >
                              <span>{sponsor.sponsorName}</span>
                              <button
                                type="button"
                                onClick={() => {
                                  const updatedSponsors = field?.value.filter((_, i) => i !== index);
                                  form.setValue("sponsors", updatedSponsors, { shouldValidate: true });
                                }}
                                className="ml-2 text-red-500 hover:text-red-700"
                                aria-label={`Remove ${sponsor.sponsorName} from sponsors`}
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500">No sponsors currently assigned</p>
                      )}
                    </div>
                    <FormControl>
                      <Select<SponsorOption, true>
                        isMulti
                        options={eventSponsors.map(sponsor => ({
                          value: sponsor.sponsorId,
                          label: sponsor.sponsorName,
                        }))}
                        value={[]}
                        onChange={(selected) => {
                          const selectedSponsors = selected
                            ?.filter((s): s is SponsorOption => s !== null)
                            .map(s => {
                              const sponsor = eventSponsors.find(sp => sp.sponsorId === s.value);
                              return {
                                sponsorId: s.value,
                                sponsorName: sponsor?.sponsorName || "",
                                sponsorLogo: sponsor?.sponsorLogo || null,
                              };
                            }) || [];
                          const updatedSponsors = [...(field.value || []), ...selectedSponsors];
                          form.setValue("sponsors", updatedSponsors, { shouldValidate: true });
                        }}
                        className="basic-multi-select"
                        classNamePrefix="select"
                        placeholder="Add more sponsors..."
                        noOptionsMessage={() => "No additional sponsors available"}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Ticket Settings */}
              <div className="md:col-span-2">
                <h3 className="text-lg font-medium mb-2">Ticket Settings</h3>
                <FormField
                  control={form.control}
                  name="ticketEnabled"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          className="bg-white text-[#6A0DAD]"
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Enable Tickets</FormLabel>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {form.watch("ticketEnabled") && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                    <FormField
                      control={form.control}
                      name="ticketPrice"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Ticket Price</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              placeholder="Enter ticket price"
                              className="bg-white text-[#6A0DAD]"
                              {...field}
                              value={field.value ?? ""}
                              onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}
              </div>

              {/* Waitlist Settings */}
              <FormField
                control={form.control}
                name="waitlistEnabled"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className="bg-white text-[#6A0DAD]"
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Enable Waitlist</FormLabel>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {form.watch("waitlistEnabled") && (
                <FormField
                  control={form.control}
                  name="waitlistLimit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Waitlist Limit</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Enter waitlist limit"
                          className="bg-white text-[#6A0DAD]"
                          {...field}
                          value={field.value ?? ""}
                          onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {/* Category */}
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <FormControl>
                      <ShadcnSelect
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <SelectTrigger className="bg-white text-[#6A0DAD]">
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Conference">Conference</SelectItem>
                          <SelectItem value="Workshop">Workshop</SelectItem>
                          <SelectItem value="Concert">Concert</SelectItem>
                          <SelectItem value="Networking">Networking</SelectItem>
                        </SelectContent>
                      </ShadcnSelect>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Tags */}
              <FormField
                control={form.control}
                name="tags"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tags</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter tags (e.g., tech, free, networking)"
                        className="bg-white text-[#6A0DAD]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Accessibility Information */}
              <FormField
                control={form.control}
                name="accessibilityInfo"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Accessibility Information (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="e.g., Wheelchair accessible, sign language interpreter available"
                        className="bg-white text-[#6A0DAD]"
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Contact Information */}
              <FormField
                control={form.control}
                name="contactEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Organizer Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="Enter organizer email"
                        className="bg-white text-[#6A0DAD]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="contactPhone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Organizer Phone (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        type="tel"
                        placeholder="Enter organizer phone"
                        className="bg-white text-[#6A0DAD]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Assigned Staff */}
              <FormField
                control={form.control}
                name="assignedStaff"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Assigned Staff</FormLabel>
                    <div className="mb-2">
                      {(field.value?.length ?? 0) > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {field?.value?.map((id, index) => {
                            const user = eventUsers.find(u => u.id === id);
                            return user ? (
                              <div
                                key={user.id}
                                className="bg-white text-[#6A0DAD] px-3 py-1 rounded-full border border-[#6A0DAD] flex items-center"
                              >
                                <span>{user.name} ({user.role})</span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const updatedStaff = (field.value || []).filter(
                                      staffId => staffId !== user.id
                                    );
                                    form.setValue("assignedStaff", updatedStaff, { shouldValidate: true });
                                    setEvent(prev => {
                                      if (!prev) return prev; // If prev is undefined, return as is
                                      return {
                                        ...prev,
                                        assignedStaff: updatedStaff,
                                        eventName: prev.eventName || "",
                                        date: prev.date || "",
                                        location: prev.location || "",
                                        status: prev.status || "Draft",
                                        primaryColor: prev.primaryColor || "#000000",
                                        secondaryColor: prev.secondaryColor || "#000000",
                                        backgroundColor: prev.backgroundColor || "#ffffff",
                                        textColor: prev.textColor || "#000000",
                                        headingFont: prev.headingFont || "Roboto",
                                        bodyFont: prev.bodyFont || "Roboto",
                                        eventDesc: prev.eventDesc || "",
                                        agenda: prev.agenda || "",
                                        tags: prev.tags || "",
                                        accessibilityInfo: prev.accessibilityInfo || "",
                                        contactEmail: prev.contactEmail || "",
                                        contactPhone: prev.contactPhone || "",
                                        createdBy: prev.createdBy || "",
                                        eventId: prev.eventId || eventId,
                                      };
                                    });
                                  }}
                                  className="ml-2 text-red-500 hover:text-red-700"
                                  aria-label={`Remove ${user.name} from assigned staff`}
                                >
                                  ×
                                </button>
                              </div>
                            ) : null;
                          })}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500">No staff currently assigned</p>
                      )}
                    </div>
                    <FormControl>
                      <Select<StaffOption, true>
                        isMulti
                        options={eventUsers
                          .filter(user =>
                            ['organizer', 'staff'].includes(user.role.toLowerCase()) &&
                            !field.value?.includes(user.id)
                          )
                          .map(user => ({
                            value: user.id,
                            label: `${user.name} (${user.role})`,
                          }))}
                        value={[]}
                        onChange={(selected) => {
                          const selectedValues = selected
                            ?.filter((s): s is StaffOption => s !== null)
                            .map(s => s.value) || [];
                          const updatedStaff = [...(field.value || []), ...selectedValues];
                          form.setValue("assignedStaff", updatedStaff, { shouldValidate: true });
                          setEvent(prev => {
                            if (!prev) return prev; // If prev is undefined, return as is
                            return {
                              ...prev,
                              assignedStaff: updatedStaff,
                              eventName: prev.eventName || "",
                              date: prev.date || "",
                              location: prev.location || "",
                              status: prev.status || "Draft",
                              primaryColor: prev.primaryColor || "#000000",
                              secondaryColor: prev.secondaryColor || "#000000",
                              backgroundColor: prev.backgroundColor || "#ffffff",
                              textColor: prev.textColor || "#000000",
                              headingFont: prev.headingFont || "Roboto",
                              bodyFont: prev.bodyFont || "Roboto",
                              eventDesc: prev.eventDesc || "",
                              agenda: prev.agenda || "",
                              tags: prev.tags || "",
                              accessibilityInfo: prev.accessibilityInfo || "",
                              contactEmail: prev.contactEmail || "",
                              contactPhone: prev.contactPhone || "",
                              createdBy: prev.createdBy || "",
                              eventId: prev.eventId || eventId,
                            };
                          });
                        }}
                        className="basic-multi-select"
                        classNamePrefix="select"
                        placeholder="Add more staff..."
                        noOptionsMessage={() => "No additional staff available"}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Invites Only */}
              <FormField
                control={form.control}
                name="isInvitesOnly"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className="bg-white text-[#6A0DAD]"
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Invites Only</FormLabel>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Max Attendees */}
              {form.watch("isInvitesOnly") && (
                <FormField
                  control={form.control}
                  name="maxAttendees"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Max Attendees</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Enter max attendees"
                          className="bg-white text-[#6A0DAD]"
                          {...field}
                          value={field.value ?? ""}
                          onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {/* Submit and Cancel Buttons */}
              <div className="md:col-span-2 flex gap-4">
                <motion.div
                  whileHover="hover"
                  whileTap="tap"
                  variants={buttonVariants}
                >
                  <Button
                    type="submit"
                    disabled={form.formState.isSubmitting}
                    className="bg-[#6A0DAD] text-white hover:bg-[#FFD700] hover:text-[#6A0DAD] disabled:opacity-50"
                    aria-label={form.formState.isSubmitting ? "Saving event" : "Save event"}
                    variant="default"
                  >
                    {form.formState.isSubmitting ? "Saving..." : "Save Event"}
                  </Button>
                </motion.div>
              </div>
            </form>
          </Form>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default EventEditForm;