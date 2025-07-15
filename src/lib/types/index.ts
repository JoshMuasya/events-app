import { createContext } from "react";
import { UseFormReturn } from "react-hook-form";

export type Role = 'Admin' | 'Organizer' | 'Staff';

export interface AuthContextType {
    user: any; // Replace with firebase.User | null for better typing
    role: Role | null;
    loading: boolean;
}

export const AuthContext = createContext<AuthContextType>({
    user: null,
    role: null,
    loading: true,
});

export interface User {
    id: string;
    name: string;
    email: string;
    phone: string;
    image: string | File;
    role: Role
}

export interface UserDetail {
    id: string;
    name: string;
    email: string;
    phone: string;
    image: string | null;
    role: Role;
    photoURL: string | null;
}

export type FormState = Omit<User, 'id'> & { image: string | File };

export type UserTableProps = {
    users: User[];
};

export interface UserEditProps {
    users: User;
    onUserUpdated?: () => void;
}

export type UserField = "name" | "email" | "phone" | "role";

export interface UserEvent {
    id: string;
    name: string;
}

export interface EventDetail {
    id: string;
    eventName: string;
    date: string;
    status: "Draft" | "Ongoing" | "Cancelled" | "Published" | "Completed";
    location: string;
    coordinates?: { lat: number; lng: number };
    isVirtual: boolean;
    ticketSales: number;
    totalRevenue: number;
    ticketsSoldPercentage: number;
    attendeeDemographics: { ageGroup: string; count: number }[];
    engagementScore: number;
    image?: string;
    createdBy: string;
    createdByName: string;
    assignedStaff: string[];
    assignedStaffNames: string[];
    invitesOnly: boolean;
    maxAttendees?: number;
    contactPhone: string;
    contactEmail: string;
    accessibilityInfo: string;
    tags: string;
    category: "Conference" | "Workshop" | "Concert" | "Networking"
    waitlistLimit: number;
    waitlistEnabled: boolean;
    ticketPrice: number;
    ticketEnabled: boolean;
    speakers: string[];
    agenda: string;
    eventDesc: string;
    bodyFont: "Roboto" | "Open Sans" | "Montserrat" | "Lora";
    headingFont: "Roboto" | "Open Sans" | "Montserrat" | "Lora";
    textColor: string;
    backgroundColor: string;
    secondaryColor: string;
    primaryColor: string;
    direction: string;
    sponsors: string[];
    attendies: Attendees;
}

export type EventEditData = {
  eventName: string;
  date: string;
  location: string;
  isVirtual: boolean;
  direction: string;
  status: "Draft" | "Published" | "Unpublished" | "Ongoing" | "Cancelled" | "Completed";
  image: string | null;
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  textColor: string;
  headingFont: "Roboto" | "Open Sans" | "Montserrat" | "Lora";
  bodyFont: "Roboto" | "Open Sans" | "Montserrat" | "Lora";
  eventDesc: string;
  agenda: string | null;
  speakers: string[]; // Firebase stores speaker IDs
  ticketEnabled: boolean;
  ticketPrice: number | null;
  waitlistEnabled: boolean;
  waitlistLimit: number | null;
  category: "Conference" | "Workshop" | "Concert" | "Networking";
  tags: string;
  accessibilityInfo: string | null;
  contactEmail: string;
  contactPhone: string;
  assignedStaff: string[];
  isInvitesOnly: boolean;
  maxAttendees: number | null;
  createdAt: { seconds: number; nanoseconds: number } | null;
  createdBy: string;
  eventId: string;
  sponsors: string[];
};

export interface Sponsors {
    sponsorId: string;
    sponsorName: string;
    sponsorLogo: string;
}

export interface Attendees {
    maxAttendies: string;
    currentAttendies: string;
}

export interface Speakers {
    id: string;
    speakerName: string;
    description: string;
    profileImage: string | null;
}

