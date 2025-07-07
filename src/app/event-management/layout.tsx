"use client"

import { AuthProvider } from "@/lib/AuthContext";
import React from "react";
import TopNavbar from "../components/TopNavbar";
import SideBar from "../components/SideBar";
import { usePathname } from "next/navigation";

export default function EventLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isGuestEvent = pathname.includes("guest-event");

  return (
    <AuthProvider>
      {!isGuestEvent && <TopNavbar />}
      {!isGuestEvent && <SideBar />}
      {children}
    </AuthProvider>
  );
}