export interface EventStyling {
    bodyFont: "Roboto" | "Open Sans" | "Montserrat" | "Lora";
    headingFont: "Roboto" | "Open Sans" | "Montserrat" | "Lora";
    textColor: string;
    backgroundColor: string;
    secondaryColor: string;
    primaryColor: string;
}

export type EventHeaderProps = {
    event: EventDetail;
    liveData: { attendees: number; ticketsRemaining: number | string };
};

export type EventSponsorsProps = {
    sponsors: string[];
    secondaryColor: string;
};

export type EventSpeakersProps = {
    speakers: string[];
};

export type EventSponsorsIdProps = {
    sponsors: string[][];
};

export type EventDescriptionProps = {
    description: string;
};

export type EventMapProps = {
    isVirtual: boolean;
    direction?: string | null;
};

export type EventActionsProps = {
    isStaff: boolean;
    event: EventDetail;
    user: any | null;
    isEventOver: boolean;
    rsvpForm: UseFormReturn<{ name: string; email: string }>;
    ticketCheckForm: UseFormReturn<{ email: string; code: string }>;
    rsvpResult: string | null;
    ticketInfo: { code: string; qrCode: string } | null;
    waitlistJoined: boolean;
    handleRsvpSubmit: (data: { name: string; email: string }) => Promise<void>;
    handleTicketCheckSubmit: (data: { email: string; code: string }) => Promise<void>;
    handlePurchaseTickets: () => Promise<void>;
    handleEdit: () => void;
    handleDelete: () => Promise<void>;
    handleManageRsvps: () => void;
    handleManageTickets: () => void;
};

export type VirtualEventFeaturesProps = {
    isVirtual: boolean;
};

export type EventFeedbackProps = {
    isEventOver: boolean;
    showFeedback: boolean;
    feedbackForm: UseFormReturn<{ rating: number; comments?: string }>;
    handleFeedbackSubmit: (data: { rating: number; comments?: string }) => Promise<void>;
    setShowFeedback: (value: boolean) => void;
    primaryColor: string;
};

export type EventAnalyticsProps = {
    isStaff: boolean;
    eventId: string;
};

export type EventSidebarProps = {
    event: EventDetail;
    handleAddToCalendar: () => void;
    shareEvent: (platform: string) => void;
};

type RecommendedEvent = {
    id: string;
    eventName: string;
    date: string;
    image?: string;
};

export type RecommendedEventsProps = {
    recommendedEvents: RecommendedEvent[];
    primaryColor: string;
};

export type ErrorStateProps = {
    error: string | null;
    errorSource?: string;
    errorDetails?: string;
};

export interface EventLayoutProps {
    event: EventDetail;
    children: React.ReactNode;
}

export type RecommendedEventHook = {
    id: string;
    eventName: string;
    date: string;
    image?: string;
};

export interface StaffEventActionsProps {
    isStaff: boolean;
    event: EventDetail;
    handleEdit: () => void;
    handleDelete: () => Promise<void>;
    handleManageRsvps: () => void;
    handleManageTickets: () => void;
    handleSendEventLink: () => void;
}

export interface GuestEventActionsProps {
    event: EventDetail;
    handleGuestRsvp: () => void;
    handleBuyTickets: () => void;
}

export type StaffOption = {
    value: string;
    label: string;
};

export type SpeakerOption = {
  value: string;
  label: string;
};

export type SponsorOption = {
  value: string;
  label: string;
};

export interface TicketListProps {
  eventId: string;
  event: { title: string; description: string; date: string; location: string };
}

export interface TicketType {
  id: string;
  eventId: string;
  type: string;
  price: number;
  availability: number;
  perks: string[];
  status: string;
}

export interface TicketForm {
  id?: string;
  type: string;
  price: number;
  availability: number;
  perks: string[];
  status?: string;
}

export interface TicketManagerProps {
  eventId: string;
}

export interface SelectedTicket {
  id: string;
  type: string;
  price: number;
  quantity: number;
}

export interface DeleteTicketRequest {
  ticketId: string;
}

export interface UpdateTicketRequest {
    ticketId: string;
    updates: Partial<TicketForm>;
}